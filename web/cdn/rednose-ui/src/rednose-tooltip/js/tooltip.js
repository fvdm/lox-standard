/*jshint expr:true, onevar:false */

/**
Provides a tooltip manager.

@module rednose-tooltip
**/

var ATTR_STYLE_ZINDEX_TOOLTIP = '1070';

/**
Provides a tooltip manager.

@class Tooltip
@namespace Rednose
@constructor
@extends Bootstrap.Tooltip
**/
var Tooltip = Y.Base.create('tooltip', Y.Bootstrap.Tooltip, [], {
    // -- Lifecycle methods ----------------------------------------------------

    /**
    @method initializer
    @protected
    **/
    initializer: function () {
        // Correct the z-index because the superclass set's it to 0.
        this.set('zIndex', ATTR_STYLE_ZINDEX_TOOLTIP);
    },

    /**
    Patches the superclass method to get the correct target.

    @method _showFn
    @protected
    **/
    _showFn : function(e) {
        var target = e.currentTarget,
            delay  = this.get('delay'),
            title  = target.getAttribute('title');

        if (!title) {
            title = target.getAttribute('data-original-title');
        } else {
            target.removeAttribute('title');
            target.setAttribute('data-original-title', title);
        }

        this.set('title', title);
        this._hoverState  = 'in';
        this._showTimeout = Y.later( delay, this, this._show, { target: target } );
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Tooltip = Tooltip;
