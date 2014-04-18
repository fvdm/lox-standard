/*jshint expr:true, onevar:false */

/**
Provides a generic panel.

By default this class provides a modal, centered panel.

@module renodse-panel
**/
var Panel,

    STYLE_DIALOG_WIDTH = 500,
    STYLE_POSITION_TOP = 100,

    // Taken from Bootstrap's @zindexModal
    STYLE_BOOTSTRAP_ZINDEX = 1050,

    CSS_BUTTON_CLOSE = 'yui3-button-close',
    CSS_WIDGET_HD    = 'yui3-widget-hd';

/**
Provides a generic panel.

@class Panel
@namespace Rednose
@constructor
@extends Panel
**/
Panel = Y.Base.create('panel', Y.Panel, [], {
    // -- Lifecycle Methods ----------------------------------------------------

    initializer: function (config) {
        config || (config = {});

        this.set('zIndex'  , STYLE_BOOTSTRAP_ZINDEX);
        this.set('centered', true);
        this.set('modal'   , true);
        this.set('hideOn'  , []);
        this.set('width'   , config.width || STYLE_DIALOG_WIDTH);

        this.after('render', this._afterRender, this);
    },

    // -- Protected Event Handlers ----------------------------------------------

    /**
    Sets the correct panel position and patches the default close button.

    @method _afterRender
    @protected
    **/
    _afterRender: function () {
        var container   = this.get('boundingBox'),
            closeButton = container.one('.' + CSS_BUTTON_CLOSE);

        if (closeButton) {
            // Remove the first header (close button).
            closeButton.ancestor('.' + CSS_WIDGET_HD).remove();
        }

        container.setStyle('top', STYLE_POSITION_TOP);
        container.setStyle('position', 'fixed');

        if (this.get('top') > 0) {
            container.setStyle('top', this.get('top'));
        }
    }
}, {
    ATTRS: {
        top: { value: 0 }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Panel = Panel;
