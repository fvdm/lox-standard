YUI.add('lox-app-file-browser-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/** Provides the filebrowser view.

@module lox-app
@submodule lox-app-file-browser-view
**/
var WELCOME_TEMPLATE = '<p class="text-center"><strong>Welcome to LocalBox</strong></p>' +
                       '<p class="text-center">' +
                           'With LocalBox, it\'s safe and easy<br/>' +
                           'to store your files where and whenever<br/>' +
                           'you want.' +
                       '</p>' +
                       '<p class="text-center"><a id="lox-upload-link" href="#">Upload</a> your files and share them with your colleagues.</p>';

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
    TEXT_NEW_FOLDER  = 'New folder';
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

var	TEXT_DELETE_TITLE   = 'Delete item \'{item}\'?',
	TEXT_DELETE_BODY    = 'The item will be removed. Are you sure you want to delete it?',
	TEXT_TITLE_ERROR    = 'Error',
	TEXT_TITLE_DELETED  = 'Deleted',
	TEXT_ITEM_DELETED   = 'Item successfully deleted.',
	TEXT_RENAME_TITLE   = 'Rename item \'{item}\'?',
	TEXT_RENAME_LABEL   = 'Name',
	TEXT_TITLE_RENAMED  = 'Renamed',
	TEXT_ITEM_RENAMED   = 'Item successfully renamed.',
    TEXT_EMPTY          = 'This folder is empty',

    CSS_ICON_PREFIX = 'icon-file-16-',
    CSS_FILE_TITLE  = 'file-title',

    CSS_BOOTSTRAP_URL = 'url',

	ITEM_FOLDER_SIZE     = '--',
	ITEM_FOLDER_MODIFIED = '--';

/**
List subview.
**/
Y.Lox.ItemListView = Y.Base.create('itemListView', Y.View, [], {
	// -- Public Properties ----------------------------------------------------

    template: '<div class="libbit-lox-body">' +
                  '<div class="file-table"/>' +
              '</div>',

	/**
	UI delegation events

	@property events
	@type {Object}
	**/
	events: {
		'.rednose-datatable-data tr a': {
            click: '_clickItem'
		},

		'.rednose-datatable-data tr': {
			contextmenu: '_handleRowContext'
		}
	},

	// -- Lifecycle Methods ----------------------------------------------------

	/**
	@method initializer
	@protected
	**/
	initializer: function () {
		this.get('container').setHTML(this.template);

		this._initDatatable();
	},

	/**
	@method destructor
	@protected
	**/
	destructor: function () {
		this._dataTable.destroy();

		this._dataTable = null;
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this DialogView into its container, encapsulated in a modal panel.

	@method render
	@chainable
	**/
	render: function () {
		var container = this.get('container'),
			dataTable = this._dataTable;

		dataTable.render(container.one('.file-table'));

		return this;
	},

	// -- Protected Methods -----------------------------------------------------

	/**
	Initializes the datatable with the correct formatting.

	@method _initDatatable
	@protected
	**/
	_initDatatable: function () {
		var items = this.get('modelList'),
			dataTable;

		dataTable = this._dataTable = new Y.Rednose.DataTable({
			columns: [
				{
					key: 'title',
					nodeFormatter: function (o) {
						o.cell.addClass('span4');

						o.cell.set('innerHTML', Y.Lang.sub(
							'<div class="{classTitle}">' +
								'<i class="{iconClass}"></i> ' +
                                '<a href="#" class="{classUrl}">{title}</a>' +
							'</div>',
							{
								classTitle: CSS_FILE_TITLE,
								iconClass : CSS_ICON_PREFIX + o.data.icon,
								classUrl  : CSS_BOOTSTRAP_URL,
								title     : o.data.title
							}
						));
					},
					sortable: true
				},
				{
					key: 'size',
					nodeFormatter: function (o) {
						o.cell.addClass('span2');

						o.cell.set('text', o.data.isDir ? ITEM_FOLDER_SIZE : Y.Rednose.Formatter.size(o.data.size));
					}
				},
				{
					key: 'dateFormatted',
					nodeFormatter: function (o) {
						o.cell.addClass('span2');

						o.cell.set('text', o.data.isDir === true ? ITEM_FOLDER_MODIFIED : o.data.dateFormatted);
					}
				}
			],
			sortBy: 'title',
			data: items
		}).plug(Y.Rednose.DataTableSelectPlugin);

        dataTable.addTarget(this);
	},

	// -- Protected Event Handlers ----------------------------------------------

    /**
    Show the detail view.

    @method _clickItem
    @param {EventFacade} e Event
    @protected
    **/
	_clickItem: function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();

        var items = this.get('modelList'),
            item  = items.getByClientId(e.currentTarget.ancestor('tr').getAttribute('data-yui3-record'));

        if (item) {
			if (item.get('isDir') === true) {
				this.fire('navigateItem', { path: item.get('path') });
			} else {
				this.fire('showItemDetail', { model: item });
			}
		}
	},

	/**
	Delegate handler for the table rows to bind a context menu.

	@method _handleRowContext
	@param {EventFacade} e Event
	@protected
	**/
	_handleRowContext: function (e) {
        e.preventDefault();

		var node     = e.currentTarget,
			clientId = node.getAttribute('data-yui3-record'),
			model    = this.get('modelList').getByClientId(clientId),
			x        = e.pageX,
			y        = e.pageY,
            content;

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

		if (node.contextMenu) {
			return false;
		}

		node.plug(Y.Rednose.ContextMenu, {
			content     : content,
			data        : model,
			bubbleTarget: this
		});

		node.contextMenu.open(x, y);
	}
});

/**
Provides the filebrowser view.

@class FileBrowserView
@param {Object} [config] Config properties.
	@param {Object} [config.container] The container the view will be rendered in.
@namespace Lox.App
@constructor
@extends View
**/
var FileBrowserView = Y.Base.create('fileBrowserView', Y.View, [], {
	// -- Lifecycle Methods ----------------------------------------------------

	/**
	@method initializer
	@protected
	**/
	initializer: function () {
        this._fileBrowserViewEvents || (this._fileBrowserViewEvents = []);

        var item     = this.get('model'),
            children = this.get('modelList');

        this.itemView     = new Y.Lox.ItemView({ model: item });
        this.itemListView = new Y.Lox.ItemListView({ modelList: children });

        this.itemView.addTarget(this);
        this.itemListView.addTarget(this);

        this._fileBrowserViewEvents.push(
            this.on({
                '*:link'    : this._handleCreateLink,
                '*:download': this._handleDownload,
                '*:delete'  : this._handleDelete,
                '*:rename'  : this._handleRename,

                '*:leave': this._prepEvent,
                '*:share': this._prepEvent,
                '*:move' : this._prepEvent,
                '*:copy' : this._prepEvent,

                '*:itemAdded': this._handleItemAdded,
                '*:select'   : this._handleSelect
            }),

            children.after(['add', 'reset', 'remove'], this._checkCount, this)
        );
	},

	/**
	@method destructor
	@protected
	**/
	destructor: function () {
        (new Y.EventHandle(this._fileBrowserViewEvents)).detach();

        this.itemView.destroy();
        this.itemListView.destroy();

        delete this.itemView;
        delete this.itemListView;
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this DialogView into its container, encapsulated in a modal panel.

	@method render
	@chainable
	**/
	render: function () {
		var container = this.get('container'),
			content   = Y.one(Y.config.doc.createDocumentFragment());

        content.append(this.itemView.render().get('container'));
        content.append(this.itemListView.render().get('container'));

        container.setHTML(content);

        this._checkCount();

        return this;
	},

    // -- Protected Event Handlers ----------------------------------------------

    _checkCount: function () {
        var container = this.get('container'),
            list      = this.get('modelList'),
            model     = this.get('model');

        if (list.get('items').length === 0) {
            var message = Y.Lang.sub('<h4>{empty}</h4>', { empty: TEXT_EMPTY });

            if (model.get('path') === '/') {
                message = WELCOME_TEMPLATE;
            }

            container.one('.table').append(
                '<tbody class="table-message">' +
                    '<tr>' +
                        '<td colspan="3">' + message + '</td>' +
                    '</tr>' +
                '</tbody>'
            );
        } else {
            container.all('tbody.table-message').remove();
        }
    },

    /**
    @method _handleSelect
    @param {EventFacade} e Event
    @protected
    **/
    _handleSelect: function (e) {
        var model = e.model;

        this.itemView.set('selection', model);
    },

    /**
    @method _handleItemAdded
    @param {EventFacade} e Event
    @protected
    **/
    _handleItemAdded: function (e) {
        var item = e.data;

        this.itemListView.get('modelList').add(item);
    },

    /**
    @method _handleCreateLink
    @param {EventFacade} e Event
    @protected
    **/
    _handleCreateLink: function (e) {
        var item = e.data || this.itemView.get('selection');

        if (item) {
            Y.config.win.open(YUI.Env.routing.link_create + item.get('path'), '_blank');
        }
    },

    /**
    @method _handleDownload
    @param {EventFacade} e Event
    @protected
    **/
    _handleDownload: function (e) {
        var item = e.data || this.itemView.get('selection');

        if (item) {
            Y.config.win.location = YUI.Env.routing.item + item.get('path') + '?download=1';
        }
    },

    /**
    @method _handleDelete
    @param {EventFacade} e Event
    @protected
    **/
    _handleDelete: function (e) {
        var item = e.data || this.itemView.get('selection');

        if (item) {
            Y.Rednose.Dialog.confirm({
                title  : Y.Lang.sub(TEXT_DELETE_TITLE, { item: item.get('title') }),
                text   : TEXT_DELETE_BODY,
                confirm: TEXT_DELETE,
                type   : 'danger'
            }, function () {
                item.destroy({remove: true}, function (err) {
                    if (err) {
                        Y.Rednose.Notifier.notify({
                            title: TEXT_TITLE_ERROR,
                            text : err.error || '',
                            type : 'error'
                        });
                    } else {
                        Y.Rednose.Notifier.notify({
                            title: TEXT_TITLE_DELETED,
                            text : TEXT_ITEM_DELETED,
                            type : 'success'
                        });
                    }
                });
            });
        }
    },

    /**
    @method _handleRename
    @param {EventFacade} e Event
    @protected
    **/
    _handleRename: function (e) {
        var item   = e.data || this.itemView.get('selection');
            dialog = new Y.Rednose.Dialog(),
            self   = this;

        dialog.prompt({
            title  : Y.Lang.sub(TEXT_RENAME_TITLE, { item: item.get('title') }),
            text   : TEXT_RENAME_LABEL,
            confirm: TEXT_RENAME,
            value  : item.get('title')
        }, function (value) {
            var fromPath = item.get('path'),
                toPath   = item.getBase() + '/' + value;

            Y.io(YUI.Env.routing.operations_move, {
                method: 'POST',
                data: { 'from_path': fromPath, 'to_path': toPath },
                on : {
                    success : function () {
                        dialog.destroy();
                        self.fire('reload');

                        Y.Rednose.Notifier.notify({
                            title: TEXT_TITLE_RENAMED,
                            text : TEXT_ITEM_RENAMED,
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

    _prepEvent: function (e) {
        e.data || (e.data = this.itemView.get('selection'));
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileBrowserView = FileBrowserView;


}, '@VERSION@', {
    "requires": [
        "datatable-select",
        "gallery-affix",
        "lox-app-file-movecopy-view",
        "lox-app-item-model",
        "rednose-app",
        "rednose-breadcrumb",
        "rednose-contextmenu",
        "rednose-datatable-select",
        "rednose-dialog",
        "rednose-formatter",
        "rednose-navbar",
        "rednose-notifier"
    ]
});
