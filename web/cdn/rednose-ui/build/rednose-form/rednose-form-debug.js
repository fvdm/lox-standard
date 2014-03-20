YUI.add('rednose-form', function (Y, NAME) {

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
/*jshint boss:true, expr:true, onevar:false */

var TXT_TYPE_TO_SEARCH = 'Type here to search...';

var Micro        = Y.Template.Micro,
    AutoComplete = Y.Rednose.ControlFormAutoComplete,
    AutocompleteControlView;

AutocompleteControlView = Y.Base.create('autoCompleteControlView', Y.Rednose.Form.BaseControlView, [], {

    AUTOCOMPLETE_TEMPLATE: Micro.compile(
        '<a role="menuitem">' +
            '<img class="avatar size32" src="<%= data.image %>">' +
            '<span class="title-block">' +
                '<span class="title"><%== data.title %></span>' +
            '</span>' +
            '<span class="subtitle"><%= data.subtitle %></span>' +
        '</a>'
    ),

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<input type="text" class="input-block-level" id="{id}" placeholder="{placeholder}"/>' +
                  '</div>' +
              '</div>',

    _inputNode: null,

    _autoComplete: null,

    events: {
        'input': {
            // TODO: Add keyup event for faster updating, but filter out the autocomplete keypresses.
            change: '_handleInputChange'
        }
    },

    destructor: function () {
        this._autoComplete.destroy();

        this._inputNode    = null;
        this._autoComplete = null;
    },

    render: function () {
        var container  = this.get('container'),
            model      = this.get('model'),
            template   = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id         : model.get('id'),
            label      : model.get('caption'),
            placeholder: TXT_TYPE_TO_SEARCH
        }));

        this._inputNode = container.one('input');

        model.get('visible') ? container.show() : container.hide();

        this._renderAutoComplete();

        return this;
    },

    _renderAutoComplete: function () {
        var choices    = this.get('model').get('properties').choices,
            datasource = this.get('model').get('properties').datasource,
            config;

        config = {
            inputNode : this._inputNode,
            choices   : choices,
            datasource: datasource
        };

        this._autoComplete = new AutoComplete(config).render();
    },

    _handleInputChange: function () {
        var value = this._inputNode.get('value');

        this.set('value', value);

        this.fire('change', {
            model: this.get('model'),
            value: {
                value: value
            }
        });
    }
});

Y.namespace('Rednose.Form').AutocompleteControlView = AutocompleteControlView;
/*jshint boss:true, expr:true, onevar:false */

var Micro = Y.Template.Micro,
    DateTimeControlView;

DateTimeControlView = Y.Base.create('dateTimeControlView', Y.Rednose.Form.BaseControlView, [], {

    OPTION_TEMPLATE: Micro.compile('<option value="<%= data.value %>"<% if (data.selected) { %> selected<% }%>><%= data.label %></option>'),

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls controls-row">' +
                      '<select id="{id}" class="rednose-date-day"></select>' +
                      '<select class="rednose-date-month"></select>' +
                      '<select class="rednose-date-year"></select>' +
                      '<select class="rednose-date-hour"></select>' +
                      ':' +
                      '<select class="rednose-date-minute"></select>' +
                  '</div>' +
              '</div>',

    render: function () {
        var date           = new Date(),
            reflectionDate = new Date();

        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id:    model.get('id'),
            label: model.get('caption')
        }));

        for (var i = 1; i <= 31; i++) {
            reflectionDate.setDate(i);

            container.one('.rednose-date-day').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%d'} ),
                selected: i === date.getDate()
            }));
        }

        for (var i = 0; i <= 11; i++) {
            reflectionDate.setMonth(i);

            container.one('.rednose-date-month').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%B'} ),
                selected: i === date.getMonth()
            }));
        }

        for (var i = date.getFullYear() - 5; i <= date.getFullYear() + 5; i++) {
            reflectionDate.setFullYear(i);

            container.one('.rednose-date-year').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%G'} ),
                selected: i === date.getFullYear()
            }));
        }

        for (var i = 0; i <= 23; i++) {
            reflectionDate.setHours(i);

            container.one('.rednose-date-hour').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%H'} ),
                selected: i === date.getHours()
            }));
        }

        for (var i = 0; i <= 59; i++) {
            reflectionDate.setMinutes(i);

            container.one('.rednose-date-minute').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%M'} ),
                selected: i === date.getMinutes()
            }));
        }

        return this;
    },

    // XXX
    focus: function () {
        var node = this.get('container').one('select');

        if (node) {
            node.focus();
        }
    },

});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').DateTimeControlView = DateTimeControlView;
/*jshint boss:true, expr:true, onevar:false */

var TextAreaControlView;

TextAreaControlView = Y.Base.create('textAreaControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<textarea rows="3" class="input-block-level" id="{id}"></textarea>' +
                  '</div>' +
              '</div>',

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        return this;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').TextAreaControlView = TextAreaControlView;

var RichTextControlView;

RichTextControlView = Y.Base.create('richTextControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<textarea class="input-block-level" id="{id}"></textarea>' +
                  '</div>' +
              '</div>',

    _editor: null,

    _rendered: false,

    destructor: function () {
        this._editor.destroy();

        this._editor = null;
    },

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        if (this._rendered) {
            return;
        }

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        this._editor = new Y.Rednose.ControlFormRichTextEditor({
            srcNode   : container.one('textarea'),
            replace   : true,
            properties: {
                input_properties: {
                    styles    : 'true',
                    clipboard : 'true',
                    editing   : 'true',
                    undoredo  : 'true'
                }
            }
        }).render();

        this._rendered = true;

        return this;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').RichTextControlView = RichTextControlView;
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

    destructor: function () {
        this.clear();
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
            var controlView  = Y.Rednose.Form.ControlViewFactory.create(control);

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
                var expressions = control.get('properties').expressions;

                if (expressions) {
                    Y.Object.each(expressions, function (expression) {
                        self._expressionMap.push(expression);
                    });
                }

                container.one('fieldset').append(controlView.render().get('container'));
            }
        });

        // this._evalutateExpressions();

        return this;
    },

    clear: function() {
        Y.Object.each(this._controlViewMap, function (view) {
            view.remove();
        });
    },

    _evalutateExpressions: function () {
        var self = this;

        var objectDefinitions = [];

        Y.Object.each(this._controlViewMap, function (view) {
            var id    = view.get('model').get('id'),
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
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.FormModel() }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').FormView = FormView;
/*jshint boss:true, expr:true, onevar:false */

var TYPE_TEXT          = 'text',
    TYPE_TEXTAREA      = 'textarea',
    TYPE_HTML          = 'html',
    TYPE_DATE          = 'date',
    TYPE_DATETIME      = 'datetime',
    TYPE_DROPDOWN      = 'dropdown',
    TYPE_RADIO         = 'radio',
    TYPE_CHECKBOX      = 'checkbox',
    TYPE_AUTOCOMPLETE  = 'autocomplete',
    TYPE_FILE          = 'file';

function ControlViewFactory() {
    ControlViewFactory.superclass.constructor.apply(this);
}

ControlViewFactory.create = function (model) {
    switch (model.get('type')) {
        case TYPE_TEXT:
            return new Y.Rednose.Form.TextControlView({ model: model });
        case TYPE_DROPDOWN:
            return new Y.Rednose.Form.DropDownControlView({ model: model });
        case TYPE_TEXTAREA:
            return new Y.Rednose.Form.TextAreaControlView({ model: model });
        case TYPE_HTML:
            return new Y.Rednose.Form.RichTextControlView({ model: model });
        case TYPE_DATE:
            return null;
        case TYPE_DATETIME:
            return new Y.Rednose.Form.DateTimeControlView({ model: model });
        case TYPE_RADIO:
            return null;
        case TYPE_CHECKBOX:
            return new Y.Rednose.Form.CheckboxControlView({ model: model });
        case TYPE_AUTOCOMPLETE:
            return new Y.Rednose.Form.AutocompleteControlView({ model: model });
        case TYPE_FILE:
            return null;
    }

    return null;
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').ControlViewFactory = ControlViewFactory;


}, '1.1.0-DEV', {
    "requires": [
        "rednose-controlform",
        "rednose-dataprovider",
        "rednose-form-css",
        "template-micro",
        "uploader"
    ]
});
