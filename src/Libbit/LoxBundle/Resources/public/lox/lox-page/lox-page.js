YUI.add('lox-page', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
 * Base page.
 *
 * @module lox-page
*/
var TEXT_MENU_CHANGE_PASSWORD = 'Change password',
    TEXT_MENU_SIGN_OUT        = 'Sign out';

/**
 * Renders and controls the basic page elements like menu items and dropdowns.
 *
 * @class Page
 * @namespace Lox
 * @constructor
 * @extends View
 */
var Page = Y.Base.create('page', Y.View, [], {

    /**
     * Debug flag.
     *
     * @property {Boolean} debug
     * @default false
     */
    debug: false,

    // -- Lifecycle methods ----------------------------------------------------

    initializer: function () {
        if (Y.one('.libbit-lox-sidenav')) {
            Y.one('.libbit-lox-sidenav').plug(Y.Plugin.Affix, {
                offset: {
                    top: 70
                }
            });
        }

        this._userDropdown       = Y.one('#user-dropdown');
        this._notifyDropdown     = Y.one('#notifications-dropdown');
        this._badgeNotifications = Y.one('#badge-notifications');
        this._registerAppMenu    = Y.one('[data-id=registerApp]').get('parentNode');

        this._initDropdowns();
    },

    destructor: function () {
        this._userDropdown.dropdown.destroy();
        this._notifyDropdown.dropdown.destroy();

        this._userDropdown       = null;
        this._notifyDropdown     = null;
        this._badgeNotifications = null;
        this._registerAppMenu    = null;
    },

    // -- Public methods -------------------------------------------------------

    render: function () {
        this._isMobile() && this._registerAppMenu.show();

        this._updateNotifications();
        this._updateBadge();

        return this;
    },

    // -- Protected methods ----------------------------------------------------

    /**
     * Initializes the dropdown menus within the navigation bar.
     *
     * @private
     */
    _initDropdowns: function () {
        this._userDropdown.plug(Y.Rednose.Plugin.Dropdown, {
            showCaret: false,

            items: [
                { title: TEXT_MENU_CHANGE_PASSWORD, url: YUI.Env.routing.change_password },
                { type: 'divider' },
                { title: TEXT_MENU_SIGN_OUT, url: YUI.Env.routing.logout }
            ]
        });

        this._notifyDropdown.plug(Y.Rednose.Plugin.Dropdown, {
            showCaret: false
        });

        this._notifyDropdown.dropdown.after('open', this._afterNotifyOpen, this);
    },

    /**
     * Updates the notification dropdown.
     *
     * @private
     */
    _updateNotifications: function () {
        var notifyDropdown = this._notifyDropdown;

        Y.io(YUI.Env.routing.notifications, {
            method: 'GET',
            on : {
                success : function (tx, r) {
                    notifyDropdown.dropdown.reset(Y.JSON.parse(r.responseText));
                }
            }
        });
    },

    /**
     * Updates the badge count for unread notifications.
     *
     * @private
     */
    _updateBadge: function () {
        var badgeNotifications = this._badgeNotifications,
            debug              = this.debug;

        Y.io(YUI.Env.routing.notifications_unread, {
            method: 'GET',
            on : {
                success : function (tx, r) {
                    var count = parseInt(r.responseText, 10);

                    badgeNotifications.setContent(count === 0 && !debug ? null : count);
                }
            }
        });
    },

    /**
     * Renders whether this page is visited on an Android or iOS device.
     *
     * @return {Boolean}
     * @private
     */
    _isMobile: function () {
        var IsMobile = {
            android: function() {
                return /Android/i.test(navigator.userAgent);
            },
            iOS: function() {
                return /iPhone|iPad|iPod/i.test(navigator.userAgent);
            }
        };

        return IsMobile.android() === true || IsMobile.iOS() === true;
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
     * Marks all notifications as `read`, and updates the notifications dropdown.
     *
     * @param {EventFacade} e
     * @private
     */
    _afterNotifyOpen: function (e) {
        var badgeNotifications = this._badgeNotifications,
            debug              = this.debug;

        Y.io(YUI.Env.routing.notifications_mark_read, {
            method: 'POST',
            on : {
                success : function () {
                    // Reset the badge.
                    badgeNotifications.setContent(debug ? 0 : null);
                }
            }
        });

        this._updateNotifications();
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
        "rednose-dropdown",
        "view"
    ],
    "lang": [
        "en",
        "nl"
    ]
});
