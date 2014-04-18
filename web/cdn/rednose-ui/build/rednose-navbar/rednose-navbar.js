YUI.add('rednose-navbar', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
Provides a navigation bar.

@module rednose-navbar
**/
var Navbar;

/**
Provides a navigation bar.

@class NavBar
@namespace Rednose
@constructor
@extends Widget
**/
Navbar = Y.Base.create('navbar', Y.Widget, [], {
    // -- Public Properties ----------------------------------------------------

    /**
    Default template.

    @property templateContainer
    @type String
    @public
    **/
    templateContainer: '<div class="navbar navbar-inverse navbar-fixed-top">' +
                           '<div class="navbar-inner">' +
                               '<div class="container">' +
                                   '<a class="brand brand-navbar" data-url="{url}" href="#">{title}</a>' +
                                   '<ul class="nav"></ul>' +
                                   '<ul class="nav pull-right"></ui>' +
                               '</div>' +
                           '</div>' +
                       '</div>',

    /**
    Column template, used when attribute `columnLayout` is true.

    @property templateColumn
    @type String
    @public
    **/
    templateColumn: '<div class="navbar navbar-inverse navbar-fixed-top rednose-navbar-column">' +
                        '<div class="navbar-inner">' +
                            '<a class="brand brand-navbar rednose-brand" data-url="{url}" href="#">{title}</a>' +
                            '<ul class="nav rednose-menu-primary"></ul>' +
                            '<ul class="nav pull-right rednose-menu-secondary"></ui>' +
                        '</div>' +
                    '</div>',

    /**
    @property dropdownTemplate
    @type String
    @public
    **/
    dropdownTemplate: '<li class="dropdown{submenu}">' +
                          '<a href="#" class="dropdown-toggle" data-toggle="dropdown">{icon}{title} <{caret}></a>' +
                          '<ul class="dropdown-menu">' +
                          '</ul>' +
                      '</li>',

    // -- Lifecycle Methods ----------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        var container = this.get('contentBox');

        // Prevent default URL behaviour.
        container.delegate('click', this._prevent, 'a', this);

        // Bind the handler for clicking on menu items.
        container.delegate('click', this._handleClick, '.dropdown-menu a', this);
        container.delegate('click', this._handleClick, 'ul.nav > li.nav-item > a', this);

        // Bind the handler for clicking on the brand.
        container.delegate('click', this._handleClick, 'a.brand', this);
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        this.templateContainer = null;
        this.templateColumn    = null;
        this.dropdownTemplate  = null;
    },

    // -- Public Methods -------------------------------------------------------

    /**
    @method renderUI
    @public
    **/
    renderUI: function() {
        var menuLeft  = this.get('menu'),
            menuRight = this.get('menuSecondary'),
            template  = this.get('columnLayout') ? this.templateColumn : this.templateContainer,
            title     = this.get('title'),
            url       = this.get('url');

        this.get('contentBox').setHTML(Y.Lang.sub(template, { title: title, url: url }));

        this._appendMenu(menuLeft, false);
        this._appendMenu(menuRight, true);
    },

    /**
    @method bindUI
    @public
    **/
    bindUI: function() {
        var container = this.get('contentBox');

        container.all('.dropdown-toggle').each(function (node) {
            node.plug(Y.Bootstrap.Dropdown);
        });
    },

    /**
    @method getNode
    @param {String} id Menu entry id
    @return {Node}
    @public
    **/
    getNode: function (id) {
        var container = this.get('contentBox');

        return container.one('[data-id=' + id + ']');
    },

    /**
    @method enable
    @param {String} id Menu entry id
    @public
    **/
    enable: function (id) {
        this.disable(id, true);
    },

    /**
    @method disable
    @param {String} id Menu entry id
    @param {Boolean} _enable Toggle the enabled state
    **/
    disable: function (id, _enable) {
        var container = this.get('contentBox'),
            node = container.one('[data-id=' + id + ']');

        if (_enable) {
            node.ancestor('li').removeClass('disabled');
        } else {
            node.ancestor('li').addClass('disabled');
        }
    },

    /**
    @method rename
    @param {String} id Menu entry id
    @param {Array} title The new name
    **/
    rename: function (id, title) {
        var container = this.get('contentBox'),
            node      = container.one('[data-id=' + id + ']');

        node.setHTML(title);
    },

    /**
    Append a dropdown to an item in a prerendered navbar.

    @method createDropdown
    @param {Node} node Menu dropdown node
    @param {Array} items The menu items
    @public
    **/
    createDropdown: function (node, items) {
        var self = this;

        // Convert this node to a dropdown-toggle if it isn't one yet.
        if (node.one('.dropdown-menu') === null) {
            node.removeClass('nav-item');
            node.addClass('dropdown');

            node.one('a').addClass('dropdown-toggle');
            node.one('a').append('&nbsp;');
            node.one('a').append('<b class="caret"></b>');

            node.append(Y.Node.create('<ul class="dropdown-menu"></ul>'));
        }

        Y.Array.each(items, function (i) {
            var li = self._createLi(i, node);

            node.one('.dropdown-menu').append(li);
        });

        node.one('a').plug(Y.Bootstrap.Dropdown);

        // Prevent default URL behaviour.
        node.delegate('click', this._prevent, 'a', this);

        // Bind the handler for clicking on menu items.
        node.delegate('click', this._handleClick, '.dropdown-menu a', this);
        node.delegate('click', this._handleClick, 'ul.nav > li.nav-item > a', this);
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    @method _appendMenu
    @param {Array} menu Menu config
    @param {Array} secondary Secondary menu config
    @param {Node} parentMenu node
    @protected
    **/
    _appendMenu: function (menu, secondary, parentMenu) {
        var container = this.get('contentBox'),
            self      = this;

        Y.Array.each(menu, function (m) {
            if (m.items) {
                var dropdown = Y.Node.create(
                    Y.Lang.sub(self.dropdownTemplate, {
                        title  : m.title,
                        icon   : m.icon ? '<i class="icon icon-white ' + m.icon + '"></i> ' : '',
                        submenu: (typeof(parentMenu) !== 'undefined' ? '-submenu' : ''),
                        caret  : (typeof(parentMenu) === 'undefined' ? "b class=caret" : 'b')
                    })
                );

                Y.Array.each(m.items, function (i) {
                    li = self._createLi(i, dropdown);

                    dropdown.one('.dropdown-menu').append(li);
                });

                if (typeof(parentMenu) === 'undefined') {
                    container.one(secondary === false ? '.nav' : '.pull-right').append(dropdown);
                } else {
                    parentMenu.one('.dropdown-menu').append(dropdown);
                }
            } else {
                var li = self._createLi(m);

                li.addClass('nav-item');

                container.one(secondary === false ? '.nav' : '.pull-right').append(li);
            }
        });
    },

    /**
    @method _createLi
    @param {Object} item
    @param {Object} dropdown
    @protected
    **/
    _createLi: function(item, dropdown) {
        var li = Y.Node.create ('<li tabindex="-1"></li>');

        if (item.title === '-') {
            li.addClass('divider');

            return li;
        }

        if (typeof(item.items) === 'object') {
            return this._appendMenu([ item ], null, dropdown);
        }

        if (item.node instanceof Y.Node && item.node.test('a')) {
            li.append(item.node);

            return li;
        }

        li.append(this._createListItem(item));

        if (typeof(item.disabled) !== 'undefined') {
            li.addClass('disabled');
        }

        return li;
    },

    /**
    @method _createListItem
    @param {Object} item
    @protected
    **/
    _createListItem: function (item) {
        var a    = Y.Node.create('<a tabindex="-1" href="#"></a>'),
            html = item.node || item.title;

        if (item.icon) {
            html = '<i class="icon ' + item.icon + '"></i> ' + html;
        }

        a.set('innerHTML', html);

        if (typeof(item.id) !== 'undefined') {
            a.setAttribute('data-id', item.id);
        }

        if (typeof(item.url) !== 'undefined') {
            a.setAttribute('data-url', item.url);
        }

        if (typeof(item.value) !== 'undefined') {
            a.setAttribute('data-value', item.value);
        }

        return a;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    @method _handleClick
    @param {EventFacade} e Event
    @protected
    **/
    _handleClick: function (e) {
        var node   = e.currentTarget,
            id     = node.getAttribute('data-id'),
            url    = node.getAttribute('data-url'),
            value  = node.getAttribute('data-value');

        if (node.hasClass('dropdown')) {
            return;
        }

        // Ignore clicks on disabled nodes and submenus.
        if (node.ancestor('li')) {
            if (node.ancestor('li').hasClass('disabled') || node.ancestor('li').hasClass('dropdown-submenu')) {
                node.blur();

                return;
            }
        }

        if (id) {
            this.fire(id, { value: value });
        }

        if (node.ancestor('.dropdown')) {
            node.ancestor('.dropdown').one('.dropdown-toggle').simulate('click');
        }

        if (url) {
            document.location.href = url;
        }
    },

    /**
    @method _prevent
    @param {EventFacade} e Event
    @protected
    **/
    _prevent: function (e) {
        e.currentTarget.getAttribute('href') === '#' && e.preventDefault();
    }
}, {
    ATTRS: {
        /**
        @attribute title
        @type String
        **/
        title: {
            value: null
        },

        /**
        @attribute title url
        @type String
        **/
        url: {
            value: ''
        },

        /**
        @attribute menu
        @type Array
        **/
        menu: {
            value: []
        },

        /**
        @attribute menuSecondary
        @type Array
        **/
        menuSecondary: {
            value: []
        },

        /**
        @attribute columnLayout
        @type Boolean
        **/
        columnLayout: {
            value: false
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Navbar = Navbar;
/*jshint boss:true, expr:true, onevar:false */

var CSS_BOOTSTRAP_BTN         = 'btn',
    CSS_BOOTSTRAP_BTN_GROUP   = 'btn-group',
    CSS_BOOTSTRAP_ACTIVE      = 'active',
    CSS_BOOTSTRAP_BTN_PRIMARY = 'btn-primary',
    CSS_BOOTSTRAP_DISABLED    = 'disabled',
    CSS_BOOTSTRAP_FLOAT_LEFT  = 'float-left',
    CSS_BOOTSTRAP_FLOAT_RIGHT = 'float-right',
    CSS_BOOTSTRAP_CLOSE       = 'close';

var Toolbar = Y.Base.create('toolbar', Y.View, [], {
    /**
     Stores references to the created nodes.

     @property _buttonMap
     @type Object
     @protected
     **/
    _buttonMap: {},

    _evtPrefix: null,

    initializer: function (config) {
        config || (config = {});

        this._evtPrefix = config.evtPrefix || Toolbar.NAME;
    },

    destructor: function () {
        this._buttonMap = null;
    },

    render: function () {
        var self      = this,
            buttons   = this.get('buttons'),
            container = this.get('container');

        Y.Object.each(buttons, function (button, key) {
            var value     = button.value,
                primary   = button.primary,
                position  = button.position ? button.position : 'left',
                disabled  = button.disabled,
                className = button.className,
                icon      = button.icon,
                title     = button.title,
                hidden    = button.hidden;

            var node, action;

            // TODO: Refactor, DRY
            if (button.type === 'choice' || button.type === 'group') {
                node = Y.Node.create('<div class="' + CSS_BOOTSTRAP_BTN_GROUP + '"></div>');

                if (disabled) {
                    node.addClass(CSS_BOOTSTRAP_DISABLED);
                }

                if (className) {
                    node.addClass(className);
                }

                if (hidden) {
                    node.hide();
                }

                if (position === 'left') {
                    node.addClass(CSS_BOOTSTRAP_FLOAT_LEFT);
                }

                if (position === 'right') {
                    node.addClass(CSS_BOOTSTRAP_FLOAT_RIGHT);
                }

                Y.Object.each(button.choices, function (choice, key) {
                    var buttonNode = Y.Node.create('<button class="' + CSS_BOOTSTRAP_BTN + '"></button>');

                    buttonNode.setAttribute('data-id', key);

                    if (disabled) {
                        buttonNode.addClass(CSS_BOOTSTRAP_DISABLED);
                    }

                    if (choice.icon) {
                        buttonNode.append(Y.Node.create('<i class="' + choice.icon + '"></i>'));
                    }

                    if (value === key) {
                        buttonNode.addClass(CSS_BOOTSTRAP_ACTIVE);
                    }

                    if (choice.title) {
                        buttonNode.set('title', choice.title);
                    }

                    if (choice.value) {
                        buttonNode.set('text', choice.value);
                    }

                    if (button.type === 'choice') {
                        buttonNode.on('click', function (e) {
                            var btn = e.currentTarget;

                            action = 'button' + Y.Rednose.Util.capitalizeFirstLetter(key);

                            if (btn.hasClass(CSS_BOOTSTRAP_ACTIVE) === false) {
                                btn.get('parentNode').get('children').each(function (child) {
                                    if (child.hasClass(CSS_BOOTSTRAP_ACTIVE)) {
                                        child.removeClass(CSS_BOOTSTRAP_ACTIVE);
                                    }
                                });

                                btn.addClass(CSS_BOOTSTRAP_ACTIVE);

                                self.fire(self._evtPrefix + ':' + action);
                            }
                        });
                    }

                    if (button.type === 'group') {
                        buttonNode.on('click', function (e) {
                            var btn = e.currentTarget;

                            action = 'button' + Y.Rednose.Util.capitalizeFirstLetter(key);

                            btn.blur();

                            if (btn.hasClass(CSS_BOOTSTRAP_DISABLED) === false) {
                                self.fire(self._evtPrefix + ':' + action);
                            }
                        });
                    }

                    node.append(buttonNode);
                });
            } else {
                // Format the action event by prepending 'button', for example the event
                // fired for 'cancel' will be 'buttonCancel'
                action = 'button' + Y.Rednose.Util.capitalizeFirstLetter(key);
                node   = Y.Node.create('<button class="' + CSS_BOOTSTRAP_BTN + '"></button>');

                node.setAttribute('data-id', key);

                if (primary) {
                    node.addClass(CSS_BOOTSTRAP_BTN_PRIMARY);
                }

                if (disabled) {
                    node.addClass(CSS_BOOTSTRAP_DISABLED);
                }

                if (className) {
                    node.addClass(className);
                }

                if (title) {
                    node.set('title', title);
                }

                if (hidden) {
                    node.hide();
                }

                if (position === 'left') {
                    node.addClass(CSS_BOOTSTRAP_FLOAT_LEFT);
                }

                if (position === 'right') {
                    node.addClass(CSS_BOOTSTRAP_FLOAT_RIGHT);
                }

                if (value) {
                    node.set('text', value);
                }

                if (icon) {
                    node.append(Y.Node.create('<i class="' + icon + '"></i>'));
                }

                node.on('click', function (e) {
                    var btn = e.currentTarget;

                    btn.blur();

                    if (btn.hasClass(CSS_BOOTSTRAP_DISABLED) === false) {
                        self.fire(self._evtPrefix + ':' + action);
                    }
                });
            }

            container.append(node);

            self._buttonMap[key] = node;
        });

        return this;
    },

    /**
     Get a button node by name.

     @method getButton
     @param {String} name The name of the button.
     **/
    getButton: function (name) {
        if (!this._buttonMap) {
            return false;
        }

        if (!this._buttonMap[name]) {
            return false;
        }

        return this._buttonMap[name];
    },

    /**
     * @param {String} id Menu entry id
     */
    enable: function (id) {
        this.disable(id, true);
    },

    /**
     * @param {String} id Menu entry id
     * @param {Boolean} _enable Toggle the enabled state
     */
    disable: function (id, _enable) {
        var container = this.get('container'),
            node      = container.one('[data-id=' + id + ']');

        if (_enable) {
            node.removeClass('disabled');
        } else {
            node.addClass('disabled');
        }
    },

    /**
     * @param {String} id Menu entry id
     */
    reset: function (id) {
        var container = this.get('container'),
            node      = container.one('[data-id=' + id + ']');

        node.hasClass(CSS_BOOTSTRAP_ACTIVE) && node.removeClass(CSS_BOOTSTRAP_ACTIVE);
    },

    /**
     Setter to update the buttons properties.

     @method _setButtons
     @param {Object} value The button config object
     @protected
     **/
    _setButtons: function (value) {
        var self    = this,
            footer  = this.get('container').one('.' + CSS_YUI3_WIDGET_FT),
            buttons = this.buttons;

        Y.Object.each(value, function (properties, key) {
            self.buttons[key] = Y.merge(buttons[key], properties);
        });

        // TODO: Update instead of rerendering.
        this._buildFooter();

        this._rendered && footer.one('div').replace(this._footer);
    },

    /**
     Getter to get the current button properties.

     @method _getButtons
     @protected
     **/
    _getButtons: function () {
        return this.buttons;
    }
}, {
    ATTRS: {
        /**
        @attribute buttons
        @type Object
        **/
        buttons: {
            value: {}
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Toolbar = Toolbar;


}, '1.4.0', {
    "requires": [
        "base",
        "gallery-bootstrap-dropdown",
        "json",
        "node-event-simulate",
        "node-pluginhost",
        "rednose-navbar-css",
        "rednose-util",
        "view",
        "widget"
    ]
});
