/*jshint boss:true, expr:true, onevar:false */

var EVT_SELECT = 'select';

BaseControlView = Y.Base.create('baseControlView', Y.View, [], {
    events: {
        'input, select': {
            focus: '_handleSelect'
        }
    },

    initializer: function () {
        var model = this.get('model');

        model.after('change', this.render, this);
    },

    // XXX
    focus: function () {
        var node = this.get('container').one('input');

        if (node) {
            node.focus();
        }
    },

    _handleSelect: function (e) {
        e.model = this.get('model');

        this.fire(EVT_SELECT, e);
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.ControlModel() },

        value: {
            value: false
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').BaseControlView = BaseControlView;

var TextControlView;

TextControlView = Y.Base.create('textControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<input class="input-block-level" id="{id}" type="text"/>' +
                  '</div>' +
              '</div>',

    _inputNode: null,

    destructor: function () {
        this._inputNode = null;
    },

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        this._inputNode = container.one('input');

        model.get('visible') ? container.show() : container.hide();

        if (model.get('required')) {
            this._inputNode.setAttribute('required', 'required');
        } else if (this._inputNode.hasAttribute('required')) {
            this._inputNode.removeAttribute('required');
        }

        if (model.get('protected')) {
            this._inputNode.setAttribute('readonly', 'readonly');
        } else if (this._inputNode.hasAttribute('readonly')) {
            this._inputNode.removeAttribute('readonly');
        }

        if (model.get('readonly')) {
            this._inputNode.setAttribute('disabled', 'disabled');
        } else if (this._inputNode.hasAttribute('disabled')) {
            this._inputNode.removeAttribute('disabled');
        }

        return this;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').TextControlView = TextControlView;

var CheckboxControlView;

CheckboxControlView = Y.Base.create('checkboxControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<div class="controls">' +
                      '<label class="checkbox">' +
                          '<input type="checkbox" id="{id}"> {label}' +
                      '</label>' +
                  '</div>' +
              '</div>',

    events: {
        'input': {
            change: '_handleInputChange'
        },

        // FIMXE: Fires twice.
        '.checkbox': {
            click: '_handleSelect'
        }
    },

    _inputNode: null,

    destructor: function () {
        this._inputNode = null;
    },

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        this.set('value', model.get('value'));

        this._inputNode = container.one('input');
        this._inputNode.set('checked', this.get('value'));

        model.get('visible') ? container.show() : container.hide();

        return this;
    },

    _handleInputChange: function () {
        var value = this._inputNode.get('checked');

        this.set('value', value);

        // XXX
        this.get('model').set('value', value);

        this.fire('change', {
            model: this.get('model'),
            value: {
                value: value
            }
        });
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').CheckboxControlView = CheckboxControlView;

var DropDownControlView;

DropDownControlView = Y.Base.create('dropDownControlView', Y.Rednose.Form.BaseControlView, [], {

    OPTION_TEMPLATE: '<option value="{value}">{label}</option>',

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<select class="input-block-level" id="{id}"></select>' +
                  '</div>' +
              '</div>',

    render: function () {
        var self       = this,
            container  = this.get('container'),
            model      = this.get('model'),
            properties = model.get('properties'),
            template   = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id     : model.get('id'),
            label  : model.get('caption'),
        }));

        if (properties.datasource) {
            var source = properties.datasource;

            Y.io(Routing.generate('rednose_dataprovider_data_list', { id: source.id }) , {
                method: 'GET',
                on : {
                    success : function (tx, r) {
                        var results = Y.JSON.parse(r.responseText).results,
                            data    = source.map ? self._mapDataProviderData(results, source.map) : results;


                        self._updateSelectNode(container.one('select'), data);
                    }
                }
            });
        } else if (properties.choices) {
            this._updateSelectNode(container.one('select'), this._mapChoicesPropertyData(properties.choices));
        }

        return this;
    },

    _mapChoicesPropertyData: function (data) {
        var mappedData = [];

        Y.Object.each(data, function (label, value) {
            mappedData.push({ value: value, label: label });
        });

        return mappedData;
    },

    _mapDataProviderData: function (data, map) {
        return Y.Array.map(data, function (result) {
            var mappedResult = {};

            Y.Object.each(map, function (src, dest) {
                mappedResult[dest] = result[src];
            });

            return mappedResult;
        });
    },

    _updateSelectNode: function (node, data) {
        var self = this;

        Y.Array.each(data, function (result) {
            node.append(Y.Lang.sub(self.OPTION_TEMPLATE, {
                value: result.value,
                label: result.label
            }));
        });
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').DropDownControlView = DropDownControlView;
