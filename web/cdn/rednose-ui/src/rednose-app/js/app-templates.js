/**
RedNose framework app/view templates.

@module rednose-app
@submodule rednose-app-templates
**/

/**
RedNose framework app/view templates.

@class Templates
@namespace Rednose
@constructor
**/
function Templates() {
    Templates.superclass.constructor.apply(this);
}

/**
Basic detail app view.

@method detailApp
@static
@deprecated Use app extensions
**/
Templates.detailApp =
    '<div class="yui3-g rednose-app-detail-container">' +
        '<div class="yui3-u rednose-app-detail-view"></div>' +
    '</div>';

/**
Basic master-detail app view.

@method masterDetailApp
@static
@deprecated Use app extensions
**/
Templates.masterDetailApp =
    '<div class="yui3-g rednose-app-master-detail-container">' +
        '<div class="yui3-u rednose-app-master-view"></div>' +
        '<div class="yui3-u rednose-app-detail-view"></div>' +
    '</div>';

/**
Basic master-detail grid subview.

@method masterDetailGrid
@static
@deprecated Use app extensions
 */
Templates.masterDetailGrid =
    '<div class="yui3-g rednose-grid-master-detail-container">' +
        '<div class="yui3-u rednose-grid-master-view"></div>' +
        '<div class="yui3-u rednose-grid-detail-view"></div>' +
    '</div>';

/**
Basic View message container

@method detailApp
@static
@deprecated Use app extensions
**/
Templates.viewMessage =
    '<div class="rednose-app-message-container">' +
        '<div class="rednose-app-message-title">{message}</div>' +
        '<div class="rednose-app-message-body">{subMessage}</div>' +
  '</div>';

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Templates = Templates;
