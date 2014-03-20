/*jshint boss:true, expr:true, onevar:false */

var Selectable;

/**
 * Y.Rednose.Grid widget extension to support selection of grid items
 */
Selectable = function () {};

Selectable.prototype = {
    // -- Lifecycle Methods ----------------------------------------------------

    /**
     * Initializer, gets called upon instance initiation.
     */
    initializer: function () {
        this._setSelectable();
    },

    // -- Public Methods -------------------------------------------------------

    /**
     * Programmatically select a grid item
     */
    select: function(node) {
        node.simulate('click');
    },

    // -- Protected Methods ----------------------------------------------------

    /**
     * Bind the click events and set up a listener for the selectedItem attribute.
     */
    _bind: function () {
        var container = this.get('container');

        container.delegate('dblclick', this._handleDoubleClick, '.model-grid-icon-container .model-grid-icon', this);

        container.on('click', this._handleClick, this);
        container.on('clickoutside', this._handleClickOutside, this);

        this.after('selectedItemChange', this._afterSelectedItemChange, this);
    },

    /**
     * Parse an HTML node and retrieve the corresponding model from the model list.
     */
    _getModelFromGridItem: function (node) {
        // The model's ClientID is stored within an HTML5 data attribute ('data-yui3-record'),
        // for example 'image_1'.
        var id        = node.ancestor('.model-grid-container').getAttribute('data-yui3-record'),
            list      = this.get('data'),
            found     = null;

        return list.getByClientId(id);
    },

    /**
     * Setter.
     */
    _setSelectable: function () {
        var selectable = this.get('selectable');

        if (selectable) {
            this._bind();
        }
    },

    // -- Protected Event Handlers ---------------------------------------------

    /**
     * Handles the item click event, and updates the selectedItem attribute,
     * which fires an event on change.
     */
    _handleClick: function (e) {
        var node = null;

        if (e.target.hasClass('model-grid-icon')) {
            node = e.target.ancestor('.model-grid-icon-container');
        }

        this.set('selectedItem', node);
    },

    _handleDoubleClick: function (e) {
        var node  = e.currentTarget.ancestor('.model-grid-icon-container'),
            model = this._getModelFromGridItem(node);

        this.fire('open', { model: model });
    },

    _handleClickOutside: function (e) {
        // Clear the selection, only if the click outside target is an ancestor of the current target.
        if (Y.Rednose.Util.isAncestor(e.target, e.currentTarget)) {
            this.set('selectedItem', null);
        }
    },

    /**
     * The selection changed, update the DOM and fire an event containing
     * the model that was selected.
     */
    _afterSelectedItemChange: function (e) {
        var container = this.get('container'),
            node       = e.newVal,
            oldNode    = e.prevVal,
            model      = null;

        // Cancel if the selection did not change.
        if (node && node === oldNode) {
            return;
        }

        // Remove earlier selections.
        container.all('.model-grid-item-selected').removeClass('model-grid-item-selected');

        // Apply the CSS to the new selection and fire an event.
        if (Y.Lang.isNull(node) === false) {
            node.addClass('model-grid-item-selected');

            model = this._getModelFromGridItem(node);
        }

        // Fires the select event and passes along the needed information.
        this.fire('select', { model: model });
    }
};

Selectable.ATTRS = {
    /**
     * Config property, enable selection for this Grid instance
     */
    selectable: {
        value: false
    },

    /**
     * The item currently selected.
     */
    selectedItem : {
        value: null
    }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Grid').Selectable = Selectable;
