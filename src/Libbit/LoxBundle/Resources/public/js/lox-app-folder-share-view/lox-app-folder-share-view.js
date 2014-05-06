YUI.add('lox-app-folder-share-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
A view to share a folder with users and groups

@module lox-app
@submodule lox-app-folder-share-view
**/
var TEXT_CANCEL             = 'Cancel',
    TEXT_SHARE              = 'Share',
    TEXT_UPDATE             = 'Update',
    TEXT_REMOVE_SHARE       = 'Remove share',
    TEXT_SHARE_TITLE        = 'Share folder with...',
    TEXT_PLACEHOLDER_INVITE = 'Invite users and groups...',
    TEXT_REMOVE             = 'Remove',

    CSS_BOOTSTRAP_BTN        = 'btn',
    CSS_BOOTSTRAP_BTN_DANGER = 'btn-danger',
    CSS_BOOTSTRAP_TOOLTIP    = 'tooltip',
    CSS_BOOTSTRAP_CLOSE      = 'close',
    CSS_BOOTSTRAP_ICON_USER  = 'icon-user',
    CSS_BOOTSTRAP_ICON_GROUP = 'icon-th-list';

/**
A view to share a folder with users and groups

@class FolderShareView
@namespace Lox.App
@constructor
@extends View
@uses Rednose.View.Nav
**/
var FolderShareView = Y.Base.create('folderShareView', Y.View, [ Y.Rednose.View.Nav ], {
    // -- Public properties ----------------------------------------------------

    template: '<div class="share-form">' +
                  '<div class="input-append">' +
                      '<input type="text" class="share-search" placeholder="{placeholder}" />' +
                      '<button class="btn share-button" type="button">...</button>' +
                  '</div>' +
                  '<div class="share-ac"></div>' +
                  '<div class="share-table"></div>' +
              '</div>',

    close: true,

    padding: true,

    buttons: {
        confirm: {
            position: 'right',
            primary : true
        },

        cancel: {
            value   : TEXT_CANCEL,
            position: 'right'
        }
    },

    /**
    UI delegation events

    @property events
    @type {Object}
    **/
    events: {
        '.rednose-datatable-data button': {
            click: '_handleRemoveIdentity'
        },

        '.share-button': {
            click: '_handleComboButton'
        }
    },

    // -- Lifecycle Methods ----------------------------------------------------

    initializer: function () {
        this._folderShareViewEvents || (this._folderShareViewEvents = []);

        var container = this.get('container'),
            model     = this.get('model'),
            self      = this;

        this._folderShareViewEvents.push(
            this.on({
                buttonConfirm: this._handleConfirm,
                buttonRemove : this._handleRemove
            })
        );

        this.title                 = TEXT_SHARE_TITLE;
        this.buttons.confirm.value = model.isNew() ? TEXT_SHARE : TEXT_UPDATE;

        if (model.isNew()) {
            delete this.buttons.remove;

            // XXX: We shouldn't have to reset this.
            model.get('identities').reset();
        } else {
            this.buttons.remove = {
                value    : TEXT_REMOVE_SHARE,
                position : 'left',
                className: CSS_BOOTSTRAP_BTN + ' ' + CSS_BOOTSTRAP_BTN_DANGER
            };
        }

        container.setContent(Y.Lang.sub(this.template, {
            placeholder: TEXT_PLACEHOLDER_INVITE
        }));

        var inputNode = container.one('input');

        function defaultFormatter (query, raw) {
            return Y.Array.map(raw, function (result) {
                return Y.Lang.sub('<span><i class="{icon}"></i> {title}</span>', {
                    title: result.raw.title,
                    icon : result.raw.type === 'group' ? CSS_BOOTSTRAP_ICON_GROUP : CSS_BOOTSTRAP_ICON_USER,
                });
            });
        }

        this.ac = new Y.AutoCompleteList({
            inputNode        : inputNode,
            resultFormatter  : defaultFormatter,
            minQueryLength   : 0,
            maxResults       : 0,
            resultFilters    : 'charMatch',
            resultHighlighter: 'charMatch',
            resultTextLocator: 'title',
            source           : YUI.Env.routing.shares_identities + '?q={query}&callback={callback}',
            render           : container.one('.share-ac')
        });

        this.ac.on('select', function (e) {
            var data = e.result.raw;

            container.one('.share-search').set('value', '');

            model.get('identities').add(data);
        });

        this.ac.after('select', function () {
            self.ac.set('value', '');
        });

        this._dataTable = new Y.Rednose.DataTable({
            columns: [
                {
                    key: 'title',
                    nodeFormatter: function (o) {
                        o.cell.set('innerHTML', Y.Lang.sub('<span><i class="{icon}"></i> {title}</span>', {
                            icon : o.data.type === 'group' ? CSS_BOOTSTRAP_ICON_GROUP : CSS_BOOTSTRAP_ICON_USER,
                            title: o.data.title
                        }));
                    }
                },
                {
                    key: 'action',
                    nodeFormatter: function (o) {
                        o.cell.addClass('last');

                        o.cell.set('innerHTML', Y.Lang.sub('<button rel="tooltip" class="{class}" title="{title}">&times;</button>', {
                            class: CSS_BOOTSTRAP_CLOSE,
                            title: TEXT_REMOVE
                        }));
                    }
                }
            ],
            sortBy: 'title',
            data: model.get('identities')
        });
    },

    destructor: function () {
        (new Y.EventHandle(this._folderShareViewEvents)).detach();

        this.ac.destroy();

        this.ac = null;
    },

    // -- Public Methods -------------------------------------------------------

    /**
    Renders this View into its container (encapsulated in a modal panel).

    @method render
    @chainable
    **/
    render: function () {
        var dataTable = this._dataTable,
            container = this.get('container');

        dataTable.render(container.one('.share-table'));

        return this;
    },

    // -- Protected Event Handlers ----------------------------------------------

    _handleComboButton: function (e) {
        e.stopPropagation();

        var ac = this.ac;

        if (ac.get('visible')) {
            ac.hide();
        } else {
            ac.sendRequest();
            ac.show();
        }
    },

    _handleConfirm: function (e) {
        var share = this.get('model');

        e.data = {
            model: share
        };
    },

    _handleRemove: function (e) {
        var share = this.get('model');

        e.data = {
            model: share
        };
    },

    _handleRemoveIdentity: function (e) {
        var items = this.get('model').get('identities'),
            item  = items.getByClientId(e.currentTarget.ancestor('tr').getAttribute('data-yui3-record'));

        // Tooltip hiding fix, to make sure it's gone after we destroy the table row.
        Y.all('.' + CSS_BOOTSTRAP_TOOLTIP).hide();

        item.destroy();
    }
}, {
    ATTRS: {
        model: {
            value: new Y.Lox.ShareModel()
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FolderShareView = FolderShareView;


}, '@VERSION@', {
    "requires": [
        "autocomplete",
        "autocomplete-filters",
        "autocomplete-highlighters",
        "rednose-datatable",
        "rednose-panel",
        "rednose-view-nav",
        "view"
    ]
});
