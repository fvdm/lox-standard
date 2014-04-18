/*jshint boss:true, expr:true, onevar:false */

var DD, BubbleTarget;

BubbleTarget = Y.Base.create('bubbleTarget', Y.Base, [], {});

DD = Y.Base.create('dd', Y.View, [], {
    DEBUG: false,

    dropHighlight: false,

    initializer: function() {
        this._ddMap || (this._ddMap = []);

        // Set the cursor for drag proxies.
        Y.DD.DDM.set('dragCursor', 'default');

        // Pass the event through a bubble target, so we get the first event in the chain
        this.bubbleTarget = new BubbleTarget();
        this.bubbleTarget.addTarget(this);
        this.bubbleTarget.on('drop:hit', this._rednoseDropHit, this);

        Y.DD.DDM._debugShim = this.DEBUG;
    },

    destructor: function () {
        Y.Array.each(this._ddMap, function (dd) {
            dd.destroy();
        });

        this._ddMap = [];
    },

    // -- Node setup ---------------------------------------------------------------

    /**
     * Create a new drag instance from a DOM node.
     */
    createDrag: function (node, groups, data) {
        node.addClass('rednose-dd-drag');

        var dd = new Y.DD.Drag({
            node         : node,
            data         : data,
            groups       : groups,
            bubbleTargets: this,
            target       : true
        });

        dd.plug(Y.Plugin.DDProxy, {
            moveOnEnd  : false,
            borderStyle: 'none'
        });

        this._ddMap.push(dd);

        return dd;
    },

    /**
     * Create a new drop instance from a DOM node.
     */
    createDrop: function (node, groups, data) {
        node.addClass('rednose-dd-drop');

        var dd = new Y.DD.Drop({
            node         : node,
            data         : data,
            groups       : groups,
            bubbleTargets: this
        });

        this._ddMap.push(dd);

        return dd;
    },

    destroyDrag: function (node) {
        var dd = Y.DD.DDM.getDrag(node);

        dd.destroy();

        node.hasClass('rednose-dd-drag') && node.removeClass('rednose-dd-drag');
    },

    _rednoseDropHit: function (e) {
        // Workaround: We can't detect the rednose-global-drop node from e.drop.get('node'), because it doesn't bubble
        // properly. We can however block this node in the 'drop:over' and 'drop:enter' events, resulting in the parentNode
        // of the drag node being null.
        if (e.drag.get('node').get('parentNode') === null) {
            e.stopImmediatePropagation();
        }
    },

    // -- Event handlers -----------------------------------------------------------

    _handleStart: function (e) {
        var drag = e.target;
        var proxy = drag.get('node').cloneNode(true).addClass('rednose-dd-drag-proxy');

        drag.get('dragNode').set('innerHTML', proxy.get('outerHTML'));

        drag.get('node').addClass('rednose-dd-drag-placeholder');
        drag.get('node').get('childNodes').setStyle('visibility', 'hidden');
    },

    /**
     * Handles the end of a drag event.
     */
    _handleEnd: function (e) {
        var drag = e.target;

        // Remove the original event bindings and connect them to this object.
        Y.Array.each(drag.getTargets(), function (n) {
            drag.removeTarget(n);
        });

        drag.addTarget(this);

        // FIXME: The event handler stacks up, detaching it once limits it to 2 for new nodes.
        drag.detach('drag:end', this._handleEnd);

        // Reprep since we (potentially) have changed the drag node
        drag._unprep();
        drag._prep();

        drag.get('node').addClass('rednose-dd-drag');

        drag.get('node').removeClass('rednose-dd-drag-placeholder');
        drag.get('dragNode').set('innerHTML', '');

        drag.get('node').get('childNodes').setStyle('visibility', '');
    },

    /**
     * Triggered when a drag item is dragged over a drop item
     */
    _dropOver: function (e) {
        var drop = e.drop.get('node'),
            drag = e.drag.get('node');

        if (drop.hasClass('rednose-global-drop')) {
            return;
        }

        if (drop.get('tagName').toLowerCase() !== 'li') {
            if (!drop.contains(drag)) {
                drop.appendChild(drag);
                Y.DD.DDM.syncActiveShims(true);
            }
        }
    },

    /**
     * Handles dragging into a drop region.
     */
    _dropEnter: function (e) {
        if (!e.drag || !e.drop || (e.drop !== e.target)) {
            return;
        }
        if (e.drop.get('node').get('tagName').toLowerCase() === 'li') {
            this._moveItem(e.drag, e.drop);
        }
    },

    _moveItem: function(drag, drop) {
        var dragNode = drag.get('node'),
            dropNode = drop.get('node'),
            append = false,
            //padding = 5,
            padding = 10,
            xy = drag.mouseXY,
            region = drop.region,
            middle1 = region.top + ((region.bottom - region.top) / 2),
            middle2 = region.left + ((region.right - region.left) / 2),
            dir = false,
            dir1 = false,
            dir2 = false,
            next,
            ul;

        if (dropNode.hasClass('rednose-global-drop')) {
            return;
        }

        // Resize the proxy if necessary
        if (dropNode.get('tagName').toLowerCase() !== 'ul') {
            // Traverse up to find the ul node
            ul = dropNode.ancestor('ul');
        } else {
            ul = dropNode;
        }

        if (ul) {
            // Set the width on a child of the proxy, as the width of proxy itself gets overriden constantly while dragging
            var node = Y.DD.DDM.activeDrag.get('dragNode');
            var width = ul.get('offsetWidth');

            Y.Rednose.Anim.width(node, width);
        }

        // Insert the placeholder at the correct index
        if ((xy[1] < (region.top + padding))) {
            dir1 = 'top';
        }

        if ((region.bottom - padding) < xy[1]) {
            dir1 = 'bottom';
        }

        if ((region.right - padding) < xy[0]) {
            dir2 = 'right';
        }

        if ((xy[0] < (region.left + padding))) {
            dir2 = 'left';
        }

        dir = dir2;

        if (dir2 === false) {
            dir = dir1;
        }

        switch (dir) {
            case 'top':
                next = dropNode.get('nextSibling');
                if (next) {
                    dropNode = next;
                } else {
                    append = true;
                }
                break;

            case 'bottom':
                break;

            case 'right':
            case 'left':
                break;
        }

        if ((dropNode !== null) && dir) {
            if (dropNode && dropNode.get('parentNode')) {
                if (!append) {
                    dropNode.get('parentNode').insertBefore(dragNode, dropNode);
                } else {
                    dropNode.get('parentNode').appendChild(dragNode);
                }

                // Resync all the targets because something moved.
                Y.DD.DDM.syncActiveShims(true);
            }
        }
    },

    // -- Hover Event handlers -----------------------------------------------------------

    /**
     * Bind hover and prevent hover stacking.
     */
    _handleMouseEnter: function (e) {
        var target = e.currentTarget;

        if (target.ancestor('.rednose-dd-drag-hover')) {
            target.ancestor('.rednose-dd-drag-hover').replaceClass('rednose-dd-drag-hover', 'rednose-dd-drag-hover-disabled');
        }

        if (target.one('.rednose-dd-drag-hover')) {
            target.addClass('rednose-dd-drag-hover-disabled');
        } else {
            target.addClass('rednose-dd-drag-hover');
        }
    },

    /**
     * Bind hover and prevent hover stacking.
     */
    _handleMouseLeave: function (e) {
        var target = e.currentTarget;

        if (target.hasClass('rednose-dd-drag-hover')) {
            target.removeClass('rednose-dd-drag-hover');
        }

        if (target.ancestor('.rednose-dd-drag-hover-disabled')) {
            target.ancestor('.rednose-dd-drag-hover-disabled').replaceClass('rednose-dd-drag-hover-disabled', 'rednose-dd-drag-hover');
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DD = DD;
