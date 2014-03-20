YUI.add('rednose-view-nav', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
View extension, adds a title section to an instance of View, and a footer section with a
configuration of buttons.

@module rednose-app
@submodule rednose-view-nav
**/
var ViewNav,

    // Bird's-eye view of the CSS classes used.
    CSS_MAGIC_PREFIX = 'rednose',
    CSS_VIEW_NAV     = 'rednose-view-nav',

    // Bird's-eye view of the Bootstrap CSS classes used.
    CSS_BOOTSTRAP_BTN         = 'btn',
    CSS_BOOTSTRAP_BTN_GROUP   = 'btn-group',
    CSS_BOOTSTRAP_ACTIVE      = 'active',
    CSS_BOOTSTRAP_BTN_PRIMARY = 'btn-primary',
    CSS_BOOTSTRAP_DISABLED    = 'disabled',
    CSS_BOOTSTRAP_FLOAT_LEFT  = 'float-left',
    CSS_BOOTSTRAP_FLOAT_RIGHT = 'float-right',
    CSS_BOOTSTRAP_CLOSE       = 'close',

    // Bird's-eye view of the YUI3 CSS classes used.
    CSS_YUI3_WIDGET_BD = 'yui3-widget-bd',
    CSS_YUI3_WIDGET_FT = 'yui3-widget-ft',

    /**
    Fired when the optional close button is clicked.

    @event buttonClose
    **/
    EVT_BUTTON_CLOSE = 'buttonClose';

/**
View extension, adds a title section to an instance of View, and a footer section with a
configuration of buttons.

@class ViewNav
@namespace Rednose.View
@constructor
@extensionfor View
**/
ViewNav = Y.Base.create('viewNav', Y.View, [], {
    // -- Public Properties ----------------------------------------------------

    /**
    Title property, sets the panel's header content.

    @property title
    @type String
    **/
    title: null,

    /**
    Buttons property, sets the panel's footer buttons.

    @property buttons
    @type Object
    **/
    buttons: null,

    /**
    Shows or hides the footer section.

    @property footer
    @type Boolean
    **/
    footer: true,

    /**
    Optional close button in the header.

    @property close
    @type Boolean
    **/
    close: false,

    /**
    Optionally disable padding.

    @property padding
    @type Boolean
    **/
    padding: true,

    // -- Protected Properties -------------------------------------------------

    /**
    Stores the current state.

    @property _rendered
    @type Boolean
    @protected
    **/
    _rendered: false,

    /**
     References the body DOM node.

     @property _body
     @type Node
     @protected
     **/
    _body: null,

    /**
    References the footer DOM node.

    @property _footer
    @type Node
    @protected
    **/
    _footer: null,

    /**
    Stores references to the created nodes.

    @property _buttonMap
    @type Object
    @protected
    **/
    _buttonMap: {},

    /**
    Stores references to an active panel.

    @property _pabel
    @type Object
    @protected
    **/
    _panel: null,

    // -- Lifecycle Methods ----------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        this._viewNavEventHandles || (this._viewNavEventHandles = []);

        this._viewNavEventHandles.push(
            Y.Do.after(this._afterRender, this, 'render', this)
        );

        this.footer && this._buildFooter();
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        (new Y.EventHandle(this._viewNavEventHandles)).detach();

        if (this._panel) {
            this._panel.destroy();
        }

        this.title      = null;
        this.buttons    = null;
        this._footer    = null;
        this._buttonMap = null;
        this._panel     = null;
    },

    // -- Public Methods -------------------------------------------------------

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

    sizeView: function (parent) {
        var bodyHeight, parentHeight;

        parentHeight = parseInt(parent.getComputedStyle('height'), 10);

        // Parent - header - footer.
        bodyHeight = parentHeight - 46 - 56;

        this._body.setStyle('height', bodyHeight);

        this._body.one('.rednose-unit-left') && this._body.one('.rednose-unit-left').setStyle('height', bodyHeight);
        this._body.one('.rednose-unit-right') && this._body.one('.rednose-unit-right').setStyle('height', bodyHeight);
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    Build the footer buttons and bind them to fire events.

    @method _buildFooter
    @protected
    **/
    _buildFooter: function () {
        var self    = this,
            buttons = this.buttons,
            footer  = Y.Node.create('<div></div>');

        Y.Object.each(buttons, function (button, key) {
            var value     = button.value,
                primary   = button.primary,
                position  = button.position ? button.position : 'left',
                disabled  = button.disabled,
                className = button.className,
                icon      = button.icon,
                hidden    = button.hidden;

            var node, action;

            // TODO: Refactor, DRY
            if (button.type === 'toggle') {
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

                    if (choice.icon) {
                        buttonNode.append(Y.Node.create('<i class="' + choice.icon + '"></i>'));
                    }

                    if (value === key) {
                        buttonNode.addClass(CSS_BOOTSTRAP_ACTIVE);
                    }

                    buttonNode.on('click', function (e) {
                        var btn = e.currentTarget;

                        action = 'button' + self._capitalizeFirstLetter(key);

                        if (btn.hasClass(CSS_BOOTSTRAP_ACTIVE) === false) {
                            btn.get('parentNode').get('children').each(function (child) {
                                if (child.hasClass(CSS_BOOTSTRAP_ACTIVE)) {
                                    child.removeClass(CSS_BOOTSTRAP_ACTIVE);
                                }
                            });

                            btn.addClass(CSS_BOOTSTRAP_ACTIVE);

                            self.fire(action);
                        }
                    });

                    node.append(buttonNode);
                });
            } else {
                // Format the action event by prepending 'button', for example the event
                // fired for 'cancel' will be 'buttonCancel'
                action = 'button' + self._capitalizeFirstLetter(key);
                node   = Y.Node.create('<button class="' + CSS_BOOTSTRAP_BTN + '"></button>');

                if (primary) {
                    node.addClass(CSS_BOOTSTRAP_BTN_PRIMARY);
                }

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

                if (value) {
                    node.set('text', value);
                }

                if (icon) {
                    node.append(Y.Node.create('<i class="' + icon + '"></i>'));
                }

                node.on('click', function (e) {
                    var btn = e.currentTarget;

                    if (btn.hasClass(CSS_BOOTSTRAP_DISABLED) === false) {
                        self.fire(action);
                    }
                });
            }

            footer.append(node);

            self._buttonMap[key] = node;
        });

        this._footer = footer;
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
    },

    /**
    Formatting helper method to capitalize the first letter of a given string

    @method _getButtons
    @param {String} value The string to capitalize.
    @protected
    **/
    _capitalizeFirstLetter: function (value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    },

    /**
    Formatting helper method.

    @method _camelCaseToDash
    @param {String} string The string to convert.
    @protected
    **/
    _camelCaseToDash: function (string) {
        return string.replace(/([A-Z])/g, function ($1) {
            return '-' + $1.toLowerCase();
        });
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Wraps the view into a panel after it's rendered.

    @method _afterRender
    @protected
    **/
    _afterRender: function () {
        var container = this.get('container'),
            title     = this.title,
            body      = Y.Node.create('<div></div>'),
            footer    = this._footer,
            config    = { bodyContent: body },
            close     = this.close,
            self      = this;

        container.addClass(CSS_VIEW_NAV);

        // Transfer the child nodes from the view container to the new body container.
        container.get('children').each(function (c) {
            body.append(c);
        });

        if (title !== null) {
            // Keep the close button fixed and let the header fill the rest of the line.
            var header = Y.Node.create('<div style="width: 100%;">' +
                                           '<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                                               title +
                                           '</div>' +
                                       '</div>'
            );

            if (close) {
                header.prepend(Y.Node.create('<div style="float: right; white-space: nowrap;">' +
                                                '<button class="' + CSS_BOOTSTRAP_CLOSE + '">&times;</button>' +
                                            '</div>'
                ));

                header.one('.' + CSS_BOOTSTRAP_CLOSE).on('click', function () {
                    self.fire(EVT_BUTTON_CLOSE);
                });
            }

            config.headerContent = header;
        }

        if (footer !== null) {
            config.footerContent = footer;
        }

        this._panel = new Y.Rednose.NavContainer(config);

        // Render the panel within the view container.
        this._panel.render(container);

        // Add a magic CSS handle to the widget-body.
        this._panel.get('boundingBox').one('.' + CSS_YUI3_WIDGET_BD).addClass(CSS_MAGIC_PREFIX + '-' + this._camelCaseToDash(this.name));

        if (this.padding === false) {
            this._panel.get('boundingBox').one('.' + CSS_YUI3_WIDGET_BD).setStyle('padding', 0);
        }

        this._body = body;

        // Adjust position.
        var parent = container.get('parentNode');

        parent && this.sizeView(parent);

        this._rendered = true;
    }
}, {
    ATTRS: {
        /**
        Button attribute, triggers a setter to update the DOM on setting.

        @attribute buttons
        @type Object
        **/
        buttons: {
            setter: '_setButtons',
            getter: '_getButtons'
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.View').Nav = ViewNav;


}, '1.1.0-DEV', {"requires": ["event-custom", "rednose-panel", "rednose-widget-nav-container", "view"]});
