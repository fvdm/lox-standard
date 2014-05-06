/*jshint boss:true, expr:true, onevar:false */

/**
 * Provides the Y.Rednose.Dropdown widget.
 *
 * @module rednose-dropdown
 * @main rednose-dropdown
 */

var Micro = Y.Template.Micro;

/**
 * Dropdown widget.
 *
 * @class Rednose.Dropdown
 * @constructor
 * @param {Object} [config] Config options.
 * @param {Array} [config.items] Dropdown items.
 * @extends Rednose.Dropdown.Base
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

var Dropdown = Y.Base.create('dropdown', Y.Rednose.Dropdown.Base, [Y.View], {

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
            originEvent = e,
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

Y.Rednose.Dropdown = Y.mix(Dropdown, Y.Rednose.Dropdown);
