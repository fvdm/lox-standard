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
    }
}, {
	ATTRS: {

	}
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox').LinkModel = LinkModel;


}, '@VERSION@', {"requires": ["model", "rednose-model-spinner"]});
