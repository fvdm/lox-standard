YUI.add('lox-app-file-movecopy-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
A view to copy or move files to a destination folder.

@module lox-app
@submodule lox-app-file-movecopy-view
**/
var TEXT_COPY       = 'Copy',
	TEXT_MOVE       = 'Move',
	TEXT_CANCEL     = 'Cancel',
	TEXT_MOVE_TITLE = 'Move file to...',
	TEXT_COPY_TITLE = 'Copy file to...',

	CSS_FOLDER_TREEVIEW = 'lox-folder-treeview',

	STYLE_TREEVIEW_HEIGHT = '150px',

	TYPE_MOVE = 'move',
	TYPE_COPY = 'copy';

/**
A view to copy or move files to a destination folder.

@class FileMoveCopyView
@namespace Lox.App
@constructor
@extends View
@uses Rednose.View.Nav
**/
var FileMoveCopyView = Y.Base.create('fileMoveCopyView', Y.View, [ Y.Rednose.View.Nav ], {
	// -- Public properties ----------------------------------------------------

	template: '<div><div class="{treeviewClass}"></div></div>',

	close: true,

	buttons: {
		confirm: {
			position: 'right',
			primary: true
		},

		cancel: {
			value: TEXT_CANCEL,
			position: 'right'
		}
	},

	// -- Protected properties -------------------------------------------------

	_treeView: null,

	// -- Lifecycle Methods ----------------------------------------------------

	initializer: function () {
		this._dialogViewEvents || (this._dialogViewEvents = []);

		var container = this.get('container');

		this._dialogViewEvents.push(
			this.on({
				buttonCancel  : this.destroy,
				buttonClose   : this.destroy,
				buttonConfirm : this._handleConfirm
			})
		);

		switch (this.get('type')) {
			case TYPE_MOVE:
				this.title = TEXT_MOVE_TITLE;
				this.buttons.confirm.value = TEXT_MOVE;
				break;

			case TYPE_COPY:
				this.title = TEXT_COPY_TITLE;
				this.buttons.confirm.value = TEXT_COPY;
				break;
		}

		container.setContent(Y.Lang.sub(this.template, {
			treeviewClass: CSS_FOLDER_TREEVIEW
		}));

		container.one('.' + CSS_FOLDER_TREEVIEW).setStyle('height', STYLE_TREEVIEW_HEIGHT);
		container.one('.' + CSS_FOLDER_TREEVIEW).setStyle('overflowY', 'auto');

		this._treeView = new Y.Rednose.TreeView({
			container: container.one('.' + CSS_FOLDER_TREEVIEW),
			model    : this.get('modelTree')
		});
	},

	destructor: function () {
		(new Y.EventHandle(this._dialogViewEvents)).detach();

		this._treeView = null;
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this View into its container (encapsulated in a modal panel).

	@method render
	@chainable
	**/
	render: function () {
		var treeView = this._treeView,
			node     = treeView.rootNode.children[0];

		node && node.open();

		treeView.render();

		node && node.select();

		return this;
	},

	// -- Protected Event Handlers ----------------------------------------------

	_handleConfirm: function (e) {
		var model     = this.get('model'),
			type      = this.get('type'),
			selection = this._treeView.getSelection(),
			path      = selection[0].get('path');

		e.data = {
			model: model,
			path : path,
			type : type
		};
	}
}, {
	ATTRS: {
		type: {
			value: TYPE_MOVE
		},

		model: {
			value: new Y.Lox.ItemModel()
		},

		/**
		The view's ModelTree holding the folders.

		@attribute {Lox.App.FolderTree} modelTree
		**/
		modelTree: {
			value: new Y.Lox.App.FolderTree()
		}
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileMoveCopyView = FileMoveCopyView;


}, '@VERSION@', {"requires": ["lox-app-folder-tree", "rednose-app", "rednose-treeview"]});
