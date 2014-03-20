/*jshint boss:true, expr:true, onevar:false */

var TreeModel = Y.Rednose.ModelTree,
    ControlModel;

ControlModel = Y.Base.create('controlModel', Y.Model, [], {
    view: {},

    _setProperty: function(value) {
        if (Array.isArray(value)) {
            return {};
        } else {
            return value;
        }
    },
}, {
    ATTRS: {
        caption   : { value: null },
        foreignId : { value: null },
        type      : { value: null },
        properties: {
            value : {},
            setter: '_setProperty'
        },
        required  : { value: false },
        visible   : { value: true },
        protected : { value: false },
        readonly  : { value: false },
        sortOrder : { value: 0 },
        help      : { value: null },
        value     : { value: null }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').ControlModel = ControlModel;

var FormModel;

FormModel = Y.Base.create('formModel', Y.Model, [], {
    getTree: function () {
        var items = {
            label   : this.get('caption'),
            data    : new Y.Model(),
            icon    : 'icon-list-alt',
            children: []
        };

        // XXX
        if (!this.get('id') && !this.get('caption')) {
            return new TreeModel();
        }

        this.get('controls').each(function (model) {
            items.children.push({
                label   : model.get('caption'),
                data    : model,
                icon    : 'icon-minus'
            });
        });

        return new TreeModel({ items: items });
    },

    sync: function (action, options, callback) {
        if (action === 'read') {
            Y.io(Routing.generate('rednose_framework_forms_read', {'id': this.get('id')}), {
                method: 'GET',
                on : {
                    success : function (tx, r) {
                        callback(null, Y.JSON.parse(r.responseText));
                    },
                    failure : function (tx, r) {
                        callback(Y.JSON.parse(r.responseText));
                    }
                }
            });
        }
    },

    _setControls: function (value) {
        var list = new Y.ModelList();

        Y.Array.each(value, function (v) {
            if (Y.instanceOf(v, Y.Rednose.Form.ControlModel)) {
                list.add(v);
            } else if (typeof(v) === 'object') {
                list.add(new Y.Rednose.Form.ControlModel(v));
            } else {
                list.add(new Y.Rednose.Form.ControlModel(v.getAttrs()));
            }
        });

        return list;
    }
}, {
    ATTRS: {
        caption   : { value: null },
        foreignId : { value: null },
        controls  : {
            value : new Y.ModelList(),
            setter: '_setControls'
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').FormModel = FormModel;
