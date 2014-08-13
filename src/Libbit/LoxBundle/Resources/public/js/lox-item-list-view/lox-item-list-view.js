YUI.add('lox-item-list-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

var CSS_ICON_PREFIX = 'icon-file-16-',
    CSS_FILE_TITLE  = 'file-title',

    CSS_BOOTSTRAP_URL = 'url',

    ITEM_FOLDER_SIZE     = '--',
    ITEM_FOLDER_MODIFIED = '--';

/**
List subview.
 **/
Y.Lox.ItemListView = Y.Base.create('itemListView', Y.View, [], {
    // -- Public Properties ----------------------------------------------------

    template: '<div class="libbit-lox-body">' +
        '<div class="file-table"/>' +
        '</div>',

    /**
     UI delegation events

     @property events
     @type {Object}
     **/
    events: {
        '.rednose-datatable-data tr a': {
            click: '_clickItem'
        },

        '.rednose-datatable-data tr': {
            contextmenu: '_handleRowContext'
        }
    },

    // -- Lifecycle Methods ----------------------------------------------------

    /**
     @method initializer
     @protected
     **/
    initializer: function () {
        this.get('container').setHTML(this.template);

        this._initDatatable();
    },

    /**
     @method destructor
     @protected
     **/
    destructor: function () {
        this._dataTable.destroy();

        this._dataTable = null;
    },

    // -- Public Methods -------------------------------------------------------

    /**
     Renders this DialogView into its container, encapsulated in a modal panel.

     @method render
     @chainable
     **/
    render: function () {
        var container = this.get('container'),
            dataTable = this._dataTable;

        dataTable.render(container.one('.file-table'));

        return this;
    },

    // -- Protected Methods -----------------------------------------------------

    /**
     Initializes the datatable with the correct formatting.

     @method _initDatatable
     @protected
     **/
    _initDatatable: function () {
        var items = this.get('modelList'),
            dataTable;

        dataTable = this._dataTable = new Y.Rednose.DataTable({
            columns: [
                {
                    key: 'title',
                    nodeFormatter: function (o) {
                        o.cell.addClass('span4');

                        o.cell.set('innerHTML', Y.Lang.sub(
                            '<div class="{classTitle}">' +
                                '<i class="{iconClass}"></i> ' +
                                '<a href="#" class="{classUrl}">{title}</a>' +
                                '</div>',
                            {
                                classTitle: CSS_FILE_TITLE,
                                iconClass : CSS_ICON_PREFIX + o.data.icon,
                                classUrl  : CSS_BOOTSTRAP_URL,
                                title     : o.data.title
                            }
                        ));
                    },
                    sortable: true
                },
                {
                    key: 'size',
                    nodeFormatter: function (o) {
                        o.cell.addClass('span2');

                        o.cell.set('text', o.data.isDir ? ITEM_FOLDER_SIZE : Y.Rednose.Formatter.size(o.data.size));
                    }
                },
                {
                    key: 'dateFormatted',
                    nodeFormatter: function (o) {
                        o.cell.addClass('span2');

                        o.cell.set('text', o.data.isDir === true ? ITEM_FOLDER_MODIFIED : o.data.dateFormatted);
                    }
                }
            ],
            sortBy: 'title',
            data: items
        }).plug(Y.Rednose.DataTableSelectPlugin);

        dataTable.addTarget(this);
    },

    // -- Protected Event Handlers ----------------------------------------------

    /**
     Show the detail view.

     @method _clickItem
     @param {EventFacade} e Event
     @protected
     **/
    _clickItem: function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var items = this.get('modelList'),
            item  = items.getByClientId(e.currentTarget.ancestor('tr').getAttribute('data-yui3-record'));

        if (item) {
            if (item.get('isDir') === true && item.get('hasKeys') === false) {
                this.fire('navigateItem', { path: item.get('path') });
            } else {
                this.fire('showItemDetail', { model: item });
            }
        }
    },

    /**
     Delegate handler for the table rows to bind a context menu.

     @method _handleRowContext
     @param {EventFacade} e Event
     @protected
     **/
    _handleRowContext: function (e) {
        e.preventDefault();

        var node     = e.currentTarget,
            clientId = node.getAttribute('data-yui3-record'),
            model    = this.get('modelList').getByClientId(clientId);

        if (node.dropdown || model.get('hasKeys') === true) {
            return;
        }

        if (model.get('isDir')) {
            if (model.get('isShare')) {
                items = Y.Lox.Item.Menu.share;
            } else if (model.get('isShared')) {
                items = Y.Lox.Item.Menu.shared;
            } else {
                items = Y.Lox.Item.Menu.folder;
            }
        } else {
            items = Y.Lox.Item.Menu.file;
        }

        node.plug(Y.Rednose.Plugin.Dropdown, {
            showOnContext: true,
            items        : items
        });

        node.dropdown.addTarget(this);

        node.dropdown.data = model;

        node.dropdown._positionContainer(e.pageX, e.pageY);
        node.dropdown.open();
    }
});

}, '@VERSION@', {
    "requires": [
        "rednose-datatable-select",
        "rednose-dropdown-plugin",
        "rednose-formatter",
        "view"
    ]
});
