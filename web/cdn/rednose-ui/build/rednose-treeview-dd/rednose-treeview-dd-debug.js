YUI.add('rednose-treeview-dd', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

var DD,

    CSS_BOOTSTRAP_ICON_WHITE = 'icon-white';

/**
 * Drag and drop extension for the TreeView.
 */
DD = Y.Base.create('dd', Y.Base, [], {

    // -- Protected Properties -------------------------------------------------

    _callbacks: {},

    /**
     * DD references store
     */
    _ddMap: [],

    // -- Lifecycle Methods ----------------------------------------------------

    initializer: function () {
        this._ddMap = [];

        this.get('dragdrop') && this._attachDdEvents();
    },

    destructor: function () {
        this._destroyDd();
        this._detachDdEvents();

        this._callbacks = null;
        this._ddMap     = null;
    },

    // -- Public Methods -------------------------------------------------------

    addCallback: function(group, callback, context) {
        this._callbacks[group] = {
            callback: callback,
            context: context
        };
    },

    /**
     * Update all the the DD shims
     * Most likely used in combination with rednose-nodescroll (scrolling event).
     */
    sizeShims: function() {
        for (var i in this._ddMap) {
            if (typeof(this._ddMap[i].sizeShim) === 'function') {
                this._ddMap[i].sizeShim();
            }
        }
    },

    // -- Protected Methods ----------------------------------------------------

    _handleBind: function (parent) {
        var nodes = parent.one('.' + this.classNames.children).all('[data-rednose-type]:not(.rednose-treeview-drag)'),
            self  = this;

        nodes.each(function (node) {
            var model = self.getNodeById(node.getData('node-id')).data;

            self._createDd(node, model);

            // FIXME: Use a more generic way to specify droppable models.
            if (model instanceof Y.TB.Category) {
                // This is a category model. Categories allow dropping.
                var catDD = new Y.DD.Drop({
                    node         : node,
                    groups       : self.get('groups'),
                    bubbleTargets: self
                });

                node.addClass('rednose-treeview-drop');
                node.addClass('rednose-dd-drop');
                self._ddMap.push(catDD);
            }
        });

        this.header && this._bindHeader();
    },

    _bindHeader: function () {
        var container  = this.get('container'),
            dd;

        dd = new Y.DD.Drop({
            node         : container.one('.nav-header'),
            // Only allow categories to drop here.
            groups       : [ Y.stamp(this) ],
            bubbleTargets: this
        });

        this._attachHeaderEvents(dd);
        this._ddMap.push(dd);
    },

    _createDd: function (node, data) {
        var groups = this.get('groups'),
            self   = this,
            dd;

        if (data instanceof Y.TB.Category) {
            groups = groups.concat([ Y.stamp(this) ]);
        }

        // Add an extra unique group for the category drags.
        dd = new Y.DD.Drag({
            node         : node,
            data         : data,
            groups       : groups,
            bubbleTargets: self
        });

        dd.plug(Y.Plugin.DDProxy, {
            moveOnEnd  : false,
            borderStyle: 'none'
        });

        node.addClass('rednose-treeview-drag');
        this._ddMap.push(dd);

        return dd;
    },

    _attachDdEvents: function () {
        this._ddEventHandles || (this._ddEventHandles = []);

        this._ddEventHandles.push(
            // Setup the initial DD instances when the view is rendered.
            Y.Do.after(this._afterRender, this, 'render', this),

            this.on({
                'drop:enter': this._handleDdEnter,
                'drop:exit' : this._handleDdExit,
                'drag:start': this._handleStart,
                'drop:hit'  : this._handleDrop
            }),

            this.after('open', this._handleDdOpen)
        );
    },

    _attachHeaderEvents: function (dd) {
        this._ddEventHandles.push(
            dd.on({
                'drop:enter': this._handleHeaderEnter,
                'drop:exit' : this._handleHeaderExit
            })
        );
    },

    _detachDdEvents: function () {
        (new Y.EventHandle(this._ddEventHandles)).detach();
    },

    /**
     * All DD references must be destoyed if the model is reloaded.
     */
    _destroyDd: function() {
        for (var i in this._ddMap) {
            if (this.ddMap[i]) {
                this._ddMap[i].destroy();
            }
        }

        this._ddMap.length = 0;
    },

    // -- Protected Event Handlers ---------------------------------------------

    _afterRender: function () {
        this._destroyDd();
        this._handleBind(this.get('container'));
    },

    _handleHeaderEnter: function (e) {
        var node = e.drop.get('node').ancestor('.rednose-treeview-outer-container');

        node.addClass('rednose-treeview-drop-over-global');
    },

    _handleHeaderExit: function (e) {
        var node = e.drop.get('node').ancestor('.rednose-treeview-outer-container');

        node.hasClass('rednose-treeview-drop-over-global') && node.removeClass('rednose-treeview-drop-over-global');
    },

    _handleDdOpen: function (e) {
        var treeNode = e.node,
            htmlNode = this.getHTMLNode(treeNode);

        this._handleBind(htmlNode);
    },

    _handleDdEnter: function (e) {
       if (e.drop.get('node').one('.rednose-treeview-icon')) {
            e.drop.get('node').one('.rednose-treeview-icon').addClass(CSS_BOOTSTRAP_ICON_WHITE);
        }
    },

    _handleDdExit: function (e) {
        // FIXME: Ignore selected nodes
        if (!e.drop.get('node').get('parentNode').hasClass('yui3-treeview-selected')) {
            e.drop.get('node').all('.' + CSS_BOOTSTRAP_ICON_WHITE).removeClass(CSS_BOOTSTRAP_ICON_WHITE);
        }
    },

    _handleStart: function (e) {
        var drag = e.target,
            model,
            container,
            origin,
            dd;

        model = drag.get('data');

        drag.get('dragNode').setContent(
            drag.get('node').get('outerHTML')
        );

        drag.get('dragNode').all('.' + CSS_BOOTSTRAP_ICON_WHITE).removeClass(CSS_BOOTSTRAP_ICON_WHITE);

        // Recreate the drag instance
        origin = drag.get('node');

        drag._prep();

        drag.detachAll('drag:start');

        container = Y.Node.create('<div></div>');
        drag.set('node', container);

        drag.set('target', true);
        drag._prep();

        dd = this._createDd(origin, model);
    },

    _handleDrop: function (e) {
        var model    = this.get('model'),
            obj      = e.drag.get('data'),
            dropNode = e.drop.get('node'),
            newCat   = dropNode.hasClass('nav-header') ? null: this.getNodeById(dropNode.getData('node-id')).data;
            callback = false,
            self     = this;

        Y.all('.rednose-treeview-drop-over-global').removeClass('rednose-treeview-drop-over-global');

        if (!e.drop.get('node').get('parentNode').hasClass('yui3-treeview-selected')) {
            e.drop.get('node').all('.' + CSS_BOOTSTRAP_ICON_WHITE).removeClass(CSS_BOOTSTRAP_ICON_WHITE);
        }

        // Check for custom override callbacks
        Y.Array.each(e.drag.get('groups'), function (group) {
            if (group in self._callbacks) {
                var config = self._callbacks[group];

                e.drop.set('data', newCat);
                config.callback.apply(config.context, [e]);

                callback = true;
            }
        });

        if (callback) {
            return true;
        }

        if (obj) {
            var property      = obj instanceof Y.TB.Category ? 'parent' : 'category',
                oldCat        = obj.get(property),
                oldCatModelID = oldCat ? oldCat.id : null,
                newCatModelID = newCat ? newCat.get('id') : null;

            if (oldCatModelID !== newCatModelID) {
                obj.set(property, newCat);
                obj.save(function () { model.load(); });
            }
        }
    }
}, {
    ATTRS: {
        dragdrop: {
            value : false
        },

        groups: {
            value : ['rednose-treeview']
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.TreeView').DD = DD;


}, '1.1.0-DEV', {"requires": ["rednose-dd", "rednose-treeview"]});
