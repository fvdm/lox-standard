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

    template: '<p>Template Stub</p>',

	// -- Lifecycle Methods ----------------------------------------------------

	/**
	@method initializer
	@protected
	**/
	initializer: function () {
        var container = this.get('container'),
            strings = this.get('strings');

        this.title = strings.dialog_title;

        container.setContent(Y.Lang.sub(this.template, {
        }));
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
	},

    // -- Protected Event Handlers ----------------------------------------------

    // STUB....

},{
    ATTRS: {
        /**
         * Translation dictionary used by the Lox.App.FileBrowserView module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-app-file-link-view');
            }
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileLinkView = FileLinkView;

}, '@VERSION@', {
    "requires": [
        "view"
    ],
    "lang": [
        "en",
        "nl"
    ]
});
