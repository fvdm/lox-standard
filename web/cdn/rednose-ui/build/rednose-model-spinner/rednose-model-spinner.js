YUI.add('rednose-model-spinner', function (Y, NAME) {

/**
Extension for View, triggers the App spinner when the model is being loaded from or
persisted to a sync-layer.

@module rednose-app
@submodule rednose-model-spinner
**/
var Spinner;

/**
Extension for View, triggers the App spinner when the model is being loaded from or
persisted to a sync-layer.

Overrides al the model sync methods through a Decorator pattern.

@class Spinner
@namespace Rednose.Model
@constructor
@extensionfor Model
**/
Spinner = Y.Base.create('undo', Y.Model, [], {
    // -- Public Methods -------------------------------------------------------

    /**
    Decorates the `destroy` method.

    @method destroy
    **/
    destroy: function (options, callback) {
        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        Y.Rednose.App.showSpinner();

        this.constructor.superclass.destroy.apply(this, [ options, function (err) {
            Y.Rednose.App.hideSpinner();

            if (typeof callback === 'function') {
                callback(err);
            }
        } ]);
    },

    /**
    Decorates the `save` method.

    @method save
    **/
    save: function (options, callback) {
        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        Y.Rednose.App.showSpinner();

        this.constructor.superclass.save.apply(this, [ options, function (err) {
            Y.Rednose.App.hideSpinner();

            if (typeof callback === 'function') {
                callback(err);
            }
        } ]);
    },

    /**
    Decorates the `load` method.

    @method load
    **/
    load: function (options, callback) {
        // Allow callback as only arg.
        if (typeof options === 'function') {
            callback = options;
            options  = {};
        }

        Y.Rednose.App.showSpinner();

        this.constructor.superclass.load.apply(this, [ options, function (err) {
            Y.Rednose.App.hideSpinner();

            if (typeof callback === 'function') {
                callback(err);
            }
        } ]);
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Model').Spinner = Spinner;


}, '1.1.0-DEV', {"requires": ["rednose-app-base", "model"]});
