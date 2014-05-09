
var CSS_BOOTSTRAP_BTN = 'btn',
    CSS_BOOTSTRAP_BTN_DANGER = 'btn-danger';

YUI.add('lox-app-file-link-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Provides the link create and edit view.

@class FileLinkView

@namespace Lox.App
@constructor
@extends View
**/
var FileLinkView = Y.Base.create('fileLinkView', Y.View, [ Y.Rednose.View.Nav ], {

	// -- Public properties ----------------------------------------------------

    title: '#',

    templates: {
        main:
            '<div>&nbsp;</div>' +
            '<form class="form-horizontal">' +
                '<fieldset>' +
                    '<div class="control-group">' +
                        '<label for="public_url" class="control-label">{public_url}</label>' +
                        '<div class="controls">' +
                            '<textarea type="text" id="public_url" onkeydown="return false;" class="input-block-level"></textarea>' +
                        '</div>'+
                    '</div>' +
                    '<div class="control-group">' +
                        '<label for="link_expire" class="control-label">{link_expires}</label>' +
                        '<div class="controls">' +
                            '<input type="checkbox" id="link_expire">' +
                        '</div>'+
                    '</div>' +
                    '<div class="control-group" style="display: none;">' +
                        '<label for="link_expire_date" class="control-label">{link_expires_date}</label>' +
                        '<div class="controls">' +
                        '</div>'+
                    '</div>' +
                '</fieldset>' +
            '</form>',

        datePicker:
            '<div id="timepicker" class="input-append" style="margin-bottom: 5px;">' +
                '<input data-format="yyyy-MM-dd" type="text"></input>' +
                '<span class="add-on">' +
                    '<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
                '</span>' +
            '</div>',

        timePicker:
            '<div id="timepicker" class="input-append" style="margin-top: 5px;">' +
                '<input data-format="hh:mm:ss" type="text"></input>' +
                '<span class="add-on">' +
                    '<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
                '</span>' +
            '</div>'
    },

    close: true,

    padding: true,

    buttons: {
        confirm: {
            value   : '...',
            position: 'right',
            primary : true
        },

        cancel: {
            value   : '...',
            position: 'right'
        },

        remove: {
            value     : '...',
            className : CSS_BOOTSTRAP_BTN + ' ' + CSS_BOOTSTRAP_BTN_DANGER,
            hidden    : true,
            position  : 'left'
        }
    },

	// -- Lifecycle Methods ----------------------------------------------------


	/**
	@method initializer
	@protected
	**/
	initializer: function () {
        var container = this.get('container'),
            strings = this.get('strings');

        this.title = strings.dialog_title;

        container.setContent(Y.Lang.sub(this.templates.main, {
            public_url        : strings.public_url,
            link_expires      : strings.link_expires,
            link_expires_date : strings.link_expires_date,
        }));

	    container.one('input#link_expire').on(['change', 'keyup'], this._handeExpireChecked, this);

	    this.on({
	        'fileLinkView:buttonConfirm': this._handleLinkConfirm
        }, this);
	},

	/**
	@method destructor
	@protected
	**/
	destructor: function () {
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this DialogView into its container, encapsulated in a modal panel.

	@method render
	@chainable
	**/
	render: function () {
	    var model   = this.get('model'),
	        strings = strings = this.get('strings');

        this.getButton('cancel').set('text', strings.button_cancel);
        this.getButton('confirm').set('text', strings.button_create);
        this.getButton('remove').set('text', strings.button_remove);

        this._initInterface();
    },

    // -- Protected Event Handlers ----------------------------------------------

    _initInterface: function (e) {
        var model    = this.get('model'),
            strings  = this.get('strings'),
            urlInput = this.get('container').one('textarea#public_url');

        if (model.get('public_id') === null) {
            urlInput.set('value', strings.no_url);
        } else {
            urlInput.set(
                'value',
                YUI.Env.routing.link_path + '/' +
                model.get('uri')
            );

            this.getButton('confirm').set('text', strings.button_confirm);
            this.getButton('remove').show();
        }
    },

    _handeExpireChecked: function (e) {
        var checkbox  = e.currentTarget,
            container = checkbox.get('parentNode'),

            dateContainer =
                this.get('container')
                .one('label[for=link_expire_date]')
                .get('parentNode').one('.controls');

        if (checkbox.get('checked')) {
            var datePicker = Y.Node.create(this.templates.datePicker),
                timePicker = Y.Node.create(this.templates.timePicker),
                expireDate = this.get('model').get('expires');

            if (dateContainer.all('*').size() === 0) {
                dateContainer.append(datePicker);

                dateContainer.append(timePicker);

                datePicker.plug(Y.Rednose.Plugin.Datepicker);
                timePicker.plug(Y.Rednose.Plugin.Timepicker);

                datePicker.datepicker.set('date', expireDate);
                timePicker.timepicker.set('date', expireDate);
            }

            dateContainer.get('parentNode').show();
        } else {
            dateContainer.get('parentNode').hide();
        }
    },

    _handleLinkConfirm: function (e) {
        var self  = this,
            model = this.get('model');

        model.save(function() {
            self._initInterface();
        });
    }

},{
    ATTRS: {
        /**
         * Translation dictionary used by the Lox.App.FileLinkView module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-app-file-link-view');
            }
        },

        /**
         * @attribute model
         * @type Lox.LinkModel
         */
        model: {
            value: null
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileLinkView = FileLinkView;

}, '@VERSION@', {
    "requires": [
        "view",
        "rednose-view-nav",
        "rednose-datetimepicker"
    ],
    "lang": [
        "en",
        "nl"
    ]
});
