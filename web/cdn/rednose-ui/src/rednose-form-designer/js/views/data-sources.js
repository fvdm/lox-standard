/*jshint boss:true, expr:true, onevar:false */

var TXT_DATA_SOURCES       = 'Data Sources',
    TXT_DATA_SOURCE_EDIT   = 'Edit Data Source',
    TXT_DATA_SOURCE_DELETE = 'Delete Data Source';

var DataSource = Y.Rednose.DataSource.DataSource,
    DataSourcesView;

DataSourcesView = Y.Base.create('dataSourcesView', Y.View, [], {

    template: '<div class="rednose-data-sources></div>',

    events: {
        '.yui3-treeview-row': {
            contextmenu: '_handleContextMenu'
        }
    },

    _treeView: null,

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);
    },

    destructor: function () {
        this._treeView.destroy();

        this._treeView = null;
    },

    render: function () {
        var self      = this,
            container = this.get('container'),
            list      = this.get('modelList');

        this._treeView && this._treeView.destroy();

        container.append('<div class="rednose-treeview"></div>');

        list.load(function () {
            self._treeView = new Y.Rednose.TreeView({
                container : container.one('.rednose-treeview'),
                model     : list.getTree(),
                selectable: false,
                header    : TXT_DATA_SOURCES
            });

            self._treeView.render();
        });

        return this;
    },

    _handleContextMenu: function (e) {
        var node = e.currentTarget;

        // Prevent default contextmenu behaviour.
        e.preventDefault();

        if (node.contextMenu) {
            return false;
        }

        var model = this._treeView.getNodeById(node.getData('node-id')).data;

        if (model instanceof DataSource) {
            node.plug(Y.Rednose.ContextMenu, {
                content     : [
                    { title: TXT_DATA_SOURCE_EDIT, id: 'dataSourceEdit' },
                    { title: '-' },
                    { title: TXT_DATA_SOURCE_DELETE, id: 'dataSourceDelete' }
                ],
                data        : model,
                bubbleTarget: this
            });

            node.contextMenu._handleContextMenu(e);
        }
    }
}, {
    ATTRS: {
        modelList: { value: new Y.Rednose.DataSource.DataSourceList() }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').DataSourcesView = DataSourcesView;
