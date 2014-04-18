YUI.add('rednose-form-designer', function (Y, NAME) {

var ConfigureItems;

ConfigureItems = Y.Base.create('configureItems', Y.Widget, [ Y.Rednose.Dialog ], {
    template:
        '<div>' +
        '   <div class="control-group">' +
        '   </div>' +
        '</div>',

    _table: null,

    render: function () {
        var self = this,
            view = Y.Node.create(this.template),
            properties = this.get('model').get('properties'),
            data = [];

        if (properties.choices) {
            Y.Object.each(properties.choices, function (label, value) {
                data.push({ label: label, value: value });
            });
        }

        this._table = new Y.Rednose.DataTable({
            columns: [
                { key: 'label', label: 'Label', editable: true },
                { key: 'value', label: 'Value', editable: true }
            ],
            data: data,
        })

        this._table.render(view.one('.control-group'));
        view.one('.control-group').setStyle('width', '630px;');

        this.prompt({
            title: 'Configure items: ' + this.get('model').get('caption'),
            html: view
        }, function(form) {
            var items = {},
                properties = self.get('model').get('properties'),
                modellist = self._table.hasPlugin('editable').getData()

            modellist.each(function(model) {
                items[model.get('value')] = model.get('label');
            });

            properties.choices = items;

            self.get('model').set('properties', properties);

            self.destroy();
        });

        this._table.plug(Y.Rednose.DataTableEditRowPlugin);
        this._table.plug(Y.Rednose.DataTableSelectPlugin);

        this.addButtons([
            {
                value: '',
                icon: 'icon-plus',
                position: 'left',
                callback: function() {
                    self._addItem();
                }
            }, {
                value: '',
                icon: 'icon-remove',
                position: 'left',
                callback: function() {
                    self._removeItem();
                }
            }
        ]);
    },

    _addItem: function() {
        var model = this._table.get('data');

        model.add({ name: '', value: '' });
    },

    _removeItem: function() {
        var selectedRow = this._table.hasPlugin('selectable').getSelection();

        if (selectedRow) {
            selectedRow.destroy();
        }
    },

}, {
    ATTRS: {
        model: { value: null }
    }
});

Y.namespace('Rednose.FormDesigner').ConfigureItems = ConfigureItems;
/*jshint boss:true, expr:true, onevar:false */

/**
Shows a modal view where the items for this collection can be configured
dynamically, by specifying a mapping to data source attributes.
**/

var FormModel      = Y.Rednose.Form.FormModel,
    DataSourceList = Y.Rednose.DataSource.DataSourceList,

    TXT_DYNAMIC_ITEMS_TITLE = 'Dynamic Items',
    TXT_BUTTON_CANCEL       = 'Cancel',
    TXT_BUTTON_OK           = 'OK',
    TXT_OPTION_NONE         = 'None',

    /**
     * Fires when the dialog is closed and the changes should be purged.
     * @event configureDynamicItemsView:close
     * @type {CustomEvent}
     */
    EVT_CLOSE = 'close',

    /**
     * Fires when the dialog is closed and the changes should be persisted.
     * @event configureDynamicItemsView:ok
     * @type {CustomEvent}
     */
    EVT_OK = 'ok';

/**
Shows a modal view where the items for this collection can be configured
dynamically, by specifying a mapping to data source attributes.
**/
var ConfigureDynamicItemsView = Y.Base.create('configureDynamicItemsView', Y.View, [ Y.Rednose.View.Nav ], {

    /**
    Property inherited from Rednose.View.Nav
    **/
    close: true,

    /**
    Property inherited from Rednose.View.Nav
    **/
    title: TXT_DYNAMIC_ITEMS_TITLE,

    /**
    Property inherited from Rednose.View.Nav
    **/
    buttons: {
        ok: {
            value:    TXT_BUTTON_OK,
            position: 'right',
            primary:   true
        },

        close: {
            value:    TXT_BUTTON_CANCEL,
            position: 'right'
        }
    },

    /**
    View event handlers
    **/
    events: {
        '#dataSource': {
            change: '_handleDataSourceSelectChange'
        }
    },

    OPTION_TEMPLATE: '<option value="{value}">{label}</option>',

    /**
    Base Template.
    **/
    template:
        '<form class="form-horizontal">' +
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="dataSource">Data Source</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="dataSource"></select>' +
                    '</div>' +
                '</div>' +
                '<hr/>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="title">Title</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="title"></select>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="subtitle">Subtitle</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="subtitle"></select>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="image">Image</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="image"></select>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="value">Value</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="value"></select>' +
                    '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>',

    /**
    @property _dataSourceSelect
    @type Node
    @protected
    **/
    _dataSourceSelect: null,

    /**
    @property _titleSelect
    @type Node
    @protected
    **/
    _titleSelect: null,

    /**
    @property _subtitleSelect
    @type Node
    @protected
    **/
    _subtitleSelect: null,

    /**
    @property _imageSelect
    @type Node
    @protected
    **/
    _imageSelect: null,

    /**
    @property _valueSelect
    @type Node
    @protected
    **/
    _valueSelect: null,

    /**
    Stores references to data sources to retrieve them by identifier (foreign ID)

    @property _identifierMap
    @type Object
    @protected
    **/
    _identifierMap: {},

    initializer: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        this._dataSourceSelect = container.one('#dataSource');
        this._titleSelect      = container.one('#title');
        this._subtitleSelect   = container.one('#subtitle');
        this._imageSelect      = container.one('#image');
        this._valueSelect      = container.one('#value');

        this.on('configureDynamicItemsView:buttonClose', this._handleButtonClose, this);
        this.on('configureDynamicItemsView:buttonOk', this._handleButtonOk, this);
    },

    destructor: function () {
        this._dataSourceSelect = null;
        this._titleSelect      = null;
        this._subtitleSelect   = null;
        this._imageSelect      = null;
        this._valueSelect      = null;
        this._identifierMap    = null;
    },

    render: function () {
        var properties     = this.get('model').get('properties'),
            dataSourceList = this.get('dataSourceList'),
            self           = this;

        this._identifierMap = {};

        this._updateSelectNode(this._dataSourceSelect, dataSourceList.map(function (dataSource) {
            self._identifierMap[dataSource.get('identifier')] = dataSource;

            return {
                value: dataSource.get('identifier'),
                label: dataSource.get('name')
            };
        }));

        // Handle current model state.
        if (properties.datasource) {
            this._dataSourceSelect.set('value', properties.datasource.id);
        }

        this._handleDataSourceSelectChange();

        return this;
    },

    /**
    Binds the view data to the model.

    @method _bindView
    @protected
    **/
    _bindView: function () {
        // Perform all changes on a clone of the properties object, so we don't trigger model changes for every update.
        var model      = this.get('model'),
            properties = Y.clone(model.get('properties'));

        if (this._dataSourceSelect.get('value') === '0') {
            properties.datasource = undefined;
        } else {
            properties.datasource || (properties.datasource = {});

            properties.datasource.id = this._dataSourceSelect.get('value');

            var map = {};

            this._titleSelect.get('value')    !== '0' && (map.title    = this._titleSelect.get('value'));
            this._subtitleSelect.get('value') !== '0' && (map.subtitle = this._subtitleSelect.get('value'));
            this._imageSelect.get('value')    !== '0' && (map.image    = this._imageSelect.get('value'));
            this._valueSelect.get('value')    !== '0' && (map.value    = this._valueSelect.get('value'));

            Y.Object.isEmpty(map) ? properties.datasource.map = undefined : properties.datasource.map = map;
        }

        // Update the model, firing only a single change event.
        model.set('properties', properties);
    },

    /**
    @method _updateSelectNode
    @param {Node} node Select node
    @param {Array} data Option data
    @protected
    **/
    _updateSelectNode: function (node, data) {
        data || (data = []);

        var self = this;

        node.empty();

        node.append(Y.Lang.sub(this.OPTION_TEMPLATE, {
            value: 0,
            label: TXT_OPTION_NONE
        }));

        Y.Array.each(data, function (result) {
            node.append(Y.Lang.sub(self.OPTION_TEMPLATE, {
                value: result.value,
                label: result.label
            }));
        });
    },

    /**
    @method _handleDataSourceSelectChange
    @protected
    **/
    _handleDataSourceSelectChange: function () {
        var value       = this._dataSourceSelect.get('value'),
            optionData  = [];

        if (value !== '0') {
            var dataSource = this._identifierMap[value],
                attributes = dataSource.get('attributes');

            optionData = Y.Array.map(attributes, function (attribute) {
                return {
                    value: attribute.get('name'),
                    label: attribute.get('name')
                };
            });
        }

        this._updateSelectNode(this._titleSelect, optionData);
        this._updateSelectNode(this._subtitleSelect, optionData);
        this._updateSelectNode(this._imageSelect, optionData);
        this._updateSelectNode(this._valueSelect, optionData);

        // Handle current model state.
        var properties = this.get('model').get('properties'),
            map;

        if (!properties.datasource || !properties.datasource.map) {
            return;
        }

        if (value === properties.datasource.id) {
            map = properties.datasource.map;

            this._titleSelect.set('value', map.title || '0');
            this._subtitleSelect.set('value', map.subtitle || '0');
            this._imageSelect.set('value', map.image || '0');
            this._valueSelect.set('value', map.value || '0');
        }
    },

    /**
    @method _handleButtonClose
    @protected
    **/
    _handleButtonClose: function () {
        this.fire(EVT_CLOSE);
    },

    /**
    @method _handleButtonOk
    @protected
    **/
    _handleButtonOk: function () {
        var model = this.get('model');

        this._bindView();

        this.fire(EVT_OK, { model: model });
    }
}, {
    ATTRS: {
        model: {
            value: new FormModel()
        },

        dataSourceList: {
            value: new DataSourceList()
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').ConfigureDynamicItemsView = ConfigureDynamicItemsView;
/*jshint boss:true, expr:true, onevar:false */

var TXT_OBJECT_LIBRARY = 'Object Library';

var EVT_SELECT = 'select';

var ObjectLibrary,
    ObjectLibraryView;

ObjectLibrary = Y.Base.create('objectLibrary', Y.Widget, [], {

    render: function (navBar, parentId) {
        var self = this,
            items = this.get('items'),
            parentNode = navBar.getNode(parentId).get('parentNode');

        navBar.createDropdown(parentNode, items);

        for (var i in items) {
            navBar.on(items[i].id, function(e) {
                var type = e.type.split(':')[1];

                for (var y in items) {
                    if (items[y].id == type) {
                        self.fire('objectAdd', { item: items[y] });
                    }
                }
            });
        }

        return this;
    }

}, {
    ATTRS: {
        items: {
            value:
                [{
                    id    : 'text',
                    title : 'Text',
                    icon  : 'rednose-icon-text'
                }, {
                    id    : 'textarea',
                    title : 'Text Area',
                    icon  : 'rednose-icon-textarea'
                }, {
                    id    : 'richtext',
                    title : 'Rich Text',
                    icon  : 'rednose-icon-textarea'
                }, {
                    id    : 'dropdown',
                    title : 'Drop-down List',
                    icon  : 'rednose-icon-dropdown'
                }, {
                    id    : 'radio',
                    title : 'Radio Button',
                    icon  : 'rednose-icon-radio'
                }, {
                    id    : 'checkbox',
                    title : 'Checkbox',
                    icon  : 'rednose-icon-checkbox'
                }, {
                    id    : 'date',
                    title : 'Date',
                    icon  : 'rednose-icon-date'
                }, {
                    id    : 'autocomplete',
                    title : 'Autocomplete',
                    icon  : 'rednose-icon-dropdown'
                }, {
                    id    : 'file',
                    title : 'File',
                    icon  : 'rednose-icon-dropdown'
                }]
        }
    }
});

ObjectLibraryView = Y.Base.create('objectLibraryView', Y.View, [ Y.Rednose.Dialog ], {
    template:
        '<div>' +
        '   <div class="control-group">' +
        '       <label for="input" class="control-label">Caption</label>' +
        '       <div class="controls">' +
        '           <input type="text" data-path="name" value="" id="name">' +
        '       </div>' +
        '   </div>' +
        '   <div class="control-group">' +
        '       <label for="input" class="control-label">Identifier</label>' +
        '       <div class="controls">' +
        '           <input type="text" data-path="foreignId" id="foreignId" />' +
        '       </div>' +
        '   </div>' +
        '</div>',

    render: function() {
        var self      = this,
            name      = this.get('item').title,
            type      = this.get('item').id,
            view      = Y.Node.create(this.template),
            foreignId = view.one('#foreignId');

        view.one('input[data-path=name]').on(
            ['keyup', 'change'],
            function (e) {
                self._autoFillForeignId(e, foreignId);
            }
        );

        view.one('input[data-path=foreignId]').on(
            ['keyup', 'change'],
            function(e) {
                self._foreignIdChange(e);
            }
        );

        this.prompt({
            title: 'Add a new ' + name,
            html: view
        }, function(form) {
             var control = new Y.Rednose.Form.ControlModel({
                caption: form.one('[data-path=name]').get('value'),
                foreignId: form.one('[data-path=foreignId]').get('value'),
                type: type
            });

            self.get('model').get('controls').add(
                control
            );

            self.destroy();
        });
    },

    _autoFillForeignId: function(e, foreignId) {
        var value = this._cleanString(e.target.get('value'));

        if (foreignId.hasAttribute('data-noautofill') === false) {
            foreignId.set('value', value);
        }
    },

    _foreignIdChange: function(e) {
        var value = this._cleanString(e.target.get('value'));

        e.target.set('value', value);
        e.target.setAttribute('data-noautofill', 'true');

        if (value === '') {
            e.target.removeAttribute('data-noautofill');
        }
    },

    _cleanString: function(value) {
        return value
            .replace(/ /g, '_')
            .replace(/\W/g, '_');
    }
}, {
    ATTRS: {
        /* The item from the objectLibrary */
        item: { value: {} },

        /* The formModel */
        model: { value: null }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').ObjectLibrary = ObjectLibrary;
Y.namespace('Rednose.FormDesigner').ObjectLibraryView = ObjectLibraryView;
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
/*jshint boss:true, expr:true, onevar:false */

var TXT_CONTROL_TYPES = {
    'text'        : 'Text',
    'textarea'    : 'Text Area',
    'html'        : 'Rich Text',
    'dropdown'    : 'Drop-down List',
    'radio'       : 'Radio Button',
    'checkbox'    : 'Checkbox',
    'date'        : 'Date',
    'autocomplete': 'Autocomplete',
    'file'        : 'File'
};

var TXT_OBJECT_ATTRIBUTES = 'Object Attributes';

var Micro = Y.Template.Micro,
    ObjectAttributesView;

ObjectAttributesView = Y.Base.create('objectAttributesView', Y.View, [ Y.Rednose.View.Nav ], {

    /**
    Property inherited from Y.Rednose.View.Nav
    **/
    title: TXT_OBJECT_ATTRIBUTES,

    /**
    Property inherited from Y.Rednose.View.Nav
    **/
    footer: false,

    formTemplate: Micro.compile(
        '<form class="form-vertical">'+
            '<fieldset>' +
                // The form control type.
                '<div class="control-group">' +
                    '<label class="control-label" for="type">Type</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="type"></select>' +
                    '</div>' +
                '</div>' +

                // The form control identification.
                '<hr/>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="id">Identifier</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="id" type="text" readonly value="<%= data.foreignId %>"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="caption">Caption</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="caption" type="text" value="<%= data.caption %>"/>' +
                    '</div>' +
                '</div>' +

                // Attributes present on all control types.
                '<hr/>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="value">Value</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="value" type="text" value="<%= data.value %>"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<div class="controls">' +
                        '<label class="checkbox">' +
                            '<input type="checkbox" id="required" <% if (data.required) { %>checked<% } %>> Required' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<div class="controls">' +
                        '<label class="checkbox">' +
                            '<input type="checkbox" id="visible" <% if (data.visible) { %>checked<% } %>> Visible' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<div class="controls">' +
                        '<label class="checkbox">' +
                            '<input type="checkbox" id="protected" <% if (data.protected) { %>checked<% } %>> Protected' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<div class="controls">' +
                        '<label class="checkbox">' +
                            '<input type="checkbox" id="readonly" <% if (data.readonly) { %>checked<% } %>> Readonly' +
                        '</label>' +
                    '</div>' +
                '</div>' +

                // Add a spacer if this section has specific attributes.
                '<% if (data.type == \'dropdown\' || data.type == \'radio\' || data.type == \'autocomplete\') { %>' +
                    '<hr/>' +
                '<% } %>' +

                // Attributes that are specific to this control type.
                '<% if (data.type == \'dropdown\' || data.type == \'radio\' || data.type == \'autocomplete\') { %>' +
                    '<div class="control-group">' +
                        '<label class="control-label" for="configureItems">Items</label>' +
                        '<div class="controls">' +
                            '<div class="input-append">' +
                                '<input class="rednose-combo-block-level" type="text" id="items" readonly ' +
                                    'value="<%= data.properties.choices ? Y.Object.keys(data.properties.choices).length : 0 %> items"' +
                                '>' +
                                '<button class="btn dropdown-toggle" id="configureItemsList" type="button" title="Configure Items">' +
                                    '<i class="icon-cog"></i> <span class="caret"></span></button>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '<% } %>' +

                // TODO: Data binding options.
                // TODO: Form connections.
            '<fieldset>' +
        '</form>'
    ),

    emptyTemplate: '<div class="alert alert-info">No attributes available</div>',

    events: {
        'form': {
            change: '_handleFormChange'
        }
    },

    initializer: function () {
        this.on('dropdown:configureItems', this._handleConfigureItems, this);
        this.on('dropdown:configureDynamicItems', this._handleConfigureDynamicItems, this);
    },

    render: function () {
        this._renderForm();

        return this;
    },

    _renderForm: function () {
        var model     = this.get('model'),
            container = this.get('container');

        container.empty();

        if (model) {
            container.append(this.formTemplate(model.getAttrs()));

            var configureItemsListButton = container.one('#configureItemsList');

            if (configureItemsListButton) {
                configureItemsListButton.plug(Y.Rednose.Dropdown, {
                    content: [
                        { id: 'configureItems', title: 'Items', icon: 'icon-align-justify' },
                        { id: 'configureDynamicItems', title: 'Dynamic items', icon: 'icon-random' },
                    ]
                });
                configureItemsListButton.dropdown.addTarget(this);
            }

            this._renderTypeOptions();
        } else {
            container.append(this.emptyTemplate);
        }
    },

    _renderTypeOptions: function () {
        var model       = this.get('model'),
            selectNode  = this.get('container').one('#type');

        Y.Object.each(TXT_CONTROL_TYPES, function (label, type) {
            var optionNode = Y.Node.create(Y.Lang.sub('<option value="{value}">{label}</option>', {
                value: type,
                label: label
            }));

            if (model.get('type') === type) {
                optionNode.setAttribute('selected', 'selected');
            }

            selectNode.append(optionNode);
        });
    },

    _handleFormChange: function (e) {
        var node  = e.target,
            id    = node.get('id'),
            value = node.get('type') === 'checkbox' ? node.get('checked') : node.get('value');

        this.get('model').set(id, value);

        if (id === 'type') {
            this.fire('typeChange');
        }
    },

    _handleConfigureItems: function () {
        this.fire('configureItems', {
            model: this.get('model')
        });
    },

    _handleConfigureDynamicItems: function () {
        this.fire('configureDynamicItems', {
            model: this.get('model')
        });
    }
}, {
    ATTRS: {
        model: { value: null }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').ObjectAttributesView = ObjectAttributesView;
/*jshint boss:true, expr:true, onevar:false */

var FormView;

FormView = Y.Base.create('formView', Y.View, [], {

    template: '<div class="rednose-form-view">' +
                  '<form class="rednose-form form-horizontal">' +
                      '<fieldset>' +
                          '<legend>{caption}</legend>' +
                      '</fieldset>' +
                  '</form>' +
              '</div>',

    _controlViewMap: {},

    _expressionMap: [],

    _controlMap: [],

    initializer: function () {
        var formModel   = this.get('model'),
            controlList = formModel.get('controls');

        controlList.after('add', this._handleAddControl, this);
    },

    destructor: function () {
        Y.Array.each(this._controlMap, function(control) {
            control.destroy();
            control = null;
        });

        this._expressionMap = null;
    },

    render: function () {
        var self      = this,
            container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        this._controlViewMap = [];
        this._expressionMap  = [];

        container.setHTML(Y.Lang.sub(template, {
            caption: model.get('caption')
        }));

        model.get('controls').each(function (control) {
            self._renderControl(control);
        });

        // this._evalutateExpressions();

        return this;
    },

    _renderControl: function (control) {
        var container        = this.get('container'),
            controlView      = Y.Rednose.Form.ControlViewFactory.create(control),
            controlContainer = controlView.render().get('container'),
            self             = this;

        if (controlView) {
            self._controlViewMap[control.get('id')] = controlView;
            // XXX
            control.view = controlView;

            // Add bubble target.
            controlView.addTarget(self);

            // XXX: Binding.
            controlView.after('*:change', function () {
                // TODO: Propagate to this.change event.
                // self._evalutateExpressions();
            });

            // XXX: Expresions.
            // var expressions = control.get('properties').expressions;

            // if (expressions) {
            //     Y.Object.each(expressions, function (expression) {
            //         self._expressionMap.push(expression);
            //     });
            // }


            var dd = new Y.DD.Drag({
                node: controlContainer,
                group: ['rednose-form-designer-form']
            }).plug(Y.Plugin.DDProxy, {
                moveOnEnd: false
            });

            dd.on('drag:start', function(e) {
                e.target.get('dragNode').setHTML('');
            });
            dd.on('drag:drag', function(e) {
                self._dragging(e, container.one('fieldset'), controlContainer);
            });
            dd.on('drag:end', function() {
                self._setSortOrder(container.one('fieldset'));
            });

            controlContainer.setData('model', control);

            container.one('fieldset').append(controlContainer);

            this._controlMap.push(controlView);
        }
    },

    _dragging: function(e, container, sender) {
        var y = e.currentTarget.mouseXY[1];
        var hit = false;

        container.all('> div').each(function(control) {
            if (sender.get('id') !== control.get('id')) {
                var top = control.getY();
                var bottom = (top + parseInt(control.getComputedStyle('height'), 10));

                if (y > top && y < bottom) {
                    sender.insertBefore(sender, control);

                    hit = true;
                }
            }
        });

        if (hit === false && y > (container.getY() + parseInt(container.getComputedStyle('height'), 10))) {
            container.append(sender);
        }
    },

    _setSortOrder: function(container) {
        var counter = 0,
            controls = [];

        container.all('> div').each(function(node) {
            var control = node.getData('model');

            control.set('sortOrder', counter);
            controls.push(control);

            counter++;
        });

        this.get('model').set('controls', controls);
    },

    _evalutateExpressions: function () {
        var self = this;

        var objectDefinitions = [];

        Y.Object.each(this._controlViewMap, function (view) {
            var id    = view.get('model').get('foreignId'),
                attrs = Y.JSON.stringify(view.get('model').toJSON());

            objectDefinitions.push(id + ' = ' + attrs);
        });

        var lines = [];

        lines.push('var ' + objectDefinitions.join(', ') + ';');
        lines.push(this._expressionMap.join(' '));

        var objectMappings = [];

        Y.Object.each(this._controlViewMap, function (view) {
            var id    = view.get('model').get('id');

            objectMappings.push('"' + id + '": ' + id);
        });

        lines.push('var objects = {' + objectMappings.join(', ') + '};');

        var objects;

        eval(lines.join(' '));

        Y.Object.each(objects, function (attrs, id) {
            var model = self._controlViewMap[id].get('model');

            model.setAttrs(attrs);

            // TODO: Only render changed views
            self._controlViewMap[id].render();
        });
    },

    _handleAddControl: function (e) {
        this._renderControl(e.model);
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.FormModel() }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').FormView = FormView;
/*jshint boss:true, expr:true, onevar:false */

var TXT_NAVBAR_CAPTION = 'Form Designer';

var ConfigureDynamicItemsView = Y.Rednose.FormDesigner.ConfigureDynamicItemsView,
    DataSourceManager         = Y.Rednose.DataSourceManager.DataSourceManager,
    Panel                     = Y.Rednose.Panel,
    FormDesigner;

FormDesigner = Y.Base.create('formDesigner', Y.App, [ Y.Rednose.Template.ThreeColumn ], {
    views: {
        form: {
            type: Y.Rednose.FormDesigner.FormView
        }
    },

    _navbar: null,

    _objectLibrary       : null,
    _hierarchyView       : null,
    _objectAttributesView: null,
    _dataSourcesView     : null,

    initializer: function () {
        this._objectLibrary        = new Y.Rednose.FormDesigner.ObjectLibrary();
        this._hierarchyView        = new Y.Rednose.FormDesigner.HierarchyView();
        this._objectAttributesView = new Y.Rednose.FormDesigner.ObjectAttributesView();
        this._dataSourcesView      = new Y.Rednose.FormDesigner.DataSourcesView();

        this._objectLibrary.addTarget(this);
        this._hierarchyView.addTarget(this);
        this._objectAttributesView.addTarget(this);
        this._dataSourcesView.addTarget(this);

        this.after('hierarchyView:select', this._handleControlSelect, this);

        this.after('objectLibrary:objectAdd', this._handleObjectAdd, this);

        this.after('objectAttributesView:typeChange', this._handleObjectTypeChange, this);
        this.after('objectAttributesView:configureItems', this._handleConfigureItems, this);
        this.after('objectAttributesView:configureDynamicItems', this._handleConfigureDynamicItems, this);

        this._initNavbar();

        this.on('navbar:preview', this._handlePreview, this);
        this.on('navbar:save', this._handleSave, this);
        this.on('navbar:newDataSource', this._handleNewDataSource, this);
        this.on('navbar:closeDesigner', this._handleClose, this);

        this.on('contextMenu:removeControl', this._handleRemoveControl, this);
        this.on('contextMenu:dataSourceEdit', this._handleDataSourceEdit, this);
        this.on('contextMenu:dataSourceDelete', this._handleDataSourceDelete, this);

        if (this.hasRoute(this.getPath())) {
            this.dispatch();
        }
    },

    destructor: function () {
        if (this.get('activeView')) {
            this.get('activeView').destroy();
        }

        this._navbar.destroy();
        this._navbar = null;

        this._objectLibrary.destroy();
        this._objectLibrary = null;

        this._hierarchyView.destroy();
        this._hierarchyView = null;

        this._dataSourcesView.destroy();
        this._dataSourcesView = null;

        this._objectAttributesView.destroy();
        this._objectAttributesView = null;
    },

    render: function () {
        // We always need to call the parent's class `render` function first for the `App` object to function.
        FormDesigner.superclass.render.apply(this, arguments);

        this.get('container').addClass('rednose-form-designer');

        this._navbar.render(this.get('container'));

        this._objectLibrary.render(this._navbar, 'insert');

        this.get('gridLeft').append(this._hierarchyView.render().get('container'));
        this.get('gridLeft').append(this._dataSourcesView.render().get('container'));
        this.get('gridRight').append(this._objectAttributesView.render().get('container'));

        // If the model contains controls render the form view
        if (this.get('model').get('controls').size() > 0) {
            this.showForm();
        }

        return this;
    },

    _initNavbar: function () {
        this._navbar = new Y.Rednose.Navbar({
            title        : TXT_NAVBAR_CAPTION,
            columnLayout : true,
            menu         : [
                { title: 'File', items: [
                    { id: 'newDataSource', title: 'New Data Source...' },
                    { title: '-' },
                    { id: 'preview', title: 'Preview' },
                    { id: 'save', title: 'Save' },
                    { title: '-' },
                    { id: 'closeDesigner', title: 'Close' }
                ]}, {
                    id: 'insert', title: 'Insert'
                }
            ],
            menuSecondary: [
                { title: YUI.Env.user.name, icon: 'icon-user', items: [
                    {
                        url  : Routing.generate('_security_logout'),
                        title: 'Sign out'
                    }
                ]}
            ]
        });

        this._navbar.addTarget(this);
        this.set('navbar', this._navbar);
    },

    handleForm: function (req, res, next) {
        var id   = req.params.form,
            form = this.get('model'),
            self = this;

        if (id === form.get('id') && !form.isNew()) {
            req.form = form;
            next();
        } else {
            form = new Y.Rednose.Form.FormModel({id: id});

            form.load(function () {
                self.set('model', form);
                req.form = form;
                next();
            });
        }
    },

    showForm: function (req, res) {
        if (this.get('activeView')) {
            this.get('activeView').destroy();
        }

        if (!req) {
            req = { form: this.get('model') };
            res = { transition: false };
        }

        this.showView('form', {
            model: req.form
        }, {
            // Overrides the default transition with the preferred one, if set.
            transition: res.transition
        });

        this._hierarchyView.set('model', req.form);
        this._hierarchyView.render();
    },

    _handleControlSelect: function (e) {
        var model  = e.model;

        if (model && model instanceof Y.Rednose.Form.ControlModel) {
            if (model.view instanceof Y.Rednose.Form.BaseControlView) {
                model.view.focus();
            }
        }

        this._objectAttributesView.set('model', model);
        this._objectAttributesView.render();
    },

    _handleRemoveControl: function(e) {
        var self = this,
            model = e.data,
            dialog = new Y.Rednose.Dialog();

        dialog.confirm({
            title: 'Remove control: ' + model.get('caption') + '?',
            text: 'Are you sure you want to remove the control' + model.get('caption') + ' connected data may possibly be lost!',
            type: 'warning',
            confirm: 'DELETE'
        }, function() {
            self.get('model').get('controls').remove(model);

            self.showForm();
            self._handleControlSelect({
                model: self._objectAttributesView.get('model')
            });
        });
    },

    _handleObjectTypeChange: function() {
        this.showForm();
        this._handleControlSelect({
            model: this._objectAttributesView.get('model')
        });
    },

    _handleConfigureItems: function (e) {
        var dialog = new Y.Rednose.FormDesigner.ConfigureItems({
            model: e.model
        });

        dialog.render();
    },

    /**
    Shows a modal view where the items for this collection can be configured
    dynamically, by specifying a mapping to data source attributes.

    @method _handleConfigureDynamicItems
    @param {EventFacade} e Event containing the control model.
    @protected
    **/
    _handleConfigureDynamicItems: function (e) {
        var model = e.model;

        if (!model) {
            return;
        }

        var dataSourceList = this._dataSourcesView.get('modelList'),
            view,
            panel;

        view = new ConfigureDynamicItemsView({
            model         : model,
            dataSourceList: dataSourceList
        }).render();

        panel = new Panel({
            srcNode: view.get('container'),
            width  : 500
        }).render();

        view.on(['close', 'ok'], function () {
            view.destroy();
            panel.destroy();
        });
    },

    _handleObjectAdd: function (e) {
        var self = this;
        var dialog = new Y.Rednose.FormDesigner.ObjectLibraryView({
            model: this.get('model'),
            item: e.item
        });

        dialog.on('destroy', function() {
            self.showForm();
        });

        dialog.render();
    },

    /**
    Saves the current form.

    @method _handleSave
    @protected
    **/
    _handleSave: function () {
        var form = this.get('model');

        console.log(Y.JSON.stringify(form.toJSON()));
    },

    /**
    Shows a preview of the current (saved) form.

    @method _handlePreview
    @protected
    **/
    _handlePreview: function () {
        var form = this.get('model');

        window.open(Routing.generate('rednose_framework_forms_preview', { id: form.get('id') }), '_blank');
    },

    // XXX
    _handleNewDataSource: function () {
        var dataSourceManagerView = new DataSourceManager(),
            self                  = this;

        dataSourceManagerView.render();
        dataSourceManagerView.showChoicePage();

        var dataSourceManagerPanel = new Y.Rednose.Panel({
            srcNode: dataSourceManagerView.get('container'),
            width  : 640
        });

        dataSourceManagerPanel.render();

        dataSourceManagerView.on('close', function () {
            dataSourceManagerView.destroy();
            dataSourceManagerPanel.destroy();
        });

        dataSourceManagerView.on('create', function (e) {
            var model = e.model;

            model.save(function () {
                dataSourceManagerView.destroy();
                dataSourceManagerPanel.destroy();

                self._dataSourcesView.render();
            });
        });
    },

    // XXX
    _handleDataSourceEdit: function (e) {
        var model = e.data;

        var dataSourceManagerView = new DataSourceManager({ model: model }),
            self                  = this;

        dataSourceManagerView.render();
        dataSourceManagerView.showChoicePage();

        var dataSourceManagerPanel = new Y.Rednose.Panel({
            srcNode: dataSourceManagerView.get('container'),
            width  : 640
        });

        dataSourceManagerPanel.render();

        dataSourceManagerView.on('close', function () {
            dataSourceManagerView.destroy();
            dataSourceManagerPanel.destroy();
        });

        dataSourceManagerView.on('create', function (e) {
            var model = e.model;

            model.save(function () {
                dataSourceManagerView.destroy();
                dataSourceManagerPanel.destroy();

                self._dataSourcesView.render();
            });
        });
    },

    _handleClose: function() {
        this.destroy();
    },

    // XXX
    _handleDataSourceDelete: function (e) {
        console.log(e);
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.FormModel() },

        navbar: { value: null },

        routes: {
            value: [{
                path: '/:form/edit', callbacks: [
                    'handleForm',
                    'showForm'
                ]}
            ]
        }
    }
});



// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').FormDesigner = FormDesigner;


}, '1.4.0', {
    "requires": [
        "rednose-app",
        "rednose-datatable-select",
        "rednose-datasource-manager",
        "rednose-dialog",
        "rednose-dropdown",
        "rednose-form",
        "rednose-form-designer-css",
        "rednose-navbar",
        "rednose-nodescroll",
        "rednose-treeview"
    ]
});
