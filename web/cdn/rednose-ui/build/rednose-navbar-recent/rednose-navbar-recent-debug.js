YUI.add('rednose-navbar-recent', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
Provides a navigation bar plugin to show a list of recent entries.

@module rednose-navbar-recent
**/
var TXT_CLEAR_ITEMS = 'Clear Items',

    COOKIE_NAME = 'recent',

    MAX_MENU_SIZE = 5,

    CSS_BOOTSTRAP_DISABLED = 'disabled',
    CSS_BOOTSTRAP_DIVIDER  = 'divider',
    CSS_BOOTSTRAP_MENU     = 'dropdown-menu',
    CSS_BOOTSTRAP_SUBMENU  = 'dropdown-submenu';

/**
Provides a navigation bar plugin to show a list of recent entries.

@class Recent
@namespace Rednose.NavBar
@constructor
@extends Plugin.Base
@extensionfor Rednose.NavBar
**/
var Recent = Y.Base.create('recentNavbarPlugin', Y.Plugin.Base, [], {
    // -- Lifecycle Methods ----------------------------------------------------

    /**
    Stores a reference to the top level <li> node for this item.

    @property {Node} _itemNode
    @protected
    **/
    _itemNode: null,

    /**
    The node identifier for this recent items set.

    @property {String} _node
    @protected
    **/
    _node: null,

    /**
    The unique identifier for this recent items set.

    @property {String} _scope
    @protected
    **/
    _scope: null,

    /**
    @method initializer
    @protected
    **/
    initializer: function (config) {
        var host = this.get('host');

        this._scope = config.scope;
        this._node  = config.node;

        host.after('render', this._afterRender, this);
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        this._itemNode = null;
        this._scope    = null;
    },

    // -- Public Methods -------------------------------------------------------

    /**
    @method addEntry
    @param {String} id Unique id
    @param {String} label Menu entry label
    @public
    **/
    addEntry: function (id, label) {
        var cookie     = Y.Cookie.getSub(COOKIE_NAME, this._scope),
            attrs      = { id: id, label: label },
            cookieData = Y.JSON.parse(cookie) || [];

        // Remove duplicate elements.
        Y.each(cookieData, function (el, key) {
            if (el.id === attrs.id) {
                cookieData.splice(key, 1);
            }
        });

        // Prepend.
        cookieData.unshift(attrs);

        // Keep the maximum size.
        if (cookieData.length > MAX_MENU_SIZE) {
            cookieData.pop();
        }

        // JSON encode the cookie data.
        cookie = Y.JSON.stringify(cookieData);

        Y.Cookie.setSub(COOKIE_NAME, this._scope, cookie);

        this._renderMenu();
    },

    /**
     @method clearEntries
     @public
     **/
    clearEntries: function () {
        Y.Cookie.setSub(COOKIE_NAME, this._scope, null);

        this._renderMenu();
    },

    /**
    @method _renderMenu
    @protected
    **/
    _renderMenu: function () {
        var host       = this.get('host'),
            cookieData = Y.JSON.parse(Y.Cookie.getSub(COOKIE_NAME, this._scope));


        if (!cookieData || !Y.Object.size(cookieData)) {
            this._itemNode.addClass(CSS_BOOTSTRAP_DISABLED);
            this._itemNode.one('ul') && this._itemNode.one('ul').remove(true);

            if (this._itemNode.hasClass(CSS_BOOTSTRAP_SUBMENU)) {
                this._itemNode.removeClass(CSS_BOOTSTRAP_SUBMENU);
            }

            return;
        }

        if (this._itemNode.hasClass(CSS_BOOTSTRAP_DISABLED)) {
            this._itemNode.removeClass(CSS_BOOTSTRAP_DISABLED);
        }

        if (!this._itemNode.hasClass(CSS_BOOTSTRAP_SUBMENU)) {
            this._itemNode.addClass(CSS_BOOTSTRAP_SUBMENU);
        }

        if (!this._itemNode.one('ul')) {
            this._itemNode.append(Y.Node.create('<ul class="' + CSS_BOOTSTRAP_MENU + '"></ul>'));
        }

        var subMenuNode = this._itemNode.one('ul');

        subMenuNode.empty();

        // Append entries.
        Y.each(cookieData, function (item) {
            var entryNode = Y.Node.create('<li><a tabindex="-1" href="#"></a></li>');

            entryNode.one('a').setAttribute('data-id', item.id);
            entryNode.one('a').setContent(item.label);
            subMenuNode.append(entryNode);
        });

        // Append divider.
        subMenuNode.append(Y.Node.create('<li class="' + CSS_BOOTSTRAP_DIVIDER + '"></li>'));

        // Append 'Clear Items' entry.
        subMenuNode.append(Y.Node.create(Y.Lang.sub(
            '<li>' +
                '<a class="menu-clearitems" tabindex="-1" href="#">{clearItems}</a>' +
            '</li>',
            { clearItems: TXT_CLEAR_ITEMS }
        )));
    },

    /**
     @method _handleClick
     @param {EventFacade} e Click event.
     @protected
     **/
    _handleClick: function (e) {
        e.preventDefault();

        // Ignore clicks on the rootnode.
        if (e.currentTarget.get('parentNode') === this._itemNode) {
            return;
        }

        var host  = this.get('host'),
            aNode = e.currentTarget;

        if (aNode.hasClass('menu-clearitems')) {
            this.clearEntries();

            return;
        }

        var entryId = this._itemNode.one('a').getAttribute('data-id'),
            itemId  = aNode.getAttribute('data-id');

       host.fire(entryId, { id: itemId });
    },

    /**
     @method _afterRender
     @param {EventFacade} e Click event.
     @protected
     **/
    _afterRender: function (e) {
        var host = this.get('host');

        this._itemNode = host.getNode(this._node).get('parentNode');
        this._itemNode.delegate('click', this._handleClick, 'a', this);

        this._renderMenu();
    }
}, {
    NS: 'recent'
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Navbar').Recent = Recent;


}, '1.1.0-DEV', {"requires": ["cookie", "plugin", "rednose-navbar"]});
