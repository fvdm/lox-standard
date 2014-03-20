/*jshint expr:true, onevar:false */

/**
The folder tree model.

@module lox-app
@submodule lox-app-folder-tree
**/
var ATTR_NAME_FOLDER = 'folder';

/**
The folder tree model.

@class FolderTree
@namespace Lox.App
@constructor
@extends Rednose.ModelTree
@uses Rednose.Model.Spinner
**/
var FolderTree = Y.Base.create('folderTree', Y.Rednose.ModelTree, [ Y.Rednose.Model.Spinner ], {
	// -- Protected Methods ----------------------------------------------------

	/**
	@method parse
	@protected
	**/
	parse: function (res) {
		this.set('items', this._process([res]));
	},

	/**
	@method _process
	@protected
	**/
	_process: function (items) {
		var nodes = [],
			self  = this;

		Y.each(items, function (item) {
			var node = {},
				model;

			model = new Y.Model({
				title: item.title,
				path:  item.path
			});

			node.label    = item.title;
			model.name    = ATTR_NAME_FOLDER;
			node.data     = model;
			node.children = self._process(item.children);

			nodes.push(node);
		});

		return nodes;
	},

	/**
	@method sync
	@protected
	**/
	sync: function (action, options, callback) {
		if (action === 'read') {
			Y.io(YUI.Env.routing.tree, {
				method: 'GET',
				on : {
					success: function (tx, r) {
						callback(null, Y.JSON.parse(r.responseText));
					},
					failure: function (tx, r) {
						callback(Y.JSON.parse(r.responseText));
					}
				}
			});
		}
	}
}, {
	ATTRS: {
		/**
		@attribute icons
		@type {Object}
		**/
		icons: {
			value: {
				'folder': ['icon-folder-open', 'icon-folder-close']
			}
		}
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FolderTree = FolderTree;
