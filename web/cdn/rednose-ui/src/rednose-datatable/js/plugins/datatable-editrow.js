/*jshint boss:true, expr:true, onevar:false */

/**
 * Create a selection inline value edit plugin for the RedNose DataTable widget.
 */
var CSS_COLUMN = 'rednose-datatable-col-',
    CSS_INPUTFIELD = 'rednose-datatable-input';

function DataTableEditRowPlugin () {
    DataTableSelectPlugin.superclass.constructor.apply(this, arguments);
}

/**
 * The identity of the plugin.
 */
DataTableEditRowPlugin.NAME = 'dataTableEditRowPlugin';

/**
 * The namespace for the plugin.
0 */
DataTableEditRowPlugin.NS = 'editable';

Y.extend(DataTableEditRowPlugin, Y.Plugin.Base, {

    _activeInputNode: null,

    initializer: function() {
        var self  = this,
            table = this.get('host'),
            model = table.get('data');

        this._renderFields();

        model.before(['add', 'remove'], function() {
            self._updateModel();
        });

        model.after(['add', 'remove'], function() {
            self._renderFields();
        });
    },

    getData: function() {
        this._updateModel();

        return this.get('host').get('data');
    },

    _renderFields: function(activeNode) {
        var self      = this,
            table     = this.get('host'),
            container = table.get('boundingBox'),
            columns   = table.get('columns');

        Y.Array.each(columns, function(column) {
            var className = CSS_COLUMN + column.key;

            if (column.editable) {
                container.all('td.' + className).each(function(columnNode) {
                    var rowModel = table.getRecord(
                        columnNode.ancestor('tr').getAttribute('data-yui3-record')
                    );

                    self._addField(columnNode, rowModel, column.key);
                });
            }
        });
    },

    _addField: function(node, row, property) {
        var self      = this,
            nodeValue = node.get('text'),
            inputNode = Y.Node.create('<input />');

        inputNode.set('value', nodeValue);
        inputNode.addClass(CSS_INPUTFIELD);
        inputNode.setAttribute('name', property);
        inputNode.setData('model', row);

        node.setHTML('');
        node.append(inputNode);
    },

    _updateModel: function() {
        var table     = this.get('host'),
            container = table.get('boundingBox'),
            queue     = [];

        container.all('input').each(function(node) {
            queue.push({
                model: node.getData('model'),
                property: node.get('name'),
                value: node.get('value')
            });
        });

        Y.Array.each(queue, function(operation) {
            operation.model.set(
                operation.property, operation.value
            );
        });
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DataTableEditRowPlugin = DataTableEditRowPlugin;
