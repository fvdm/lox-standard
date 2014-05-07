YUI.add('lox-app-file-upload-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Provides a view to upload multiple files.

@module lox-app
@submodule lox-app-file-upload-view
**/
var UPLOAD_URL = YUI.Env.routing.upload,

	STYLE_UPLOADER_BUTTON_WIDTH = 104,
	STYLE_UPLOAD_BUTTON_HEIGHT  = 30,

    CSS_FILE_LIST = 'file-list',
    CSS_BODY_TEXT = 'body-text',

	CSS_BOOTSTRAP_BTN         = 'btn',
	CSS_BOOTSTRAP_BTN_PRIMARY = 'btn-primary',
	CSS_BOOTSTRAP_FLOAT_RIGHT = 'float-right',
	CSS_BOOTSTRAP_DISABLED    = 'disabled',
	CSS_BOOTSTRAP_PROGRESS    = 'progress',
	CSS_BOOTSTRAP_BAR         = 'bar',
	CSS_BOOTSTRAP_SUCCESS     = 'success',
	CSS_BOOTSTRAP_WARNING     = 'warning',
    CSS_BOOTSTRAP_ERROR       = 'error',

    EVT_UPLOAD_COMPLETE = 'uploadcomplete',

    STATE_PENDING  = 'pending',
    STATE_FAILED   = 'failed',
    STATE_FINISHED = 'finished',

    CSS_ICON_PENDING  = '✘',
    CSS_ICON_FAILED   = '✘',
    CSS_ICON_FINISHED = '✔';

/**
Provides a view to upload multiple files.

@class FileUploadView
@param {Object} [config] Config properties.
	@param {Object} [config.container] The container the view will be rendered in.
@namespace Lox.App
@constructor
@extends View
@uses Rednose.View.Nav
**/
var FileUploadView = Y.Base.create('fileUploadView', Y.View, [ Y.Rednose.View.Nav ], {
	// -- Pubic properties -----------------------------------------------------

    /**
    Uploader button template.

    @property UPLOADER_TEMPLATE
    @type {String}
    @public
    **/
    UPLOADER_TEMPLATE: '<button class="{buttonClass}">{buttonText}</button>',

	/**
	Title of this dialog.

	@property {String} title
	**/
	title: Y.Intl.get('lox-app-file-upload-view').upload_files,

    close: true,

	padding: true,

    /**
	Container template.

	@property {String} template
    @public
	**/
	template: '<div>' +
                  '<div class="{classBody}"><p>{textBody}</p><p>{textSubBody}</p></div>' +
                  '<p><div class="{classFileList}"></div></p>' +
                  '<p><div class="{classProgress}"><div class="{classBar}" style="width: 0%;"></div></div></p>' +
              '</div>',

	/**
	Predefined buttons.

	@property {Object} buttons
	**/
	buttons: {
		cancel: {
			value: Y.Intl.get('lox-app-file-upload-view').cancel,
			position: 'right'
		}
	},

	// -- Protected properties -------------------------------------------------

	/**
	Uploader instance.

	@property {Uploader} _uploader
	**/
	_uploader: null,

    /**
    Progressbar node.

    @property {Node} _progressBar
    **/
    _progressBar: null,

	// -- Lifecycle Methods ----------------------------------------------------

	/**
	@method initializer
	@protected
	**/
	initializer: function () {
		this._dialogViewEvents || (this._dialogViewEvents = []);

        var container = this.get('container'),
            strings   = this.get('strings');

        container.setContent(Y.Lang.sub(this.template, {
            classBody    : CSS_BODY_TEXT,
            textBody     : strings.upload_body,
            textSubBody  : strings.upload_sub_body,
			classFileList: CSS_FILE_LIST,
			classProgress: CSS_BOOTSTRAP_PROGRESS,
			classBar     : CSS_BOOTSTRAP_BAR
        }));

        this._progressBar = container.one('.' + CSS_BOOTSTRAP_PROGRESS);
        this._progressBar.hide();

        this.items = new Y.ModelList();

		this._initializeUploader();

		this._dialogViewEvents.push(
			// Bind on the Y.Rednose.View.Nav render event handler.
			Y.Do.after(this._renderUploader, this, '_afterRender', this),

			// Uploader events
			this._uploader.after('fileselect', this._afterFileSelect, this),

			this._uploader.on('uploadstart', this._onUploadStart, this),
			this._uploader.on('uploadcomplete', this._onUploadComplete, this),
            this._uploader.on('uploaderror', this._onUploadError, this),
			this._uploader.on('totaluploadprogress', this._onTotalUploadProgress, this),
			this._uploader.on('alluploadscomplete', this._onAllUploadsComplete, this)
		);
	},

	/**
	@method initializer
	@protected
	**/
	destructor: function () {
		(new Y.EventHandle(this._dialogViewEvents)).detach();

		this._uploader.destroy();
        this._progressBar.destroy();
        this.items.destroy();

		this._uploader         = null;
        this._progressBar      = null;
        this.items             = null;
		this.UPLOADER_TEMPLATE = null;
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this DialogView into its container, encapsulated in a modal panel.

	@method render
	@chainable
	**/
	render: function () {
        var dataTable = new Y.Rednose.DataTable({
			columns: [
                {
                    key: 'name',
					formatter: function (o) {
                        var rowClass;

                        switch (o.data.state) {
                            case STATE_PENDING:
                                rowClass = CSS_BOOTSTRAP_WARNING;
                                break;
                            case STATE_FINISHED:
                                rowClass = CSS_BOOTSTRAP_SUCCESS;
                                break;
                            default:
                                rowClass = CSS_BOOTSTRAP_ERROR;
                                break;
                        }

						o.rowClass = rowClass;
					},
                    nodeFormatter: function (o) {
                        o.cell.set('innerHTML',
                            '<div style="width: 319px;">' + o.data.name + '</div>'
                        );
                    }
                },
                {
                    key: 'type',
                    nodeFormatter: function (o) {
                        o.cell.set('innerHTML',
                            '<div style="width: 120px;">' + o.data.type + '</div>'
                        );
                    }
                },
                {
                    key: 'size',
                    nodeFormatter: function (o) {
                        o.cell.set('innerHTML',
                            '<div style="width: 80px;">' + Y.Rednose.Formatter.size(o.data.size) + '</div>'
                        );
                    }
                },
                {
                    key: 'icon',
                    nodeFormatter: function (o) {
						var icon;

                        switch (o.data.state) {
                            case STATE_PENDING:
                                icon = CSS_ICON_PENDING;
                                break;
                            case STATE_FINISHED:
                                icon = CSS_ICON_FINISHED;
                                break;
                            default:
                                icon = CSS_ICON_FAILED;
                                break;
                        }

                        o.cell.set('innerHTML',
                            '<div style="width: 25px;">' + icon + '</div>'
                        );
                    }
                }
            ],
            data: this.items
        });

        dataTable.render(this.get('container').one('.' + CSS_FILE_LIST));

		return this;
	},

    // -- Protected Methods -----------------------------------------------------

	/**
	Initializes the uploader.

	@method _initializeUploader
	@protected
	**/
	_initializeUploader: function () {
		if (Y.Uploader.TYPE !== 'none' && !Y.UA.ios) {
			var path = this.get('path');

			Y.Uploader.SELECT_FILES_BUTTON = Y.Lang.sub(this.UPLOADER_TEMPLATE, {
				buttonClass: CSS_BOOTSTRAP_BTN + ' ' + CSS_BOOTSTRAP_BTN_PRIMARY + ' ' + CSS_BOOTSTRAP_FLOAT_RIGHT,
				buttonText : this.get('strings.choose_files')
			});

			this._uploader = new Y.Uploader({
				width           : STYLE_UPLOADER_BUTTON_WIDTH,
				height          : STYLE_UPLOAD_BUTTON_HEIGHT,
				multipleFiles   : true,
                uploadURL       : UPLOAD_URL,
				simLimit        : 2,
                postVarsPerFile : { token: YUI.Env.token, path: path },
				withCredentials : false,
				buttonClassNames: { disabled: CSS_BOOTSTRAP_DISABLED }
			});
		}
	},

	/**
	Renders the uploader after the Nav View has rendered the footer section.

	@method _renderUploader
	@protected
	**/
	_renderUploader: function () {
		if (this._uploader) {
			var container = this.get('container');

			container.one('.yui3-widget-ft div').prepend(
				Y.Node.create('<div id="choose-files-button" class="' + CSS_BOOTSTRAP_FLOAT_RIGHT + '"></div>')
			);

			this._uploader.render(this.get('container').one('#choose-files-button'));
		}
	},

    // -- Protected Event Handlers ----------------------------------------------

	/**
	Trigger the upload process after the files have been selected.

	@method _afterFileSelect
	@protected
	**/
	_afterFileSelect: function () {
        var fileList   = this._uploader.get('fileList'),
            filesModel = [];

		if (fileList.length > 0) {

            Y.Array.each(fileList, function (file) {
                filesModel.push(
                    new Y.Model({
                        id   : file.get('id'),
                        name : file.get('name'),
                        type : file.get('type'),
                        size : file.get('size'),
                        state: STATE_PENDING,
                    })
                );
            });

            this.get('container').one('.' + CSS_BODY_TEXT).hide();

            this.items.reset(filesModel);
            this._uploader.uploadAll();
		}
	},

	/**
	Lock the uploader when the upload has started.

	@method _onUploadStart
	@protected
	**/
	_onUploadStart: function () {
		this._uploader.set('enabled', false);

        this._progressBar.show();
        this._progressBar.one('.' + CSS_BOOTSTRAP_BAR).setStyle('width', '0%');
	},

    /**
    Error handler for individual uploads.

    @method _onUploadError
    @protected
    **/
    _onUploadError: function (e) {
        var id   = e.file.get('id'),
            item = this.items.getById(id);

        if (item) {
            item.set('state', STATE_FAILED);
        }
    },

	/**
	Completion handler for individual uploads.

	@method _onUploadComplete
	@protected
	**/
	_onUploadComplete: function (e) {
		var id   = e.file.get('id'),
            item = this.items.getById(id);

        if (item) {
            item.set('state', STATE_FINISHED);
        }
	},

	/**
	Report the overall upload progress.

	@method _onTotalUploadProgress
	@protected
	**/
	_onTotalUploadProgress: function (e) {
		var progress = e.percentLoaded;

        this._progressBar.one('.' + CSS_BOOTSTRAP_BAR).setStyle('width', String(progress) + '%');
	},

	/**
	Completion handler, resets the view to enable new file uploads.

	@method _onAllUploadsComplete
	@protected
	**/
	_onAllUploadsComplete: function () {
		this._uploader.set('enabled', true);
		this._uploader.set('fileList', []);

        this._progressBar.hide();

		this.fire(EVT_UPLOAD_COMPLETE);
	}
}, {
	ATTRS: {
        /**
         * Translation dictionary used by the Lox.App.FileUploadView module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-app-file-upload-view');
            }
        },

        path: {
			value: '/'
		}
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileUploadView = FileUploadView;


}, '@VERSION@', {"requires": ["rednose-formatter", "uploader", "view"], "lang": ["en", "nl"]});
