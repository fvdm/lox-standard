YUI.add('rednose-nodescroll', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Node scroll utility - Configures a node containing DD nodes to automatically scroll when dragging.

@module rednose-nodescroll
**/
var TRIGGER_MARGIN = 25,

    CSS_SCROLL_VIEW = 'rednose-scroll-view',

    /**
    Fired when the node is scrolling.

    @event scrolling
    **/
    EVT_SCROLLING = 'scrolling';

/**
A base class for Nodescroll, providing:
<ul>
   <li>Adds the needed scrolling CSS to the node</li>
   <li>Binds to the provided DD groups</li>
</ul>

Quick Example:<br/>

<pre><code>var instance = new Y.Rednose.NodeScroll({
    container: this.get('container').one('.example-scroll-view'),
    groups: ['rednose-treeview']
});
</code></pre>

@class NodeScroll
@namespace Rednose
@param {Object} [config] The following configuration properties are required:
    @param {Object} [config.container] The container to bind the scrollview to.
    @param {Array} [config.groups] The DD groups that can interact with this
        scrollview instance.
@constructor
@extends Base
**/
var NodeScroll = Y.Base.create('nodescroll', Y.Base, [], {
    // -- Protected Properties -------------------------------------------------

    /**
    Reference to the currently active animation instance.

    @property {Anim} _anim
    @default null
    @protected
    **/
    _anim: null,

    // -- Lifecycle Methods ----------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        var container = this.get('container'),
            groups    = this.get('groups');

        container.addClass(CSS_SCROLL_VIEW);

        this._bindDD(container, groups);

        this.on('drop:over', this._handle, this);
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        var container = this.get('container');

        container.hasClass(CSS_SCROLL_VIEW) && container.removeClass(CSS_SCROLL_VIEW);

        this._anim = null;
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    @method _bindDD
    @protected
    **/
    _bindDD: function (node, groups) {
        new Y.DD.Drop({
            node         : node,
            bubbleTargets: this,
            groups       : groups
        });
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Scroll the view up or down when a drag reaches the boundaries on the Y axis

    @method _handle
    @param {EventFacade} e Even
    @protected
    **/
    _handle: function (e) {
        var dropNode    = e.drop.get('node'),
            dragY       = e.drag.mouseXY[1],
            nodeHeight  = dropNode.get('offsetHeight'),
            margin      = TRIGGER_MARGIN,
            relativeY   = dragY - margin,
            self        = this,
            node,
            scrollFunc;

        // Determine scrolling direction (if needed)
        if (relativeY > nodeHeight) {
            scrollFunc = function() {
                return [0, node.get('scrollTop') + node.get('offsetHeight')];
            };
        } else if (relativeY < TRIGGER_MARGIN) {
            scrollFunc = function() {
                return [0, node.get('scrollTop') - node.get('offsetHeight')];
            };
        } else {
            if (this._anim) {
                if (this._anim.get('running')) {
                    this._anim.stop();
                    Y.DD.DDM.syncActiveShims(true);
                }
            }
        }

        // Scroll
        if (scrollFunc) {
            node = dropNode;

            if (this._anim === null) {
                this._anim = new Y.Anim({
                    node: node,
                    to: {
                        scroll: scrollFunc
                    },
                    easing: Y.Easing.easeOut,
                    duration: (0.01 * node.get('offsetHeight'))
                });
            }

            this._anim.set('to', { scroll: scrollFunc });
            this._anim.run();
            this._anim.on('tween', function() {
                self.fire(EVT_SCROLLING);
            });
            this._anim.on('end', function() {
                Y.DD.DDM.syncActiveShims(true);
            });
        }
    }
}, {
    ATTRS : {
        /**
        The scrollable container.

        @attribute {Object}
        @default null
        **/
        container: {
            value: null
        },

        /**
        The DD groups that can interact with this scroll instance.

        @attribute {Array}
        @default []
        **/
        groups: {
            value: []
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').NodeScroll = NodeScroll;


}, '1.4.0', {"requires": ["node", "event", "dd", "anim"]});
