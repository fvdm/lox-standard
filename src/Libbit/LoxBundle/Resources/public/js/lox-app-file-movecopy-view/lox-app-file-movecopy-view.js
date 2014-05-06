YUI.add('lox-app-file-movecopy-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
A view to copy or move files to a destination folder.

@module lox-app
@submodule lox-app-file-movecopy-view
**/
var CSS_FOLDER_TREEVIEW = 'lox-folder-treeview',

	STYLE_TREEVIEW_HEIGHT = '100%',

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

	padding: true,
    
    close: true,

	buttons: {
		confirm: {
			position: 'right',
			primary: true
		},

		cancel: {
            value: Y.Intl.get('lox-app-file-movecopy-view').cancel,
			position: 'right'
		}
	},

	// -- Protected properties -------------------------------------------------

	_treeView: null,

	// -- Lifecycle Methods ----------------------------------------------------

	initializer: function () {
		this._dialogViewEvents || (this._dialogViewEvents = []);

		var container = this.get('container'),
            strings   = this.get('strings');

		this._dialogViewEvents.push(
			this.on({
				buttonCancel  : this.destroy,
				buttonClose   : this.destroy,
				buttonConfirm : this._handleConfirm
			})
		);

		switch (this.get('type')) {
			case TYPE_MOVE:
				this.title = strings.move_title;
				this.buttons.confirm.value = strings.move;
				break;

			case TYPE_COPY:
				this.title = strings.copy_title;
				this.buttons.confirm.value = strings.copy;
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
        /**
         * Translation dictionary used by the Lox.App.FileMoveCopyView module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-app-file-movecopy-view');
            }
        },

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


}, '@VERSION@', {"requires": ["lox-app-folder-tree", "rednose-treeview", "rednose-view-nav", "view"], "lang": ["en"]});
