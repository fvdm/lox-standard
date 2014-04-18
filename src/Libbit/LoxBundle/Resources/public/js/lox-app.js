YUI.add('lox-app', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
The filemanager app.

@module lox-app
**/
var TEXT_TITLE_ERROR    = 'Error',
	TEXT_TITLE_COPIED   = 'Copied',
	TEXT_ITEM_COPIED    = 'Item successfully copied.',
	TEXT_TITLE_MOVED    = 'Moved',
	TEXT_ITEM_MOVED     = 'Item successfully moved.',
	TEXT_UNSHARE        = 'Unshare',
	TEXT_UNSHARE_TITLE  = 'Unshare folder \'{item}\'?',
	TEXT_UNSHARE_BODY   = 'The folder will no longer be shared and will be visible to only you. Are you sure you want to stop sharing?',
	TEXT_TITLE_UNSHARED = 'Share removed',
	TEXT_ITEM_UNSHARED  = 'The folder is no longer shared';

/**
The filemanager app.

@class App
@namespace Lox
@constructor
@extends Rednose.App
**/
var App = Y.Base.create('app', Y.Rednose.App, [], {

	views: {
		itemView: {
			type: 'Lox.App.FileBrowserView'
		},

		uploadView: {
			type  : 'Lox.App.FileUploadView',
			parent: 'itemView',
            width : '640px',
            height: '250px',
			modal : true
		},

		detailView: {
			type  : 'Lox.App.FileDetailView',
			parent: 'itemView',
            width : '500px',
            height: '300px',
			modal : true
		},

		moveCopyView: {
			type  : 'Lox.App.FileMoveCopyView',
			parent: 'itemView',
            width : '500px',
            height: '400px',
			modal : true
		},

		folderShareView: {
			type  : 'Lox.App.FolderShareView',
			parent: 'itemView',
            width : '640px',
            height: '400px',
			modal : true
		}
	},

	// -- Lifecycle Methods ----------------------------------------------------

	initializer: function (config) {
		config || (config = {});

		new Y.Rednose.Tooltip({ selector : '*[rel=tooltip]' });

		this.on({
			'*:buttonClose'   : this.popModalView,
			'*:buttonCancel'  : this.popModalView,

			'*:reload'        : this._handleReload,
			'*:uploadcomplete': this._handleReload,

			'*:navigateItem'  : this._navigateToItemView,
			'*:showItemDetail': this._showDetailItem,
			'*:upload'        : this._handleUpload,

			'*:leave': this._handleLeaveShare,
			'*:share': this._handleShareFolder,
			'*:move' : this._handleMoveCopy,
			'*:copy' : this._handleMoveCopy,

			'fileMoveCopyView:buttonConfirm': this._handleMoveCopyConfirm,
			'folderShareView:buttonConfirm' : this._handleShareConfirm,
			'folderShareView:buttonRemove'  : this._handleShareRemove
		});
    },

	// -- Public Methods -------------------------------------------------------

	render: function () {
		if (this.hasRoute(this.getPath())) {
			this.dispatch();
		} else {
			this.showView('itemView', {
				modelList: this.get('item')
			});
		}

		return this;
	},

	// -- Protected Event Handlers ----------------------------------------------

	/**
	@method _handleUpload
	@protected
	**/
	_handleUpload: function () {
		var path = this.get('item').get('path');

		this.showView('uploadView', {
			path: path
		});
	},

    _navigateToItemView: function (e) {
        var path = e.path;

        this.navigate(path);
    },

    _showDetailItem: function (e) {
		var model = e.model;

        this.showView('detailView', {
            model: model
        });
    },

	_handleShareFolder: function (e) {
		var model = e.data,
			self  = this;

		model.load(function () {
			if (model.get('isShared')) {
				var share = new Y.Lox.ShareModel();

				share.load({ path: model.get('path') }, function () {
					self.showView('folderShareView', {
						model: share
					});
				});
			} else {
				self.showView('folderShareView', {
					model: new Y.Lox.ShareModel({
						item: model
					})
				});
			}
		});
	},

	_handleLeaveShare: function (e) {
		var model = e.data;

        Y.io(YUI.Env.routing.shares_base + model.get('path') + '/leave', {
            method: 'POST',
            on: {
                success : function () {
					model.destroy();
                }
            }
        });
	},

	_handleMoveCopy: function (e) {
		var model     = e.data,
			type      = (e.type === 'contextMenu:move' || e.type === 'navbar:move') ? 'move' : 'copy',
			modelTree = new Y.Lox.App.FolderTree(),
			self      = this;

		modelTree.load(function () {
			self.showView('moveCopyView', {
				type     : type,
				model    : model,
				modelTree: modelTree
			});
		});
	},

	// TODO: Prevent folder recursion.
	_handleMoveCopyConfirm: function (e) {
		var type  = e.data.type,
			model = e.data.model,
			path  = (e.data.path === '/') ? '' : e.data.path,
			route = (type === 'move') ? 'operations_move' : 'operations_copy',
			self  = this;

		this.popModalView();

        Y.io(YUI.Env.routing[route], {
            method: 'POST',
            data: { 'from_path': model.get('path'), 'to_path': path + '/' + model.get('title') },
            on : {
                success : function () {
					self.fire('reload');

					Y.Rednose.Notifier.notify({
						title: (type === 'move') ? TEXT_TITLE_MOVED : TEXT_TITLE_COPIED,
						text : (type === 'move') ? TEXT_ITEM_MOVED : TEXT_ITEM_COPIED,
						type : 'success'
					});
                },
                failure : function (tx, r) {
                    var err = r.responseText && Y.JSON.parse(r.responseText);

					Y.Rednose.Notifier.notify({
						title: TEXT_TITLE_ERROR,
						text : err.error,
						type : 'error'
					});
                }
            }
		});
	},

	_handleShareConfirm: function (e) {
		var model = e.data.model,
			self  = this;

		// TODO: Show spinner.
		model.save(function () {
			self.popModalView();

			self.fire('reload');
		});
	},

	_handleShareRemove: function (e) {
		var model = e.data.model,
			self  = this;

		this.popModalView();

		Y.Rednose.Dialog.confirm({
			title  : Y.Lang.sub(TEXT_UNSHARE_TITLE, { item: model.get('item').get('title') }),
			text   : TEXT_UNSHARE_BODY,
			confirm: TEXT_UNSHARE,
			type   : 'warning'
		}, function () {
			model.destroy({ remove: true }, function () {
				Y.Rednose.Notifier.notify({
					title: TEXT_TITLE_UNSHARED,
					text : TEXT_ITEM_UNSHARED,
					type : 'success'
				});

				self.fire('reload');
			});
		});
	},

	_handleReload: function () {
		var self = this;

		this.get('item').load(function () {
			self.get('children').reset(self.get('item').get('children'));
		});
	},

	// -- Route Handlers -------------------------------------------------------

    _handleItem: function (req, res, next) {
		var path = req.path,
			item = this.get('item'),
			self = this;

		if (path === item.get('path') && !item.isNew()) {
			req.item = item;
			next();
		} else {
			item = new Y.Lox.ItemModel({ path: path });

			item.load(function () {
				self.set('item', item);
				req.item = item;
				next();
			});
		}
	},

	_handleChildren: function (req, res, next) {
		var item     = req.item,
			children = this.get('children');

		req.children = children;

		if (item === children.get('item')) {
			next();
		} else {
			children.set('item', item).reset(item.get('children'));
			next();
		}
	},

    _showItemPage: function (req) {
        this.showView('itemView', {
            model    : req.item,
            modelList: req.children
        });
    }
}, {
	ATTRS: {
        item    : { value: new Y.Lox.ItemModel() },
        children: { value: new Y.ModelList({ model: Y.Lox.ItemModel })},

		root: {
			value: YUI.Env.routing.home
		},

		routes: {
			value: [
				{
					path: '/*',
					callbacks: [
						'_handleItem',
						'_handleChildren',
						'_showItemPage'
					]
				}
			]
		}
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').App = App;


}, '@VERSION@', {
    "requires": [
        "lox-app-item-model",
        "lox-app-file-browser-view",
        "lox-app-file-movecopy-view",
        "lox-app-file-detail-view",
        "lox-app-file-upload-view",
        "lox-app-folder-share-view",
        "lox-app-folder-tree",
        "rednose-app",
        "rednose-tooltip"
    ]
});