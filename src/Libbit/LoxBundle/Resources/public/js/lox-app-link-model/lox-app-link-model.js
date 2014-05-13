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
        if (action === 'create' || action === 'update' || action === 'delete' || (action === 'read' && this.get('public_id'))) {
            var route = '';

            if (action === 'create') {
                route = YUI.Env.routing.link_create + '/' + this.get('path');
            } else if (action === 'read') {
                route = YUI.Env.routing.link_read + '/' + this.get('public_id');
            } else if (action === 'delete') {
                route = YUI.Env.routing.link_remove + '/' + this.get('public_id');
            } else {
                route = YUI.Env.routing.link_update + '/' + this.get('id');
            }

            Y.io(route, {
                method: (action === 'read') ? 'GET' : 'POST',
                data: (action === 'read') ? null : Y.JSON.stringify(this.getPersistentAttrs()),
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

    /**
     * @returns {Object}
     */
    getPersistentAttrs: function () {
        var attrs = this.getAttrs([
            'expires'
        ]);

        attrs['token'] = YUI.Env.token;

        return attrs;
    },

    _setDate: function (value) {
        var date;

        if (!value) {
            return null;
        }

        if (Y.instanceOf(value, Date)) {
            return value;
        }

        s = value.split(/\D/);

        return new Date(Date.UTC(+s[0], --s[1], +s[2], +s[3], +s[4], +s[5], 0));
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
