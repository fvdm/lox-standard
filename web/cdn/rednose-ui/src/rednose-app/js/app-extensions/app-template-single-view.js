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
