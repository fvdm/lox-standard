YUI.add('rednose-dialog', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Provides several dialog windows.

@module rednose-dialog
**/
var CSS_WIDGET = 'rednose-widget',
    CSS_DIALOG = 'rednose-dialog',

    CSS_BOOTSTRAP_PULL_LEFT   = 'pull-left',
    CSS_BOOTSTRAP_PULL_RIGHT  = 'pull-right',
    CSS_BOOTSTRAP_BTN         = 'btn',
    CSS_BOOTSTRAP_BTN_WARNING = 'btn-warning',
    CSS_BOOTSTRAP_BTN_PRIMARY = 'btn-primary',
    CSS_BOOTSTRAP_BTN_DANGER  = 'btn-danger',
    CSS_BOOTSTRAP_BTN_INFO    = 'btn-info',
    CSS_BOOTSTRAP_BTN_SUCCESS = 'btn-success',
    CSS_BOOTSTRAP_CLOSE       = 'close',

    TEXT_CONFIRM = 'OK',
    TEXT_CANCEL  = 'Cancel',

    TYPE_DEFAULT = 'default',
    TYPE_INFO    = 'info',
    TYPE_SUCCESS = 'success',
    TYPE_WARNING = 'warning',
    TYPE_DANGER  = 'danger',
    TYPE_ERROR   = 'error';

/**
Provides several dialog windows.

@class Dialog
@namespace Rednose
@constructor
@extends Widget
**/
var Dialog = Y.Base.create('dialog', Y.Widget, [], {
    // -- Lifecycle Methods ----------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        var self = this;

        // Bind the error attribute change event
        this.after('errorChange', this._setError, this);

        Y.on('keydown', function (e) { if (e.keyCode === 27) { self.destroy(); }});
    },

    /**
    @method destructor
    @protected
    **/
    destructor : function() {
        this.get('panel') && this.get('panel').destroy();
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Shows a basic `alert` dialog.

    @method alert
    @param {Object} [options] The following options can be specified:
        @param {String} [options.title] The dialog title.
        @param {String} [options.text] The dialog body text.
        @param {String} [options.type] The dialog type ('default', 'info', 'warning', success', 'danger', 'error').
        @param {String} [options.confirm] The confirm button value.
    @public
    **/
    alert: function (options) {
        options || (options = {});

        var self = this,
            node,
            panel;

        options = Y.mix(options, {
            title  : '',
            text   : '',
            type   : TYPE_DEFAULT,
            confirm: TEXT_CONFIRM
        });

        node = Y.Node.create('<div><p>' + options.text + '</p></div>');

        panel = new Y.Rednose.Panel({
            bodyContent: node,
            headerContent: this._getHeaderContent(options.title),
            zIndex: this._getHighzIndex(),
            width: this.get('width'),
            buttons: [
                 {
                    value  : options.confirm,
                    section: Y.WidgetStdMod.FOOTER,
                    isDefault: true,
                    action : function () {
                        self.destroy();
                    },
                    classNames: CSS_BOOTSTRAP_BTN + ' ' + this._getButtonForType(options.type)
                 }
            ]
        }).render();

        this._setPanelStyle(panel);
        this.set('panel', panel);

        panel.set('zIndex', this._getHighzIndex());
    },

    /**
    Shows a basic `confirm` dialog.

    @method confirm
    @param {Object} [options] The following options can be specified:
        @param {String} [options.title] The dialog title.
        @param {String} [options.text] The dialog body text.
        @param {String} [options.type] The dialog type ('default', 'info', 'warning', success', 'danger', 'error').
        @param {String} [options.confirm] The confirm button value.
        @param {String} [options.cancel] The cancel button value.
    @param {Function} callback Optional callback function.
    @public
    **/
    confirm: function (options, callback) {
        options || (options = {});

        var self = this,
            node,
            panel;

        options = Y.mix(options, {
            title  : '',
            text   : '',
            type   : TYPE_DEFAULT,
            confirm: TEXT_CONFIRM,
            cancel : TEXT_CANCEL,
        });

        node = Y.Node.create('<div><p>' + options.text + '</p></div>');

        panel = new Y.Rednose.Panel({
            bodyContent: node,
            headerContent: this._getHeaderContent(options.title),
            zIndex: this._getHighzIndex(),
            width: this.get('width'),
            buttons: [
                 {
                    value  : options.cancel,
                    section: Y.WidgetStdMod.FOOTER,
                    isDefault: false,
                    action : function () {
                        self.destroy();
                    },
                    classNames: CSS_BOOTSTRAP_BTN
                 },
                 {
                    value  : options.confirm,
                    section: Y.WidgetStdMod.FOOTER,
                    isDefault: true,
                    action : function () {
                        if (typeof callback === 'function') {
                            callback();
                        }
                        self.destroy();
                    },
                    classNames: CSS_BOOTSTRAP_BTN + ' ' + this._getButtonForType(options.type)
                 }
            ].reverse()
        }).render();

        this._setPanelStyle(panel);
        this.set('panel', panel);

        panel.set('zIndex', this._getHighzIndex());
    },

    /**
    Shows a basic `prompt` dialog.

    @method prompt
    @param {Object} [options] The following options can be specified:
        @param {String} [options.title] The dialog title.
        @param {String} [options.text] The dialog body text.
        @param {String} [options.dataPath] The field data-path for error reporting.
        @param {String} [options.type] The dialog type ('default', 'info', 'warning', success', 'danger', 'error').
        @param {String} [options.confirm] The confirm button value.
        @param {Mixed}  [options.cancel] The cancel button value or false.
        @param {String} [options.value] The default field value, optional.
        @param {String} [options.html] An HTML template to render, optional.
    @param {Function} callback Optional callback function, closes the the dialog when it returns `true`.
    @public
    **/
    prompt: function (options, callback) {
        options || (options = {});

        var self = this,
            node,
            panel;

        options = Y.mix(options, {
            title   : '',
            text    : '',
            dataPath: 'input',
            type    : TYPE_DEFAULT,
            confirm : TEXT_CONFIRM,
            cancel  : TEXT_CANCEL,
            value   : '',
            html    : null
        });

        if (options.html) {
            if (typeof(options.html) === 'string') {
                input = Y.Node.create(options.html);
            } else {
                input = options.html;
            }

            node = Y.Node.create('<form class="form-horizontal"></form>');
            node.append(input);
        } else {
            input = Y.Node.create('<input type="text" value="' + options.value + '" data-path="' + options.dataPath + '" id="input">');

            node = Y.Node.create(
                '<form class="form-horizontal">' +
                '   <div class="control-group">' +
                '       <label for="input" class="control-label">' + options.text +  '</label>' +
                '       <div class="controls"></div>' +
                '   </div>' +
                '</form>'
            );

            node.one('.controls').append(input);
        }

        panel = new Y.Rednose.Panel({
            bodyContent: node,
            headerContent: this._getHeaderContent(options.title),
            zIndex: this._getHighzIndex(),
            width: this.get('width'),
            buttons: [
                 {
                    value  : options.cancel,
                    section: Y.WidgetStdMod.FOOTER,
                    action : function () {
                        self.destroy();
                    },
                    classNames: CSS_BOOTSTRAP_BTN
                 },
                 {
                    value  : options.confirm,
                    section: Y.WidgetStdMod.FOOTER,
                    isDefault: true,
                    action : function () {
                        if (typeof callback === 'function') {
                            // If HTML is specified, return the complete node, else just return the value.
                            var val = options.html ? node : node.one('#input').get('value');

                            if (callback(val) === true) {
                                self.destroy();
                            }
                        }
                    },
                    classNames: CSS_BOOTSTRAP_BTN + ' ' + this._getButtonForType(options.type)
                 }
            ].reverse()
        }).render();

        if (node.one('input, textarea, select') !== null) {
            // FIXME: Doesn't work for select
            //node.one('input, textarea, select').focus().select();

            // Prevent default on keydown and keyup due to browser differences.
            node.one('input, textarea, select').on('keydown', function (e) {
                if (e.button === 13) {
                    e.preventDefault();
                }
            });

            node.one('input, textarea, select').on('keyup', function (e) {
                if (e.button === 13) {
                    e.preventDefault();

                    var buttons = panel.get('buttons');

                    Y.Array.each(buttons.footer, function (button) {
                        if (button.hasClass(CSS_BOOTSTRAP_BTN_PRIMARY)) {
                            button.simulate('click');
                        }
                    });
                }
            });
        }

        this._setPanelStyle(panel);
        this.set('panel', panel);

        panel.set('zIndex', this._getHighzIndex());
    },

    /**
    Add a button to the footer of the dialog (after the dialog is rendered)

    @method addButton
    @param {Array} [buttons] A collection of options, The following options can be specified:
        @param {String} [options.value] The button caption.
        @param {String} [options.classNames] Extra button classes
        @param {String} [options.callback] Callback function
        @param {String} [options.icon] The button icon class
        @param {String} [options.position] Align the button left or right
    @public
    **/
    addButtons: function(buttons) {
        if (this.get('panel')) {
            var buttonId = Y.guid();
            var boundingBox = this.get('panel').get('boundingBox');
            var classNames = 'btn';

            for (var i in buttons) {
                var options = buttons[i];

                if (options.position && options.position == 'right') {
                    classNames += ' ' + CSS_BOOTSTRAP_PULL_RIGHT;
                } else {
                    classNames += ' ' + CSS_BOOTSTRAP_PULL_LEFT;
                }

                if (options.classNames) {
                    classNames += ' '  + options.classNames;
                }

                var button = {
                    name: buttonId,
                    title: options.value,
                    classNames: classNames,
                    action: options.callback
                }

                this.get('panel').addButton(button);

                if (options.icon) {
                    var button = this.get('panel').getButton(buttonId);

                    button.append(
                        Y.Node.create('<li class="' + options.icon + '" />')
                    );
                }
            }

            boundingBox.all('.yui3-button').each(function (button) {
                button.removeClass('yui3-button').removeClass('yui3-button-primary');
            });
        }
    },

    // -- Protected Methods ----------------------------------------------------

    /**
    @method _setPanelStyle
    @param {Rednose.Panel} panel
    @protected
    **/
    _setPanelStyle: function (panel) {
        var boundingBox = panel.get('boundingBox');

        boundingBox.addClass(CSS_WIDGET);
        boundingBox.addClass(CSS_DIALOG);

        boundingBox.all('.yui3-widget-buttons').each(function(buttonContainer) {
            buttonContainer.removeClass('yui3-widget-buttons');
        });

        boundingBox.all('.yui3-button').each(function (button) {
            button.removeClass('yui3-button').removeClass('yui3-button-primary');
            button.addClass(CSS_BOOTSTRAP_PULL_RIGHT);
        });
    },

    /**
    @method _getButtonForType
    @protected
    **/
    _getButtonForType: function (type) {
        switch (type) {
            case TYPE_DEFAULT:
                return CSS_BOOTSTRAP_BTN_PRIMARY;

            case TYPE_INFO:
                return CSS_BOOTSTRAP_BTN_INFO;

            case TYPE_SUCCESS:
                return CSS_BOOTSTRAP_BTN_SUCCESS;

            case TYPE_WARNING:
                return CSS_BOOTSTRAP_BTN_WARNING;

            case TYPE_DANGER:
            case TYPE_ERROR:
                return CSS_BOOTSTRAP_BTN_DANGER;

            default:
                return CSS_BOOTSTRAP_BTN_PRIMARY;
        }
    },

    /**
    @method _getHeaderContent
    @protected
    **/
    _getHeaderContent: function (title) {
        var self = this,
            header;

        // Keep the close button fixed and let the header fill the rest of the line.
        header = Y.Node.create('<div style="width: 100%;">' +
                                   '<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                                       title +
                                   '</div>' +
                               '</div>'
        );

        header.prepend(Y.Node.create('<div style="float: right; white-space: nowrap;">' +
                                        '<button class="' + CSS_BOOTSTRAP_CLOSE + '">&times;</button>' +
                                    '</div>'
        ));

        header.one('.' + CSS_BOOTSTRAP_CLOSE).on('click', function () {
            self.destroy();
        });

        return header;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
    Gets triggered after the 'error' attribute changes. Renders an
    error message at a given property path.

    @method _setError
    @param {EventFacade} e Event
    @protected
    **/
    _setError: function (e) {
        var errors = e.newVal,
            bb    = this.get('panel').get('boundingBox'),
            input;

        // Remove any previous error message
        bb.all('.control-group').each(function (node) {
            if (node.hasClass('error')) {
                node.removeClass('error');
            }

            node.all('.help-block').remove();
        });

        if (!Y.Lang.isArray(errors)) {
            errors = [errors];
        }

        Y.each(errors, function(error) {
            // Append the message node at the given path (defaults to 'input')
            input = bb.one('[data-path=' + (error.path || 'input') + ']');
            input.ancestor('.control-group').addClass('error');

            if (error.message) {
                input.get('parentNode').append('<span class="help-block">' + error.message + '</span>');
            }
        });

        bb.one('.error').focus();

    },

    _getHighzIndex: function() {
        var elements = document.getElementsByTagName('*');
        var highIndex = 0;

        for (var i = 0; i < elements.length - 1; i++) {
            if (parseInt(elements[i].style.zIndex) > highIndex) {
                highIndex = parseInt(elements[i].style.zIndex)
            }
        }

        return (highIndex + 1);
    }
}, {
    ATTRS: {
        error: { value: {} },
        panel: { value: null },
        width: { value: 500 }
    }
});

/**
Static wrapper for the `alert` method

@method alert
@static
@param {Object} options
@return {Rednose.Dialog}
**/
Dialog.alert = function (options) {
    var dialog = new Dialog();

    dialog.alert(options);

    return dialog;
};

/**
Static wrapper for the `confirm` method

@method confirm
@static
@param {Object} options
@param {Function} callback
@return {Rednose.Dialog}
**/
Dialog.confirm = function (options, callback) {
    var dialog = new Dialog();

    dialog.confirm(options, callback);

    return dialog;
};

/**
Static wrapper for the `confirm` method

@method prompt
@static
@param {Object} options
@param {Function} callback
@return {Rednose.Dialog}
**/
Dialog.prompt = function (options, callback) {
    var dialog = new Dialog();

    dialog.prompt(options, callback);

    return dialog;
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Dialog = Dialog;


}, '1.4.0', {
    "requires": [
        "dd",
        "dd-plugin",
        "json-parse",
        "rednose-dialog-css",
        "rednose-panel",
        "node",
        "node-event-simulate",
        "widget"
    ]
});
