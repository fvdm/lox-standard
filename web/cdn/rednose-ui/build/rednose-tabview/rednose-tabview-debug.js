YUI.add('rednose-tabview', function (Y, NAME) {


/**
Provides a generic tabview.

@module rednose-tabview
**/
var TabView;

/**
Provides a generic tabview.

@class TabView
@namespace Rednose
@constructor
@extends TabView
**/
TabView = Y.Base.create('tabView', Y.Widget, [], {
    // -- Public Properties ----------------------------------------------------

    template:
        '<div class="tabbable">' +
            '<ul class="nav nav-tabs">' +
            '</ul>' +
        '</div>' +
        '<div class="tab-content">' +
        '</div>',

    itemTemplate: '<li><a></a></li>',

    paneTemplate: '<div class="tab-pane"></div>',

    initializer: function () {
        this.after('errorChange', this._setError, this);
    },

    // -- Lifecycle Methods ----------------------------------------------------

    renderUI: function (container) {
        var self          = this,
            tabs          = this.get('tabs'),
            container     = this.get('contentBox');

        container.append(this.template);

        var paneContainer = container.one('.tab-content');

        Y.each(tabs, function(tab) {
            var li   = Y.Node.create(self.itemTemplate),
                a    = li.one('a'),
                pane = Y.Node.create(self.paneTemplate);

            a.on('click', self._handleTabClick, self);
            a.setAttribute('id', tab.id);
            a.setHTML(tab.title);

            pane.append(tab.container);
            pane.setAttribute('id', tab.id);
            paneContainer.append(pane);

            if (tab.active) {
                pane.addClass('active');
                li.addClass('active');
            }

            container.one('ul').append(li);
        });
    },

    // -- Protected Methods ----------------------------------------------------

    _handleTabClick: function (e) {
        var a         = e.currentTarget,
            id        = a.getAttribute('id'),
            container = this.get('contentBox');

        container.all('.active').removeClass('active');

        a.get('parentNode').addClass('active');
        container.one('div#' + id).addClass('active');

        this.fire('click', { tabNode: a.get('parentNode') });
    },

    /**
     * Fired when the `error` property changes.
     *
     * @private
     */
    _setError: function (e) {
        var errors = e.newVal,
            container = this.get('contentBox');

        container.all('.text-error').removeClass('text-error');

        Y.each(errors, function(error) {
            container.one('a#' + error).addClass('text-error');
        });
    }
}, {
    ATTRS: {
        tabs: { value: {} },
        error: { value: [] }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').TabView = TabView;


}, '1.4.0', {"requires": ["node"]});
