YUI.add('lox-app-file-detail-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Provides a detail view when clicked on a file.

@module lox-app
@submodule lox-app-file-detail-view
**/
var CSS_ICON_PREFIX  = 'icon-file-128-',

    CSS_BOOTSTRAP_INFO        = 'btn-info',
    CSS_BOOTSTRAP_TEXT_CENTER = 'text-center';

/**
Provides a detail view when clicked on a file.

@class FileDetailView
@param {Object} [config] Config properties.
    @param {Object} [config.container] The container the view will be rendered in.
@namespace Lox.App
@constructor
@extends View
@uses Rednose.View.Nav
**/
var FileDetailView = Y.Base.create('fileDetailView', Y.View, [ Y.Rednose.View.Nav ], {
	padding: true,

    template:
		'<div>' +
			'<p class="' + CSS_BOOTSTRAP_TEXT_CENTER + '"><i class="{iconClass}"></i></p>' +
			'<p class="' + CSS_BOOTSTRAP_TEXT_CENTER + '">{mimeType}</p>' +
		'</div>',

    close: true,

	buttons: {
		download: {
			value: Y.Intl.get('lox-app-file-detail-view').download,
			position: 'right',
			primary: true
		},

		share: {
			value: Y.Intl.get('lox-app-file-detail-view').share,
			position: 'right',
			className: CSS_BOOTSTRAP_INFO
		}
	},

    /**
    @method initializer
    @protected
    **/
	initializer: function () {
        this._fileDetailViewEvents || (this._fileDetailViewEvents = []);

        this._fileDetailViewEvents.push(
            this.on({
                'fileDetailView:buttonDownload': this._download,
                'fileDetailView:buttonShare'   : this._share,
                'fileDetailView:buttonClose'   : this.destroy
            })
        );
    },

    /**
    @method destructor
    @protected
    **/
    destructor: function () {
        (new Y.EventHandle(this._fileDetailViewEvents)).detach();
    },

    /**
    @method render
    @chainable
    **/
	render: function () {
		var container = this.get('container'),
			model     = this.get('model'),
			vars      = model.getAttrs();

        if (vars.hasKeys) {
            this.toolbar.disable('download');
            this.toolbar.disable('share');

            vars.mimeType = Y.Intl.get('lox-app-file-detail-view').encrypted;
        } else {
            this.toolbar.enable('download');
            this.toolbar.enable('share');
        }
        
		vars.iconClass = CSS_ICON_PREFIX + vars.icon;

		container.setContent(Y.Lang.sub(this.template, vars));

		this.title = model.get('title');

		return this;
	},

    /**
    @method _download
    @protected
    **/
	_download: function () {
        var item = this.get('model');

        if (item) {
            Y.config.win.location = YUI.Env.routing.item + item.get('path') + '?download=1';
        }
	},

    /**
    @method _share
    @protected
    **/
	_share: function () {
        var item = this.get('model');

        this.fire('link', {
            data: item
        });

        this.fire('buttonClose');
	}
}, {
    /**
    An Item instance of a file.

    @attribute model
    @type Model
    **/
	ATTRS: {
		model: null
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileDetailView = FileDetailView;


}, '@VERSION@', {"requires": ["rednose-view-nav", "view"], "lang": ["en", "nl"]});
