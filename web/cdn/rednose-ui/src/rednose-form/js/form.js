/*jshint boss:true, expr:true, onevar:false */

var Micro = Y.Template.Micro,
    FormView;

FormView = Y.Base.create('formView', Y.View, [], {
    template: Micro.compile(
        '<div class="rednose-form-view">' +
            '<form class="rednose-form form<%= data.horizontal ? \'-horizontal\' : \'\' %>">' +
                '<fieldset>' +
                    '<% if (data.caption) { %>' +
                        '<legend><%= data.caption %></legend>' +
                    '<% } %>' +
                '</fieldset>' +
            '</form>' +
        '</div>'
    ),

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

        container.setHTML(template({
            horizontal: this.get('horizontal'),
            caption   : model.get('caption')
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
        horizontal: {
            value: true,
        },

        model: {
            value: new Y.Rednose.Form.FormModel()
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').FormView = FormView;
