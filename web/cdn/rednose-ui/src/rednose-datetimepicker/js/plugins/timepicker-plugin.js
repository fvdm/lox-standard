/*jshint boss:true, expr:true, onevar:false */

/**
 * Provides the `Y.Rednose.Plugin.Timepicker` Node plugin.
 *
 * @module rednose-datetimepicker
 */

Y.namespace('Rednose.Plugin').Timepicker = Y.Base.create('timepicker', Y.Base, [Y.Plugin.Base], {

    // -- Life Cycle Methods ---------------------------------------------------

    initializer: function (config) {
        this._host = config.host;

        var lang = Y.config.lang || null;

        $(this._host.getDOMNode()).datetimepicker({
            pickDate: false,
            language: lang
        });
    }
}, {
    NS: 'timepicker'
});
