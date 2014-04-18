YUI.add('rednose-app-templates', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

function AppTemplateMasterDetail() {}

AppTemplateMasterDetail.prototype = {
    showNavbar: true,

    showToolbar: false,

    template: '<div class="rednose-grid rednose-master-detail-grid">' +
                  '<div class="rednose-unit-container">' +
                      '<div class="rednose-unit-main"></div>' +
                      '<div class="rednose-unit-right"></div>' +
                  '</div>' +
              '</div>',

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        this.set('gridRight', container.one('.rednose-unit-right'));

        if (this.showNavbar) {
            container.addClass('rednose-navbar-grid');
            container.prepend('<div class="rednose-navbar"></div>');

            this.set('navBar', container.one('.rednose-navbar'));
        }

        if (this.showToolbar) {
            container.one('.rednose-unit-main').append(
                '<div class="rednose-toolbar"></div>' +
                '<div class="rednose-viewport"></div>'
            );

            this.set('toolbar', container.one('.rednose-toolbar'));
            this.set('gridMain', container.one('.rednose-viewport'));
        } else {
            this.set('gridMain', container.one('.rednose-unit-main'));
        }

        this.get('gridMain').setStyle('overflow', 'auto');
        this.get('gridMain').setStyle('height', '100%');

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateMasterDetail.ATTRS = {
    toolbar  : { value: null },
    navBar   : { value: null },
    gridMain : { value: null },
    gridRight: { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').MasterDetail = AppTemplateMasterDetail;
/*jshint boss:true, expr:true, onevar:false */

function AppTemplateSingleView() {}

AppTemplateSingleView.prototype = {
    navigationBar: true,

    showToolbar: false,

    template: '<div class="rednose-grid">' +
                  '<div class="rednose-unit-container">' +
                      '<div class="rednose-unit-main"></div>' +
                  '</div>' +
              '</div>',

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        if (this.navigationBar) {
            container.addClass('rednose-navbar-grid');
            container.prepend('<div class="rednose-navbar"></div>');

            this.set('navBar', container.one('.rednose-navbar'));
        }

        if (this.showToolbar) {
            container.one('.rednose-unit-main').append(
                '<div class="rednose-toolbar"></div>' +
                    '<div class="rednose-viewport"></div>'
            );

            this.set('toolbar', container.one('.rednose-toolbar'));
            this.set('gridMain', container.one('.rednose-viewport'));
        } else {
            this.set('gridMain', container.one('.rednose-unit-main'));
        }

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateSingleView.ATTRS = {
    gridMain : { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').SingleView = AppTemplateSingleView;
/*jshint boss:true, expr:true, onevar:false */

function AppTemplateThreeColumn() {}

AppTemplateThreeColumn.prototype = {
    showNavbar: true,

    showToolbar: false,

    template: '<div class="rednose-grid rednose-three-column-grid">' +
                  '<div class="rednose-unit-container">' +
                      '<div class="rednose-unit-left"></div>' +
                      '<div class="rednose-unit-main"></div>' +
                      '<div class="rednose-unit-right"></div>' +
                  '</div>' +
              '</div>',

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        if (this.showNavbar) {
            container.addClass('rednose-navbar-grid');
            container.prepend('<div class="rednose-navbar"></div>');

            this.set('navBar', container.one('.rednose-navbar'));
        }

        if (this.showToolbar) {
            container.one('.rednose-unit-main').append(
                '<div class="rednose-toolbar"></div>' +
                '<div class="rednose-viewport"></div>'
            );

            this.set('toolbar', container.one('.rednose-toolbar'));
            this.set('gridMain', container.one('.rednose-viewport'));
        } else {
            this.set('gridMain', container.one('.rednose-unit-main'));
        }

        this.set('gridLeft' , container.one('.rednose-unit-left'));
        this.set('gridRight', container.one('.rednose-unit-right'));

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateThreeColumn.ATTRS = {
    toolbar : { value: null },
    navBar  : { value: null },

    gridLeft : { value: null },
    gridMain : { value: null },
    gridRight: { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').ThreeColumn = AppTemplateThreeColumn;
/*jshint boss:true, expr:true, onevar:false */

function AppTemplateTwoColumn() {}

AppTemplateTwoColumn.prototype = {

    showNavbar: true,

    showToolbar: false,

    splitView: false,

    template:
        '<div class="rednose-grid rednose-two-column-grid">' +
            '<div class="rednose-unit-container">' +
                '<div class="rednose-unit-left"></div>' +
                '<div class="rednose-unit-main"></div>' +
            '</div>' +
        '</div>',

    splitTemplate:
        '<div>' +
            '<div class="rednose-unit-main-top"></div>' +
            '<div class="rednose-unit-main-bottom"></div>' +
        '</div>',

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        this.set('gridLeft', container.one('.rednose-unit-left'));

        if (this.showNavbar) {
            container.addClass('rednose-navbar-grid');
            container.prepend('<div class="rednose-navbar"></div>');

            this.set('navBar', container.one('.rednose-navbar'));
        }

        if (this.showToolbar) {
            container.one('.rednose-unit-main').append(
                '<div class="rednose-toolbar"></div>' +
                '<div class="rednose-viewport"></div>'
            );

            this.set('toolbar', container.one('.rednose-toolbar'));
            this.set('gridMain', container.one('.rednose-viewport'));
        } else {
            this.set('gridMain', container.one('.rednose-unit-main'));
        }

        this.get('gridMain').setStyle('overflow', 'auto');
        this.get('gridMain').setStyle('height', '100%');

        if (this.splitView) {
            this.get('gridMain').append(this.splitTemplate);

            this.set('gridMainTop', container.one('.rednose-unit-main-top'));
            this.set('gridMainBottom', container.one('.rednose-unit-main-bottom'));
        }

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateTwoColumn.ATTRS = {
    toolbar : { value: null },
    navBar  : { value: null },

    gridLeft: { value: null },
    gridMain: { value: null },

    gridMainTop: { value: null },
    gridMainBottom: { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').TwoColumn = AppTemplateTwoColumn;
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


}, '1.4.0');
