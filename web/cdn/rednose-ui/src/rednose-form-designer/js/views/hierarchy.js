/*jshint boss:true, expr:true, onevar:false */

var TXT_HIERARCHY = 'Hierarchy',
    TXT_REMOVE_CONTROL = 'Remove';

var HierarchyView;

var EVT_SELECT = 'select';

HierarchyView = Y.Base.create('hierarchyView', Y.View, [], {

    template: '<div class="rednose-hierarchy></div>',

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
            model     = this.get('model');

        this._treeView && this._treeView.destroy();

        container.append('<div class="rednose-treeview"></div>');

        this._treeView = new Y.Rednose.TreeView({
            container : container.one('.rednose-treeview'),
            model     : model.getTree(),
            selectable: true,
            header    : TXT_HIERARCHY
        });

        // Open all nodes by default since this is our main navigation tool.
        Y.Array.each(self._treeView.rootNode.children, function (node) {
            node.open();
        });

        this._treeView.render();

        this._treeView.after('select', function (e) {
            var model = e.node.data;

            if (model && model instanceof Y.Rednose.Form.ControlModel) {
                self.fire(EVT_SELECT, { model: model });
            } else {
                self.fire(EVT_SELECT, { model: null });
            }
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

        if (model && model instanceof Y.Rednose.Form.ControlModel) {
            node.plug(Y.Rednose.ContextMenu, {
                content     : [
                    { title: TXT_REMOVE_CONTROL, id: 'removeControl' },
                ],
                data        : model,
                bubbleTarget: this
            });

            node.contextMenu._handleContextMenu(e);
        }
    },

    // XXX
    _setModel: function (model) {
        var controlList = model.get('controls');

        controlList.after('add', this.render, this);
    }
}, {
    ATTRS: {
        model: {
            value : new Y.Rednose.Form.FormModel(),
            setter: '_setModel'
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').HierarchyView = HierarchyView;
