YUI.add('rednose-breadcrumb', function (Y, NAME) {

/* jshint expr:true, onevar:false */

/**
Provides an interactive breadcrumb based on a path.

@module renodse-breadcrumb
**/
var CSS_BOOTSTRAP_BREADCRUMB = 'breadcrumb',
    CSS_BOOTSTRAP_DIVIDER    = 'divider',
    CSS_BOOTSTRAP_ACTIVE     = 'active',

    ATTR_DATA_ENTRY = 'data-rednose-entry',

    // Value for the top-level crumb.
    TEXT_HOME = 'Home',

    /**
    @event navigate
    **/
    EVT_NAVIGATE = 'navigate';

/**
Provides an interactive breadcrumb based on a path.

@class Breadcrumb
@namespace Rednose
@constructor
@extends View
**/
var Breadcrumb = Y.Base.create('breadcrumb', Y.View, [], {
    // -- Protected Properties ---------------------------------------------

    /**
    Template for the breadcrumb <ul/>
    @property
    @type {String}
    @protected
    **/
    _UL_TEMPLATE: '<ul class="{className}"></ul>',

    /**
    Template for the breadcrumb <li/> items
    @property
    @type {String}
    @protected
    **/
    _LI_ITEM_TEMPLATE: '<li><a href="#">{itemLabel}</a> <span class="{dividerClass}">/</span></li>',

    /**
    Template for the breadcrumb trailing <li/> item
    @property
    @type {String}
    @protected
    **/
    _LI_ITEM_TRAILING_TEMPLATE: '<li class="{activeClass}"><span>{itemLabel}</span></li>',

    /**
    UI delegation events

    @property events
    @type {Object}
    @protected
    **/
    events: {
        'a': {
            click: '_handleClick'
        }
    },

    /**
    @property _breadcrumbs
    @type {Array}
    @protected
    **/
    _breadcrumbs: [],

    // -- Lifecycle Methods ------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        var container = this.get('container');

        container.setContent(Y.Lang.sub(this._UL_TEMPLATE, {
            className: CSS_BOOTSTRAP_BREADCRUMB
        }));

        this.after('pathChange', this.render, this);
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        this._breadcrumbs = null;
    },

    // -- Public Methods ---------------------------------------------------

    /**
    @method render
    @public
    @chainable
    **/
    render: function () {
        var container = this.get('container'),
            items     = this._breadcrumbs,
            self      = this;

        container.one('ul').empty();

        if (items instanceof Array && items.length > 0) {
            Y.Array.each(items, function (item, index) {
                var li;

                if ((index + 1) === items.length) {
                    li = Y.Node.create(Y.Lang.sub(self._LI_ITEM_TRAILING_TEMPLATE, {
                        activeClass: CSS_BOOTSTRAP_ACTIVE,
                        itemLabel  : item.label
                    }));
                } else {
                    li = Y.Node.create(Y.Lang.sub(self._LI_ITEM_TEMPLATE, {
                        dividerClass: CSS_BOOTSTRAP_DIVIDER,
                        itemLabel   : item.label
                    }));
                }

                if (item.data) {
                    li.setAttribute(ATTR_DATA_ENTRY, item.data);
                }

                container.one('ul').append(li);
            });
        }

        return this;
    },

    // -- Protected Event Handlers -----------------------------------------

    /**
    @method _handleClick
    @param {EventFacade} e The event
    @protected
    **/
    _handleClick: function (e) {
        e.preventDefault();

        var li   = e.currentTarget.ancestor('li'),
            data = li.getAttribute(ATTR_DATA_ENTRY);

        if (data) {
            this.fire(EVT_NAVIGATE, { data: data });
        }
    },

    /**
    Setter, update the breadcrumbs after parsing the path string.

    @method _setPath
    @param {String} path Path
    @protected
    **/
    _setPath: function (path) {
        var parts      = path === '/' ? [ TEXT_HOME ] : path.split('/'),
            pathBuffer = '/';
            crumbs     = [];

        Y.Array.each(parts, function (part) {
            pathBuffer += part;

            crumbs.push({
                label: part === '' ? TEXT_HOME : part,
                data : pathBuffer
            });

            pathBuffer !== '/' && (pathBuffer += '/');
        });

        this._breadcrumbs = crumbs;

        return path;
    }
}, {
    ATTRS: {
        /**
        Set the path for the breadcrumbs.

        @attribute path
        @type {String}
        **/
        path: {
            // Call the setter instantly when initializing the object.
            lazyAdd: false,
            value  : '/',
            setter : '_setPath'
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Breadcrumb = Breadcrumb;


}, '1.4.0', {"requires": ["base", "view"]});
