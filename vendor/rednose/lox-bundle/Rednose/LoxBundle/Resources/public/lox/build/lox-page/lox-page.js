YUI.add('lox-page', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
Base page.

@module lox-page
**/
var TEXT_MENU_CHANGE_PASSWORD = 'Change password',
    TEXT_MENU_SIGN_OUT        = 'Sign out';

var SHORT_POLLING_INTERVAL = 10;

/**
Base page.

@class Page
@namespace Lox
@constructor
@extends View
**/
var Page = Y.Base.create('page', Y.View, [], {

    // -- Lifecycle methods ----------------------------------------------------

    initializer: function () {
        var dropdown = Y.one('#user-dropdown');

        this.navBar = new Y.Rednose.Navbar();

        this.navBar.createDropdown(dropdown, [
            { title: TEXT_MENU_CHANGE_PASSWORD, url: YUI.Env.routing.change_password },
            { title: '-' },
            { title: TEXT_MENU_SIGN_OUT, url: YUI.Env.routing.logout }
        ]);

        if (Y.one('.rednose-lox-sidenav')) {
            Y.one('.rednose-lox-sidenav').plug(Y.Plugin.Affix, {
                offset: {
                    top: 70
                }
            });
        }

        this._initBadge();

        this._updateNotifications();
        this._bindMarkRead();
    },

    destructor: function () {
        this.navBar.destroy();

        this.navBar = null;
    },

    // -- Public methods -------------------------------------------------------

    render: function () {
        this.navBar.render();

        return this;
    },

    // -- Protected methods ----------------------------------------------------

    _initBadge: function () {
        var request, ds;

        ds = new Y.DataSource.IO({
            source: YUI.Env.routing.notifications_unread
        });

        request = {
            callback: {
                success: function (e) {
                    var count = parseInt(e.response.results[0].responseText, 10);

                    Y.one('#badge-notifications').setContent(count > 0 ? count : null);
                }
            }
        };

        ds.setInterval(SHORT_POLLING_INTERVAL * 6000, request);
    },

    _updateNotifications: function () {
        var self = this;

        Y.io(YUI.Env.routing.notifications, {
            method: 'GET',
            on : {
                success : function (tx, r) {
                    var dropdown = Y.one('#notifications-dropdown'),
                        data     = Y.JSON.parse(r.responseText),
                        config   = [];

                    dropdown.one('.dropdown-menu').empty();

                    Y.Array.each(data, function (item) {
                        config.push({ node: Y.Node.create(item.html) });
                    });

                    self.navBar.createDropdown(dropdown, config);
                }
            }
        });
    },

    _bindMarkRead: function () {
        var dropdown = Y.one('#notifications-dropdown'),
            self     = this;

        dropdown.on('click', function () {
            Y.io(YUI.Env.routing.notifications_mark_read, {
                method: 'POST',
                on : {
                    success : function () {
                        self._updateNotifications();

                        // Reset the badge.
                        Y.one('#badge-notifications').setContent(null);
                    }
                }
            });
        });
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox').Page = Page;


}, '@VERSION@', {
    "requires": [
        "node",
        "base",
        "datasource-io",
        "datasource-polling",
        "gallery-affix",
        "io",
        "json",
        "rednose-navbar",
        "view"
    ]
});
