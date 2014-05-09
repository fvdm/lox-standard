YUI.add('lox-app-link-model', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
The link model.

@module lox-app
@submodule lox-app-link-model
**/

/**
The link model.

@class LinkModel
@namespace Lox
@constructor
@extends Model
@uses Rednose.Model.Spinner
**/
var LinkModel = Y.Base.create('linkModel', Y.Model, [ Y.Rednose.Model.Spinner ], {
	// -- Protected Methods ----------------------------------------------------

	/**
	@method sync
	@protected
	**/
    sync: function (action, options, callback) {
        if (action === 'create') {
            Y.io(YUI.Env.routing.link_create + '/' + this.get('path'), {
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
    },

    _setDate: function (value) {
        var date = new Date(value);

        return date;
    }
}, {
	ATTRS: {
		/**
		@attribute public_id
		@type String
		**/
		public_id: {
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
		@attribute uri
		@type String
		**/
		uri: {
			value: null
		},

		/**
		@attribute public_id
		@type DateTime
		**/
		expires: {
			value: null,
			setter: '_setDate'
		},
	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox').LinkModel = LinkModel;


}, '@VERSION@', {"requires": ["model", "rednose-model-spinner"]});
