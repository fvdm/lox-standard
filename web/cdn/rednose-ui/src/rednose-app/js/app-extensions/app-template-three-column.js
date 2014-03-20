/*jshint boss:true, expr:true, onevar:false */

function AppTemplateThreeColumn() {}

AppTemplateThreeColumn.prototype = {
    navigationBar: true,

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

        if (this.navigationBar) {
            container.addClass('rednose-navbar-grid');
            container.prepend('<div class="rednose-navbar"></div>');

            this.set('navBar', container.one('.rednose-navbar'));
        }

        this.set('gridLeft' , container.one('.rednose-unit-left'));
        this.set('gridMain' , container.one('.rednose-unit-main'));
        this.set('gridRight', container.one('.rednose-unit-right'));

        this.set('viewContainer', this.get('gridMain'));
    }
};

AppTemplateThreeColumn.ATTRS = {
    gridLeft : { value: null },
    gridMain : { value: null },
    gridRight: { value: null }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Template').ThreeColumn = AppTemplateThreeColumn;
