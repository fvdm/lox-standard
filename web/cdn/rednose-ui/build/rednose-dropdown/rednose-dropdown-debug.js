YUI.add('rednose-dropdown', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
 * @class Rednose.DropdownItem
 * @param {Rednose.Dropdown} dropdown
 * @param {Object} [config]
 * @constructor
 */
function DropdownItem(dropdown, config) {
    config || (config = {});

    this.dropdown = dropdown;
    this.id       = config.id || Y.stamp(this);
    this.type     = config.type || 'item';
    this.url      = config.url || '#';
    this.children = [];

    Y.mix(this, config);
}

DropdownItem.prototype = {
    /**
     * The id for this node.
     *
     * @property {string} title
     * @readOnly
     */

    /**
     * The dropdown instance.
     *
     * @property {Rednose.Dropdown} dropdown
     * @readOnly
     */

    /**
     * This node's children.
     *
     * @property {Array} children
     * @readOnly
     */

    /**
     * This node's type.
     *
     * @property {String} type
     * @readOnly
     */

    /**
     * Whether this node is disabled or not.
     *
     * @property {Boolean} disabled
     * @readOnly
     */

    /**
     * The icon for this node.
     *
     * @property {Boolean} disabled
     * @readOnly
     */

    /**
     * The title for this node.
     *
     * @property {String} title
     * @readOnly
     */

    /**
     * The URL for this node.
     *
     * @property {String} url
     * @readOnly
     */

    /**
     * Custom HTML for this node.
     *
     * @property {String} html
     * @readOnly
     */

    // -- Public Methods -------------------------------------------------------

    /**
     * Enables this item.
     */
    enable: function () {
        this.dropdown.enableItem(this);

        return this;
    },

    /**
     * Disables this item.
     *
     * @chainable
     */
    disable: function () {
        this.dropdown.disableItem(this);

        return this;
    },

    /**
     * Renames this item.
     *
     * @param {String} title
     */
    rename: function (title) {
        this.dropdown.renameItem(this, title);

        return this;
    },

    /**
     * Whether this node is disabled or not.
     *
     * @return {Boolean}
     */
    isDisabled: function () {
        return this.disabled === true;
    },

    /**
     * Whether this node has children or not.
     *
     * @return {Boolean}
     */
    hasChildren: function () {
        return this.children && this.children.length > 0;
    },

    /**
     * Adds a child to this node.
     *
     * @param {Rednose.DropdownItem} child
     */
    addChild: function (child) {
        this.children.push(child);
    }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DropdownItem = DropdownItem;
/*jshint boss:true, expr:true, onevar:false */

/**
 * @event enable
 * @param {Rednose.DropdownItem}
 * @preventable _defEnableFn
 */
var EVT_ENABLE = 'enable';

/**
 * @event disable
 * @param {Rednose.DropdownItem}
 * @preventable _defDisableFn
 */
var EVT_DISABLE = 'disable';

/**
 * @event rename
 * @param {Rednose.DropdownItem}
 * @preventable _defRenameFn
 */
var EVT_RENAME = 'rename';

/**
 * Fired when the dropdown is closed.
 *
 * @event close
 * @preventable _defCloseFn
 */
var EVT_CLOSE = 'close';

/**
 * Fired the dropdown is opened.
 *
 * @event open
 * @preventable _defOpenFn
 */
var EVT_OPEN = 'open';

/**
 * Fired when the menu items are reset.
 *
 * @event reset
 * @param {Array} items New menu items
 * @preventable _defResetFn
 **/
EVT_RESET = 'reset';

var DropdownBase = Y.Base.create('dropdownBase', Y.Base, [], {

    /**
     * Whether the dropdown is currenty open or not.
     *
     * @property {Boolean} open
     * @default false
     * @protected
     */
    _open: false,

    /**
     * Root items for this dropdown.
     *
     * @property {Array} _rootItems
     * @protected
     */

    /**
     * Mapping of item ids to item instances.
     *
     * @property {Object} _itemMap
     * @protected
     */

    // -- Lifecycle methods ----------------------------------------------------

    initializer: function (config) {
        this._published = {};

        if (config.items) {
            this.reset(config.items);
        }
    },

    destructor: function () {
        this._rootItems = null;
        this._itemMap   = null;
        this._published = null;
    },

    // -- Public methods -------------------------------------------------------

    /**
     * Resets the items in this dropdown.
     *
     * @param {Array} items
     * @chainable
     */
    reset: function (items) {
        return this._fireDropdownEvent(EVT_RESET, {
            items: items
        }, {
            defaultFn: this._defResetFn
        });
    },

    /**
     * Opens the dropdown.
     *
     * @chainable
     */
    open: function () {
        if (!this.isOpen()) {
            this._fireDropdownEvent(EVT_OPEN, {}, {
                defaultFn: this._defOpenFn
            });
        }

        return this;
    },

    /**
     * Closes the dropdown.
     *
     * @chainable
     */
    close: function () {
        if (this.isOpen()) {
            this._fireDropdownEvent(EVT_CLOSE, {}, {
                defaultFn: this._defCloseFn
            });
        }

        return this;
    },

    /**
     * Toggles the dropdown.
     *
     * @chainable
     */
    toggle: function () {
        return this[this.isOpen() ? 'close' : 'open']();
    },

    /**
     * Whether the dropdown is currenty open or not.
     *
     * @return {Boolean}
     */
    isOpen: function () {
        return this._open;
    },

    /**
     * @param {String} id
     * @return {Rednose.DropdownItem}
     * @private
     */
    getItemById: function (id) {
        return this._itemMap[id];
    },

    /**
     * @param {Rednose.DropdownItem} item
     * @chainable
     */
    enableItem: function (item) {
        if (item.isDisabled()) {
            this._fireDropdownEvent(EVT_ENABLE, {item: item}, {
                defaultFn: this._defEnableFn
            });
        }

        return this;
    },

    /**
     * @param {Rednose.DropdownItem} item
     * @chainable
     */
    disableItem: function (item) {
        if (!item.isDisabled()) {
            this._fireDropdownEvent(EVT_DISABLE, {item: item}, {
                defaultFn: this._defDisableFn
            });
        }

        return this;
    },

    /**
     * @param {Rednose.DropdownItem} item
     * @param {String} title
     * @chainable
     */
    renameItem: function (item, title) {
        this._fireDropdownEvent(EVT_RENAME, {item: item, title: title}, {
            defaultFn: this._defRenameFn
        });

        return this;
    },

    // -- Protected methods ----------------------------------------------------

    /**
     * Create a dropdown item.
     *
     * @param {Object} config
     * @return {Rednose.DropdownItem}
     * @private
     */
    _createItem: function (config) {
        var dropdownItem = new Y.Rednose.DropdownItem(this, config);

        if (config.children) {
            for (var i = 0, len = config.children.length; i < len; i++) {
                dropdownItem.addChild(this._createItem(config.children[i]));
            }
        }

        if (dropdownItem.id in this._itemMap) {
            dropdownItem.id = Y.stamp(dropdownItem);
        }

        this._itemMap[dropdownItem.id] = dropdownItem;

        return dropdownItem;
    },

    /**
     * Create a dropdown item.
     *
     * @param {Rednose.DropdownItem} item
     * @private
     */
    _destroyItem: function (item) {
        if (item.hasChildren()) {
            for (var i = 0, len = item.children.length; i < len; i++) {
                this._destroyItem(item.children[i]);
            }
        }

        item.dropdown = null;
        item.children = null;

        delete this._itemMap[item.id];
    },

    /**
     * Utility method for lazily publishing events,
     *
     * @param {String} name
     * @param {Object} facade
     * @param {Object} options
     * @chainable
     * @private
     */
    _fireDropdownEvent: function (name, facade, options) {
        if (options && options.defaultFn && !this._published[name]) {
            this._published[name] = this.publish(name, {
                defaultFn: options.defaultFn
            });
        }

        this.fire(name, facade);

        return this;
    },

    // -- Default Event Handlers -----------------------------------------------

    /**
     * @param {EventFacade} e
     * @private
     */
    _defResetFn: function (e) {
        var items = e.items;

        if (this._rootItems && this._rootItems.length > 0) {
            for (var i = 0; i < this._rootItems.length; i++) {
                this._destroyItem(this._rootItems[i]);
            }
        }

        this._rootItems = [];
        this._itemMap   = {};

        if (items) {
            for (var j = 0; j < items.length; j++) {
                this._rootItems.push(this._createItem(items[j]));
            }
        }
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defDisableFn: function (e) {
        e.item.disabled = true;
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defEnableFn: function (e) {
        e.item.disabled = false;
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defRenameFn: function (e) {
        e.item.title = e.title;
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defOpenFn: function (e) {
        this._open = true;
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defCloseFn: function (e) {
        this._open = false;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DropdownBase = DropdownBase;
/*jshint boss:true, expr:true, onevar:false */

/**
 * Provides the Y.Rednose.Dropdown widget.
 *
 * @module rednose-dropdown
 */

var Micro = Y.Template.Micro;

/**
 * Dropdown widget.
 *
 * @class Dropdown
 * @constructor
 * @param {Object} [config] Config options.
 * @param {Array} [config.items] Dropdown items.
 * @extends Rednose.DropdownBase
 * @uses View
 */

/**
 * Fired when a menu item is clicked.
 *
 * You can subscribe to specific menu item through the following event: "select#id".
 *
 * @event select
 * @param {Rednose.DropdownItem} item The item that was clicked.
 * @param {EventFacade} originEvent Original click event.
 * @preventable _defSelectFn
 */
var EVT_SELECT = 'select';

var Dropdown = Y.Base.create('dropdown', Y.Rednose.DropdownBase, [Y.View], {

    /**
     * Templates used by this dropdown.
     *
     * @property {Object} templates
     */
    templates: {
        menu: Micro.compile(
            '<ul class="<%= data.classNames.menu %>"></ul>'
        ),

        caret: Micro.compile(
            '<%== data.content %> <span class="<%= data.classNames.caret %>"></span>'
        ),

        item: Micro.compile(
            '<% if (data.item.type === "divider") { %>' +
                '<li class="<%= data.classNames.divider %>"></li>' +
            '<% } else { %>' +
                    '<li class="' +
                        '<% if (data.item.isDisabled()) { %>' +
                            '<%= data.classNames.disabled %> ' +
                        '<% } %>' +
                        '<% if (data.item.hasChildren()) { %>' +
                            '<%= data.classNames.submenu %>' +
                        '<% } %>' +
                    '">' +

                    '<% if (data.item.html) { %>' +
                        '<%== data.item.html %>' +
                    '<% } else { %>' +
                        '<a href="<%= data.item.url %>" data-id="<%= data.item.id %>">' +
                            '<% if (data.item.icon) { %>' +
                                '<i class="<%= data.classNames.icon %> <%= data.item.icon %>"></i> ' +
                            '<% } %>' +
                            '<%= data.item.title %>' +
                        '</a>' +
                    '<% } %>' +

                '</li>' +
            '<% } %>'
        ),

        content: Micro.compile(
            '<% if (data.item.icon) { %>' +
                '<i class="<%= data.classNames.icon %> <%= data.item.icon %>"></i> ' +
                '<% } %>' +
            '<%= data.item.title %>'
        )
    },

    /**
     * CSS class names used by this dropdown.
     *
     * @property {Object} classNames
     */
    classNames: {
        disabled: 'disabled',
        caret   : 'caret',
        menu    : 'dropdown-menu',
        toggle  : 'dropdown-toggle',
        open    : 'open',
        divider : 'divider',
        dropdown: 'dropdown',
        dropup  : 'dropup',
        icon    : 'icon',
        submenu : 'dropdown-submenu'
    },

    /**
     * Whether or not this dropdown has been rendered.
     *
     * @property {Boolean} rendered
     * @default false
     */
    rendered: false,

    // -- Lifecycle methods ----------------------------------------------------

    initializer: function (config) {
        // Allow all extensions to initialize in case they provide custom getters for the container.
        this.onceAfter('initializedChange', function () {
            this.get('container').addClass(this.classNames.dropdown);

            this._attachDropdownEvents();
        });
    },

    destructor: function () {
        this._detachDropdownEvents();
    },

    // -- Public methods -------------------------------------------------------

    /**
     * @param {Rednose.DropdownItem} item
     * @return {Node}
     * @private
     */
    getHTMLNode: function (item) {
        var container = this.get('container');

        return container.one('[data-id="' + item.id + '"]');
    },

    /**
     * @chainable
     */
    render: function () {
        var container = this.get('container');

        if (this._rootItems) {
            container.append(this._renderMenu(this._rootItems));
        }

        if (!container.inDoc()) {
            Y.one('body').append(container);
        }

        this.rendered = true;

        return this;
    },

    // -- Protected methods ----------------------------------------------------

    _attachDropdownEvents: function () {
        this._events || (this._events = []);

        var container  = this.get('container'),
            classNames = this.classNames;

        this._events.push(
            this.after({
                open   : this._afterOpen,
                close  : this._afterClose,
                enable : this._afterEnable,
                disable: this._afterDisable,
                rename : this._afterRename,
                reset  : this._afterReset
            }),

            container.delegate('click', this._afterItemClick, '.' + classNames.menu + ' a', this),
            container.on('clickoutside', this._onClickOutside, this)
        );
    },

    _detachDropdownEvents: function () {
        (new Y.EventHandle(this._events)).detach();
    },

    /**
     * @param {Array} items
     * @return {Node}
     * @private
     */
    _renderMenu: function (items) {
        var menuNode = Y.Node.create(this.templates.menu({
            classNames: this.classNames
        }));

        for (var i = 0, len = items.length; i < len; i++) {
            menuNode.append(this._renderItem(items[i]));
        }

        return menuNode;
    },

    /**
     * @param {Rednose.DropdownItem} item
     * @return {Node}
     * @private
     */
    _renderItem: function (item) {
        var itemNode = Y.Node.create(this.templates.item({
            classNames: this.classNames,
            item      : item
        }));

        if (item.children) {
            itemNode.append(this._renderMenu(item.children));
        }

        return itemNode;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
     * @param e {EventFacade}
     * @private
     */
    _onClickOutside: function (e) {
        this.close();
    },

    /**
     * @param e {EventFacade}
     * @private
     */
    _afterItemClick: function (e) {
        var target      = e.target,
            originEvent = e.originEvent,
            item        = this.getItemById(target.getAttribute('data-id')),
            itemEvent   = EVT_SELECT + '#' + item.id;

        if (item.isDisabled() ||  item.url === '#') {
            e.preventDefault();
        }

        if (item.isDisabled() || item.hasChildren()) {
            return;
        }

        if (!this._published[itemEvent]) {
            this._published[itemEvent] = this.publish(itemEvent, {
                defaultFn: this._defItemSelectFn
            });
        }

        if (!this._published[EVT_SELECT]) {
            this._published[EVT_SELECT] = this.publish(EVT_SELECT, {
                defaultFn: this._defSelectFn
            });
        }

        this.fire(itemEvent, {
            originEvent: originEvent,
            item       : item
        });
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterOpen: function (e) {
        if (!this.rendered) {
            this.render();
        }

        var container  = this.get('container'),
            classNames = this.classNames;

        container.addClass(classNames.open);
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterClose: function (e) {
        var container  = this.get('container'),
            classNames = this.classNames;

        container.removeClass(classNames.open);
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterEnable: function (e) {
        var node = this.getHTMLNode(e.item);

        if (node) {
            node.get('parentNode').removeClass(this.classNames.disabled);
        }
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterDisable: function (e) {
        var node = this.getHTMLNode(e.item);

        if (node) {
            node.get('parentNode').addClass(this.classNames.disabled);
        }
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterRename: function (e) {
        var node = this.getHTMLNode(e.item);

        if (node) {
            node.setContent(this.templates.content({
                classNames: this.classNames,
                item      : e.item
            }));
        }
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _afterReset: function (e) {
        if (!this.rendered) {
            return;
        }

        var container  = this.get('container'),
            classNames = this.classNames;

        container.one('.' + classNames.menu).remove();

        this.render();
    },

    // -- Default Event Handlers -----------------------------------------------

    /**
     * @param {EventFacade} e
     * @private
     */
    _defSelectFn: function (e) {
        e.item.dropdown.toggle();
    },

    /**
     * @param {EventFacade} e
     * @private
     */
    _defItemSelectFn: function (e) {
        this.fire(EVT_SELECT, {
            originEvent: e.originEvent,
            item       : e.item
        });
    }
}, {
    NS: 'dropdown'
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Dropdown = Dropdown;
/*jshint boss:true, expr:true, onevar:false */

/**
 * Provides the `Y.Rednose.Plugin.Dropdown` Node plugin.
 *
 * @module rednose-dropdown
 */

/**
 * @class Rednose.Plugin.Dropdown
 * @constructor
 * @extends Rednose.Dropdown
 * @uses Plugin.Base
 */
Y.namespace('Rednose.Plugin').Dropdown = Y.Base.create('dropdown', Y.Rednose.Dropdown, [Y.Plugin.Base], {

    // -- Life Cycle Methods ---------------------------------------------------

    initializer: function (config) {
        this._host = config.host;

        var container  = this.get('container'),
            dropup     = this.get('dropup'),
            classNames = this.classNames;

        container.addClass(classNames.dropdown);

        dropup && container.addClass(classNames.dropup);

        if (this.get('showOnContext')) {
            this._host.on('contextmenu', this._afterAnchorContextMenu, this);

            return;
        }

        this._host.addClass(classNames.toggle);

        if (this.get('showCaret')) {
            this._host.setHTML(this.templates.caret({
                classNames: classNames,
                content   : this._host.getHTML()
            }));
        }

        this._host.on('click', this._afterAnchorClick, this);
    },

    // -- Protected Methods ----------------------------------------------------

    /**
     * @param {Integer} x
     * @param {Integer} y
     * @private
     */
    _positionContainer: function (x, y) {
        var container = this.get('container');

        container.setStyles({
            position: 'absolute',
            left    : x,
            top     : y
        });
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
     * @param e {EventFacade}
     * @private
     */
    _afterAnchorContextMenu: function (e) {
        if (e.shiftKey) {
            return;
        }

        e.preventDefault();

        this._positionContainer(e.pageX, e.pageY);

        this.open();
    },

    /**
     * @param e {EventFacade}
     * @private
     */
    _afterAnchorClick: function (e) {
        e.preventDefault();

        this.toggle();
    }
}, {
    NS: 'dropdown',

    ATTRS: {

        /**
         * If `true`, a caret will be rendered within the anchor node.
         *
         * @attribute {Boolean} showCaret
         * @default true
         * @initOnly
         */
        showCaret: {
            value: true,
            writeOnce: 'initOnly'
        },

        /**
         * If `true`, this menu will be triggered and rendered on the contextmenu event.
         *
         * @attribute {Boolean} showOnContext
         * @default false
         * @initOnly
         */
        showOnContext: {
            value: false,
            writeOnce: 'initOnly'
        },

        /**
         * If `true`, the menu will be rendered upwards from the anchor node.
         *
         * @attribute {Boolean} dropup
         * @default false
         * @initOnly
         */
        dropup: {
            value: false,
            writeOnce: 'initOnly'
        },

        /**
         * Overrides the container, in case a button plug-in the parent node acts
         * as container.
         *
         * The getter should only be called once all extensions have been initialized.
         *
         * @attribute {Node} container
         */
        container: {
            getter: function (value) {
                if (this.get('showOnContext')) {
                    return this._getContainer(value);
                }

                return this._host.get('parentNode');
            }
        }
    }
});


}, '1.4.0', {"requires": ["base", "node", "template-micro", "view", "node-pluginhost", "plugin"]});
