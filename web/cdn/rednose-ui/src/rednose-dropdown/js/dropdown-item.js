/*jshint expr:true, onevar:false */

/**
 * @class Rednose.DropdownItem
 * @param {Rednose.Dropdown} dropdown
 * @param {Object} [config]
 * @constructor
 */
function DropdownItem(dropdown, config) {
    config || (config = {});

    this.dropdown = dropdown;
    this.id       = config.id || Y.stamp(this);
    this.type     = config.type || 'item';
    this.url      = config.url || '#';
    this.children = [];

    Y.mix(this, config);
}

DropdownItem.prototype = {
    /**
     * The id for this node.
     *
     * @property {string} title
     * @readOnly
     */

    /**
     * The dropdown instance.
     *
     * @property {Rednose.Dropdown} dropdown
     * @readOnly
     */

    /**
     * This node's children.
     *
     * @property {Array} children
     * @readOnly
     */

    /**
     * This node's type.
     *
     * @property {String} type
     * @readOnly
     */

    /**
     * Whether this node is disabled or not.
     *
     * @property {Boolean} disabled
     * @readOnly
     */

    /**
     * The icon for this node.
     *
     * @property {Boolean} disabled
     * @readOnly
     */

    /**
     * The title for this node.
     *
     * @property {String} title
     * @readOnly
     */

    /**
     * The URL for this node.
     *
     * @property {String} url
     * @readOnly
     */

    /**
     * Custom HTML for this node.
     *
     * @property {String} html
     * @readOnly
     */

    // -- Public Methods -------------------------------------------------------

    /**
     * Enables this item.
     */
    enable: function () {
        this.dropdown.enableItem(this);

        return this;
    },

    /**
     * Disables this item.
     *
     * @chainable
     */
    disable: function () {
        this.dropdown.disableItem(this);

        return this;
    },

    /**
     * Renames this item.
     *
     * @param {String} title
     */
    rename: function (title) {
        this.dropdown.renameItem(this, title);

        return this;
    },

    /**
     * Whether this node is disabled or not.
     *
     * @return {Boolean}
     */
    isDisabled: function () {
        return this.disabled === true;
    },

    /**
     * Whether this node has children or not.
     *
     * @return {Boolean}
     */
    hasChildren: function () {
        return this.children && this.children.length > 0;
    },

    /**
     * Adds a child to this node.
     *
     * @param {Rednose.DropdownItem} child
     */
    addChild: function (child) {
        this.children.push(child);
    }
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DropdownItem = DropdownItem;
