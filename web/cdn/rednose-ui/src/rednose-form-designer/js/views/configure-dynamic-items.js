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
