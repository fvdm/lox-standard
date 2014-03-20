YUI.add('rednose-datatable-select', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
 * Create a selection plugin for the RedNose DataTable widget.
 */
var CSS_SELECTED = 'selected',
    CSS_DATA     = 'data',
    CSS_COLUMNS  = 'columns',

    CSS_BOOTSTRAP_ICON_WHITE = 'icon-white',

    DATA_RECORD = 'data-yui3-record',

    /**
     Fired when a row is selected.

     @event select
     **/
    EVT_SELECT = 'select',

    /**
     Fired when a row is doubleclicked.

     @event dblclick
     @deprecated use open
     **/
    EVT_DBLCLICK = 'dblclick',

    /**
     Fired when a row is 'openened'.

     @event open
     **/
    EVT_OPEN = 'open';

function DataTableSelectPlugin () {
    DataTableSelectPlugin.superclass.constructor.apply(this, arguments);
}

/**
 * The identity of the plugin.
 */
DataTableSelectPlugin.NAME = 'dataTableSelectPlugin';

/**
 * The namespace for the plugin.
 */
DataTableSelectPlugin.NS = 'selectable';

/**
 * Static property used to define the default attribute configuration of the
 * plugin.
 */
DataTableSelectPlugin.ATTRS = {

    /**
     * The row currently selected.
     */
    selectedRow : {
        value: null
    }
};

// TODO: Persist selection after sorting.
Y.extend(DataTableSelectPlugin, Y.Plugin.Base, {

    /**
     * Bind the click events and set up a listener for the selectedRow attribute.
     */
    initializer: function () {
        var table      = this.get('host'),
            contentBox = table.get('contentBox');

        this.after('selectedRowChange', this._afterSelectedRowChange, this);

        contentBox.on('click', this._handleClick, this);
        contentBox.on('dblclick', this._handleDblClick, this);

        contentBox.on('clickoutside', this._handleClickOutside, this);
    },

    setSelection: function (selection) {
        var host = this.get('host'),
            row  = host.getRow(selection);

        if (row) {
            this.set('selectedRow', row);
        }
    },

    getSelection: function () {
        var row = this.get('selectedRow');

        if (row === null) {
            return null;
        }

        return this._getModelFromTableRow(row);
    },

    /**
     * Handles the click event, and updates the selectedRow attribute,
     * which fires an event on change.
     */
    _handleClick: function (e) {
        var target = e.target,
            host   = this.get('host');

        if (target.test('a')) {
            // Don't trigger selection for URL clicks.
            return false;
        }

        if (target.ancestor('.' + host.getClassName(CSS_DATA) + ' tr')) {
            // This is a table row, update the selection.
            this.set('selectedRow', target.ancestor('.' + host.getClassName(CSS_DATA) +  ' tr'));

        } else if (target.ancestor('.' + host.getClassName(CSS_COLUMNS))) {
            // This is a table column, ignore.
            return false;

        } else {
            // Clicked outside the rows, reset the selection.
            this.set('selectedRow', null);
        }

        return true;
    },

    _handleDblClick: function (e) {
        var table = this.get('host');

        // Fires the double click event from the host
        table.fire(EVT_DBLCLICK);

        table.fire(EVT_OPEN, { model: this._getModelFromTableRow(this.get('selectedRow')) });
    },

    /**
     * Handles the click event outside of the content-box and clears the selection.
     */
    _handleClickOutside: function (e) {
        // Clear the selection, only if the click outside target is an ancestor of the current target.
        if (Y.Rednose.Util.isAncestor(e.target, e.currentTarget)) {
            this.set('selectedRow', null);
        }
    },

    /**
     * The selection changed, update the DOM and fire an event containing
     * the model that was selected.
     */
    _afterSelectedRowChange: function (e) {
        var table   = this.get('host'),
            node    = e.newVal,
            oldNode = e.prevVal,
            model   = null;

        // Cancel if the selection did not change.
        if (node === oldNode) {
            return false;
        }

        // Remove all selection CSS on the previous selection
        if (oldNode) {
            oldNode.all('td').removeClass(table.getClassName(CSS_SELECTED));

            // Inverse the icon color if there is one.
            if (oldNode.one('i') && oldNode.one('i').hasClass(CSS_BOOTSTRAP_ICON_WHITE)) {
                oldNode.one('i').removeClass(CSS_BOOTSTRAP_ICON_WHITE);
            }
        }

        // Apply the CSS to the new selection and fire an event.
        if (Y.Lang.isNull(node) === false) {
            // After unhighlighting, now highlight the current row.
            node.all('td').addClass(table.getClassName(CSS_SELECTED));

            // Inverse the icon color if there is one.
            if (node.one('i')) {
                node.one('i').addClass(CSS_BOOTSTRAP_ICON_WHITE);
            }

            model = this._getModelFromTableRow(node);
        }

        // Fires the select event from the host and passes along the needed information.
        table.fire(EVT_SELECT, { model: model });

        return true;
    },

    /**
     * Parse an HTML <tr/> node and retrieve the corresponding model from the model list.
     */
    _getModelFromTableRow: function (node) {
        // The model's ClientID is stored within an HTML5 data attribute ('data-yui3-record'),
        // for example 'image_1'.
        var id        = node.getAttribute(DATA_RECORD),
            modelList = this.get('host').data;

        return modelList.getByClientId(id);
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DataTableSelectPlugin = DataTableSelectPlugin;
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


}, '1.1.0-DEV', {"requires": ["rednose-datatable", "plugin"]});
