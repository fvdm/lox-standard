YUI.add('lox-app-share-model', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
The share model.

@module lox-app
@submodule lox-app-share-model
**/

/**
The share model.

@class ShareModel
@namespace Lox
@constructor
@extends Model
@uses Rednose.Model.Spinner
**/
var ShareModel = Y.Base.create('shareModel', Y.Model, [ Y.Rednose.Model.Spinner ], {
    // -- Protected Methods ----------------------------------------------------

    /**
    @method parse
    @protected
    **/
    parse: function (o) {
        return {
            id        : o.id,
            item      : o.item,
            identities: o.identities
        };
    },

    /**
    @method sync
    @protected
    **/
    sync: function (action, options, callback) {
        if (action === 'read') {
            Y.io(YUI.Env.routing.shares_base + options.path, {
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

        if (action === 'create') {
            Y.io(YUI.Env.routing.shares_base + this.get('item').get('path') + '/new', {
                method: 'POST',
                data: Y.JSON.stringify(this.toJSON()),
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

        if (action === 'update') {
            Y.io(YUI.Env.routing.shares_base + '/' + this.get('id') + '/edit', {
                method: 'POST',
                data: Y.JSON.stringify(this.toJSON()),
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
            Y.io(YUI.Env.routing.shares_base + '/' + this.get('id') + '/remove', {
                method: 'POST',
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
        @attribute item
        @type Lox.ItemModel
        **/
        item: {
            value: null,
            setter: function (value) {
                if (value === null) {
                    return null;
                }

                return value instanceof Y.Lox.ItemModel ? value : new Y.Lox.ItemModel(value);
            }
        },

        /**
        @attribute identities
        @type ModelList
        **/
        identities: {
            value: new Y.ModelList(),
            setter: function (value) {
                if (value === null) {
                    return null;
                }

                return value instanceof Y.ModelList ? value : new Y.ModelList({ items: value });
            }
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox').ShareModel = ShareModel;


}, '@VERSION@', {"requires": ["io", "json", "lox-app-item-model", "model", "model-list", "rednose-model-spinner"]});
