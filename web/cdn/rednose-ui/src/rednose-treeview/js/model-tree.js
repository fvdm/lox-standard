/*jshint boss:true, expr:true, onevar:false */

var ModelTree;

ModelTree = Y.Base.create('modelTree', Y.Model, [], {

    _items: [],

    getByType: function (type) {
        var tree = this._items;

        return this._treeFindByType(type, tree);
    },

    getByAttr: function (type, attr, value) {
        var tree = this._items,
            node = this._treeFind(value, tree, attr, type);

        return node ? node.data : null;
    },

    filterByAttr: function (type, attr, value) {
        var tree  = this._items;

        return this._treeFilter(value, tree, attr, type);
    },

    /**
     * Get the index path of a given model
     *
     * @param model
     * @param path
     *
     * @returns {String}
     */
    getIndexPath: function (model, path) {
        path = path || [];

        var node   = this._treeFind(model.get('clientId'), this._items),
            parent = this._getParentNode(node),
            root;

        root = parent ? parent.children : this._items;

        if (!node) {
            return null;
        }

        path.unshift(root.indexOf(node));

        if (parent) {
            return this.getIndexPath(parent.data, path);
        }

        return String(path.join('/'));
    },

    /**
     * Compares the index paths for two given models.
     *
     * a > b = 1
     * a < b = -1
     * a === b = 0
     *
     * @param a
     * @param b
     *
     * return {integer}
     */
    compareIndexPath: function (a, b) {
        if (!a || !b) {
            return !a && !b ? 0 : (!a ? -1 : 1);
        }

        var indexPathA = this.getIndexPath(a),
            indexPathB = this.getIndexPath(b);

        if (indexPathA === indexPathB) {
            return 0;
        }

        var partsA = indexPathA.split('/'),
            partsB = indexPathB.split('/');

        // Normalize arrays.
        var length = Math.min(partsA.length, partsB.length);

        partsA = partsA.splice(0, length + 1);
        partsB = partsB.splice(0, length + 1);

        partsA[length] === undefined && (partsA[length] = -1);
        partsB[length] === undefined && (partsB[length] = -1);

        partsA.reverse();
        partsB.reverse();

        var result = 0;

        for (var i = 0; i <= length; i++) {
            if (partsA[i] === partsB[i]) {
                continue;
            }

            result = partsA[i] > partsB[i] ? 1 : -1;
        }

        return result;
    },

    /**
     * Return all children with a given type for a given parent.
     *
     * @param parent
     * @param type
     *
     * @returns Array
     */
    getChildren: function (parent, type) {
        var tree = this._items,
            node = this._treeFind(parent.get('clientId'), tree);

        if (!node || !node.children) {
            return [];
        }

        return Y.Array.filter(node.children, (function (child) {
            return child.data.name === type;
        }));
    },

    /**
     * Get a model from the tree by client ID.
     */
    getByClientId: function (clientID) {
        var tree = this._items,
            node = this._treeFind(clientID, tree);

        return node ? node.data : null;
    },

    /**
     * Get a model's leaves from the tree by client ID.
     */
    getLeavesByClientId: function (clientID) {
        var tree   = this._items,
            node   = this._treeFind(clientID, tree),
            leaves = [];

        // Filter out the child branches, we just want the leaves.
        Y.Array.each(node.children, function (c) {
            if (Y.Lang.isArray(c.children) === false) {
                leaves.push(c.data);
            }
        });

        return leaves;
    },

    /**
     * Returns just the (potential) branch nodes.
     */
    getBranches: function () {
        var tree     = this._items,
            branches = this._findBranches(tree);

        return branches;
    },

    _getParentNode: function (node, tree) {
        tree = tree || this._items;

        var self   = this,
            result = null;

        Y.Array.each(tree, function (item) {
            if (!result) {
                if (self._containsNode(item, node)) {
                    result = item;
                } else if (item.children) {
                    result = self._getParentNode(node, item.children);
                }
            }
        });

        return result;
    },

    _containsNode: function (parentNode, childNode) {
        var result = false;

        if (!parentNode.children) {
            return false;
        }

        Y.Array.each(parentNode.children, function (node) {
            if (childNode === node) {
                result = true;
            }
        });

        return result;
    },

    /**
     * Return all (potential) sub-branches of a given branch.
     */
    _findBranches: function (branch) {
        var self     = this,
            branches = [];

        Y.Array.each(branch, function (item) {
            var obj = {};

            // TODO: Make the instance compare to a config attribute for the Treeview,
            // and get this data by calling getBranches(Y.TB.Category).
            if (Y.instanceOf(item.data, Y.TB.Category)) {
                obj.label = item.label;
                obj.data  = item.data;

                if (item.children) {
                    obj.children = self._findBranches(item.children);
                }

                branches.push(obj);
            }
        });

        return branches;
    },

    /**
     * Find a node in the tree by specified the client ID of the model it contains.
     */
    _treeFind: function (value, branch, attr, type) {
        var self  = this,
            found = null;

        attr = attr || 'clientId';

        Y.Array.each(branch, function (item) {
            if (item.data.get(attr) === value) {
                if (!type || (item.data.name === type)) {
                    found = item;
                }
            }

            if (Y.Lang.isNull(found) && item.children) {
                found = self._treeFind(value, item.children, attr, type);
            }
        });

        return found;
    },

    _treeFindByType: function (type, branch, buffer) {
        var self   = this;

        buffer = buffer || [];

        Y.Array.each(branch, function (item) {
            if (item.data.name === type) {
                buffer.push(item.data);
            }

            if (item.children) {
                buffer = self._treeFindByType(type, item.children, buffer);
            }
        });

        return buffer;
    },

    _treeFilter: function (value, branch, attr, type) {
        var self   = this,
            buffer = [];

        attr = attr || 'clientId';

        Y.Array.each(branch, function (item) {
            var obj = {};

            if (item.data.name !== type || Y.Array.indexOf(value, item.data.get(attr)) !== -1) {
                obj.label = item.label;
                obj.data = item.data;

                if (item.children) {
                    obj.children = self._treeFilter(value, item.children, attr, type);
                }

                buffer.push(obj);
            }
        });

        return buffer;
    },

    _setItems: function (val) {
        this._items = val;
    },

    _getItems: function () {
        var filter = this.get('filter');

        if (filter && filter.type) {
            return this.filterByAttr(filter.type, filter.attr, filter.value);
        }

        return this._items;
    }
}, {
    ATTRS: {
        items: {
            setter: '_setItems',
            getter: '_getItems'
        },

        filter: {
            value : {}
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').ModelTree = ModelTree;
