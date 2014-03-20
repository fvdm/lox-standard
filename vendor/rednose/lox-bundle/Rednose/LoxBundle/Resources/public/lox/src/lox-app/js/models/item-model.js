/*jshint expr:true, onevar:false */

/**
The item model.

@module lox-app
@submodule lox-app-item-model
**/

/**
The item model.

@class ItemModel
@namespace Lox
@constructor
@extends Model
@uses Rednose.Model.Spinner
**/
var ItemModel = Y.Base.create('itemModel', Y.Model, [ Y.Rednose.Model.Spinner ], {
	// -- Protected Methods ----------------------------------------------------

	/**
	@method getBase
	@public
	**/
	getBase: function () {
		var parts = this.get('path').split('/');

		parts.pop();

		return parts.join('/');
	},

	/**
	@method parse
	@protected
	**/
    parse: function (o) {
        return {
            id           : o.path,
            title        : o.title,
            isDir        : o.is_dir,
            modifiedAt   : o.modifiedAt,
            dateFormatted: o.date_formatted,
            path         : o.path,
            mimeType     : o.mime_type,
            size         : o.size,
            icon         : o.icon,
            parent       : o.parent,
            children     : o.children,
            isShare      : o.is_share,
            isShared     : o.is_shared
        };
    },

	/**
	@method sync
	@protected
	**/
    sync: function (action, options, callback) {
        if (action === 'read') {
            Y.io(YUI.Env.routing.metadata + (this.get('path') === '/' ? '' : this.get('path')), {
                method: 'GET',
                on : {
                    success : function (tx, r) {
                        callback(null, r.responseText && Y.JSON.parse(r.responseText));
                    },
                    failure : function (tx, r) {
                        callback(r.responseText && Y.JSON.parse(r.responseText));
                    }
                }
            });
        }

        if (action === 'delete') {
            Y.io(YUI.Env.routing.operations_delete, {
                method: 'POST',
                data: { 'path': this.get('path') },
                on : {
                    success : function (tx, r) {
                        callback(null, r.responseText && Y.JSON.parse(r.responseText));
                    },
                    failure : function (tx, r) {
                        callback(r.responseText && Y.JSON.parse(r.responseText));
                    }
                }
            });
        }
    }
}, {
	ATTRS: {
		/**
		@attribute title
		@type String
		**/
		title: {
			value: null
		},

		/**
		@attribute isDir
		@type Boolean
		**/
		isDir: {
			value: null
		},

		/**
		@attribute isShare
		@type Boolean
		**/
		isShare: {
			value: null
		},

		/**
		@attribute isShared
		@type Boolean
		**/
		isShared: {
			value: null
		},

		/**
		@attribute modifiedAt
		@type String
		**/
		modifiedAt: {
			value: null
		},

		/**
		@attribute path
		@type String
		**/
		path: {
			value: null
		},

		/**
		@attribute mimeType
		@type String
		**/
		mimeType: {
			value: null
		},

		/**
		@attribute parent
		@type Lox.App.ItemModel
		**/
		parent: {
			value: null,
			setter: function (value) {
				if (value === null) {
                    return null;
				}

                return new ItemModel(value);
			}
		},

		/**
		@attribute children
		@type Array
		**/
		children: {
			value: null,
            setter: function (value) {
                if (value === null) {
                    return null;
                }

                var models = [],
                    self   = this;

                Y.Array.each(value, function (o) {
                    models.push(new ItemModel(self.parse(o)));
                });

                return models;
            }
		}
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox').ItemModel = ItemModel;
