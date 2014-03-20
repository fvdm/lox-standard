/*jshint boss:true, expr:true, onevar:false */

function AppTemplateTwoColumn() {}

AppTemplateTwoColumn.prototype = {
    navigationBar: true,

    template: '<div class="rednose-grid rednose-two-column-grid">' +
                  '<div class="rednose-unit-container">' +
                      '<div class="rednose-unit-left"></div>' +
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

        this.set('gridLeft', container.one('.rednose-unit-left'));
        this.set('gridMain', container.one('.rednose-unit-main'));

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateTwoColumn.ATTRS = {
    gridLeft: { value: null },
    gridMain: { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').TwoColumn = AppTemplateTwoColumn;
