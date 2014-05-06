YUI.add('rednose-datepicker-plugin', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
 * Provides the `Y.Rednose.Plugin.Datepicker` Node plugin.
 *
 * @module rednose-datetimepicker
 */

Y.namespace('Rednose.Plugin').Datepicker = Y.Base.create('datepicker', Y.Base, [Y.Plugin.Base], {

    // -- Life Cycle Methods ---------------------------------------------------

    initializer: function (config) {
        this._host = config.host;

        var lang = Y.config.lang || null;

        $(this._host.getDOMNode()).datetimepicker({
            pickTime: false,
            language: lang
        });
    }
}, {
    NS: 'datepicker'
});


}, '1.4.0', {"requires": ["rednose-datetimepicker-base"]});
