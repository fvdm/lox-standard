YUI.add('lox-item-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

var TEXT_DOWNLOAD       = 'Download',
    TEXT_SHARE          = 'Share folder',
    TEXT_SHARE_SETTINGS = 'Share settings',
    TEXT_LINK           = 'Create link',
    TEXT_DELETE         = 'Delete',
    TEXT_LEAVE_SHARE    = 'Leave share',
    TEXT_RENAME         = 'Rename',
    TEXT_MOVE           = 'Move',
    TEXT_COPY           = 'Copy';

var SHARE_CONTEXT_MENU_CONTENT = [
        { title: TEXT_LEAVE_SHARE, icon: 'share',              id: 'leave'},
        { title: TEXT_DELETE,      icon: 'remove-circle',      id: 'delete'},
        { title: TEXT_RENAME,      icon: 'edit',               id: 'rename' },
        { title: TEXT_MOVE,        icon: 'circle-arrow-right', id: 'move' },
        { title: TEXT_COPY,        icon: 'check',              id: 'copy' }
    ],

    SHARED_CONTEXT_MENU_CONTENT = [
        { title: TEXT_SHARE_SETTINGS, icon: 'share',              id: 'share'},
        { title: TEXT_DELETE,         icon: 'remove-circle',      id: 'delete'},
        { title: TEXT_RENAME,         icon: 'edit',               id: 'rename' },
        { title: TEXT_MOVE,           icon: 'circle-arrow-right', id: 'move' },
        { title: TEXT_COPY,           icon: 'check',              id: 'copy' }
    ],

    FOLDER_CONTEXT_MENU_CONTENT = [
        { title: TEXT_SHARE,  icon: 'share',              id: 'share'},
        { title: TEXT_DELETE, icon: 'remove-circle',      id: 'delete'},
        { title: TEXT_RENAME, icon: 'edit',               id: 'rename' },
        { title: TEXT_MOVE,   icon: 'circle-arrow-right', id: 'move' },
        { title: TEXT_COPY,   icon: 'check',              id: 'copy' }
    ],

    FILE_CONTEXT_MENU_CONTENT = [
        { title: TEXT_LINK,     icon: 'globe',              id: 'link'},
        { title: TEXT_DOWNLOAD, icon: 'download',           id: 'download' },
        { title: TEXT_DELETE,   icon: 'remove-circle',      id: 'delete'},
        { title: TEXT_RENAME,   icon: 'edit',               id: 'rename' },
        { title: TEXT_MOVE,     icon: 'circle-arrow-right', id: 'move' },
        { title: TEXT_COPY,     icon: 'check',              id: 'copy' }
    ];

var	TEXT_CREATE_FOLDER_TITLE = 'Create a new folder...',
	TEXT_CREATE_FOLDER_LABEL = 'Name',
	TEXT_BUTTON_CREATE       = 'Create',
	TEXT_BUTTON_CANCEL       = 'Cancel',
	TEXT_TITLE_CREATED       = 'Created',
	TEXT_FOLDER_CREATED      = 'Folder successfully created.',

	TEXT_NAME        = 'Name',
    TEXT_SIZE        = 'Size',
    TEXT_MODIFIED    = 'Modified',
    TEXT_UPLOAD_FILE = 'Upload files',
    TEXT_NEW_FOLDER  = 'New folder',
    TEXT_MENU        = 'Actions';

/**
Header subview.
**/
Y.Lox.ItemView = Y.Base.create('itemView', Y.View, [], {
	template: '<div class="libbit-lox-header">' +
                  '<div class="header-top">' +
                      '<div id="breadcrumb" class="pull-left"></div>' +
                      '<form class="pull-right">' +
                          '<div class="btn-group">' +
                              '<button title="{titleUpload}" rel="tooltip" id="lox-upload-button" type="button" class="btn">' +
                                  '<i class="icon-upload"></i>' +
                              '</button>' +
                              '<button title="{titleNewFolder}" rel="tooltip" id="lox-newfolder-button" type="button" class="btn">' +
                                  '<i class="icon-folder-close"></i>' +
                              '</button>' +
                          '</div>' +
                      '</form>' +
                  '</div>' +
                  '<div class="header-bottom">' +
                      '<table class="table">' +
                          '<thead>' +
                              '<tr>' +
                                  '<th class="span4">{name}</th>' +
                                  '<th class="span2">{size}</th>' +
                                  '<th class="span2">{modified}</th>' +
                              '</tr>' +
                          '<thead>' +
                      '</table>' +
                      '<div class="details" style="display: none;">' +
                          '<div class="item-name pull-left"></div>' +
                          '<div class="menu dropdown pull-right">' +
                              '<a href="#" class="dropdown-toggle" data-toggle="dropdown">{menu} <b class="caret"></b></a>' +
                              '<ul class="dropdown-menu"></ul>' +
                          '</div>' +
                      '</div>' +
                  '</div>' +
              '</div>',

	/**
	UI delegation events

	@property events
	@type {Object}
	**/
	events: {
        '#lox-upload-link': {
            click: '_handleUpload'
        },

		'#lox-upload-button': {
            click: '_handleUpload'
		},

		'#lox-newfolder-button': {
			click: '_handleCreateFolder'
		}
	},

	initializer: function () {
		var container = this.get('container'),
			item      = this.get('model');

		container.setHTML(Y.Lang.sub(this.template, {
			name          : TEXT_NAME,
			size          : TEXT_SIZE,
			modified      : TEXT_MODIFIED,
			titleUpload   : TEXT_UPLOAD_FILE,
			titleNewFolder: TEXT_NEW_FOLDER,
            menu          : TEXT_MENU
		}));

        container.one('.libbit-lox-header').plug(Y.Plugin.Affix, {
            offset: {
                top: 40
            }
        });

        // Init breadcrumb.
		this.breadcrumbView = new Y.Rednose.Breadcrumb({
			container: container.one('#breadcrumb'),
			path     : item.get('path')
		});

        this.breadcrumbView.addTarget(this);

		this.on('*:navigate', this._handleNavigate);

        this.after('selectionChange', this._afterSelectionChange, this);

        // Init dropdown.
        var dropdown = container.one('.menu');

        dropdown.on('click', function (e) {
            // Stop propagation so we don't trigger a deselect on the datatable.
            e.stopImmediatePropagation();
        });
	},

	destructor: function () {
        this.breadcrumbView.destroy();

        delete this.breadcrumbView;
	},

	render: function () {
		this.breadcrumbView.render();

		return this;
	},

	_handleNavigate: function (e) {
		var path = e.data;

		if (path) {
			this.fire('navigateItem', { path: path });
		}
	},

	/**
	@method _handleCreateFolder
    @param {EventFacade} e Event
	@protected
	**/
	_handleUpload: function (e) {
        e.preventDefault();

		this.fire('upload');
	},

	/**
	@method _handleCreateFolder
	@protected
	**/
	_handleCreateFolder: function () {
		var dialog = new Y.Rednose.Dialog(),
			path   = this.get('model').get('path'),
			self   = this;

		dialog.prompt({
			title  : TEXT_CREATE_FOLDER_TITLE,
			text   : TEXT_CREATE_FOLDER_LABEL,
			confirm: TEXT_BUTTON_CREATE,
			cancel : TEXT_BUTTON_CANCEL
		}, function (value) {

            Y.io(YUI.Env.routing.operations_create_folder, {
                method: 'POST',
                data: { 'path': path + '/' + value },
                on : {
                    success : function (tx, r) {
                        var data = Y.JSON.parse(r.responseText),
                            item = new Y.Lox.ItemModel();

                        item.setAttrs(item.parse(data));

                        dialog.destroy();

                        self.fire('itemAdded', { data: item });

						Y.Rednose.Notifier.notify({
							title: TEXT_TITLE_CREATED,
							text : TEXT_FOLDER_CREATED,
							type : 'success'
						});
                    },
                    failure : function (tx, r) {
                        var err = r.responseText && Y.JSON.parse(r.responseText);

                        if (err.error) {
							dialog.set('error', {
								message: err.error
							});
                        }
                    }
                }
			});
		});
	},

    /**
    @method _afterSelectionChange
    @protected
    **/
    _afterSelectionChange: function (e) {
        var model     = e.newVal,
            container = this.get('container');

        if (model !== null) {
            var dropdown = container.one('.menu'),
                navBar   = new Y.Rednose.Navbar(),
                content  = null;

            container.one('.item-name').setContent(model.get('title'));

            dropdown.one('ul').empty();

            navBar.addTarget(this);

            if (model.get('isDir')) {
                if (model.get('isShare')) {
                    content = SHARE_CONTEXT_MENU_CONTENT;
                } else if (model.get('isShared')) {
                    content = SHARED_CONTEXT_MENU_CONTENT;
                } else {
                    content = FOLDER_CONTEXT_MENU_CONTENT;
                }
            } else {
                content = FILE_CONTEXT_MENU_CONTENT;
            }

            navBar.createDropdown(dropdown, content);

            container.one('.table').hide();
            container.one('.details').show();
        } else {
            container.one('.details').hide();
            container.one('.table').show();
        }
    }
}, {
    ATTRS: {
        /**
        The current selection.

        @attribute selection
        @type Lox.ItemModel
        **/
        selection: {
            value: null
        }
    }
});

}, '@VERSION@', {
    "requires": [
        "gallery-affix",
        "lox-app-item-model",
        "rednose-app",
        "rednose-breadcrumb",
        "rednose-dialog",
        "rednose-navbar",
        "rednose-notifier",
        "view"
    ]
});


