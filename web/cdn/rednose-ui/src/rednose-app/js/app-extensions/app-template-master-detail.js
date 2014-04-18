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
