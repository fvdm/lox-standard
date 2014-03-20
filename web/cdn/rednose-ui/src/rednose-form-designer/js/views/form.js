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

    _controlMap: [],

    initializer: function () {
        var formModel   = this.get('model'),
            controlList = formModel.get('controls');

        controlList.after('add', this._handleAddControl, this);
    },

    destructor: function () {
        Y.Array.each(this._controlMap, function(control) {
            control.destroy();
            control = null;
        });

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
            self._renderControl(control);
        });

        // this._evalutateExpressions();

        return this;
    },

    _renderControl: function (control) {
        var container        = this.get('container'),
            controlView      = Y.Rednose.Form.ControlViewFactory.create(control),
            controlContainer = controlView.render().get('container'),
            self             = this;

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
            // var expressions = control.get('properties').expressions;

            // if (expressions) {
            //     Y.Object.each(expressions, function (expression) {
            //         self._expressionMap.push(expression);
            //     });
            // }


            var dd = new Y.DD.Drag({
                node: controlContainer,
                group: ['rednose-form-designer-form']
            }).plug(Y.Plugin.DDProxy, {
                moveOnEnd: false
            });

            dd.on('drag:start', function(e) {
                e.target.get('dragNode').setHTML('');
            });
            dd.on('drag:drag', function(e) {
                self._dragging(e, container.one('fieldset'), controlContainer);
            });
            dd.on('drag:end', function() {
                self._setSortOrder(container.one('fieldset'));
            });

            controlContainer.setData('model', control);

            container.one('fieldset').append(controlContainer);

            this._controlMap.push(controlView);
        }
    },

    _dragging: function(e, container, sender) {
        var y = e.currentTarget.mouseXY[1];
        var hit = false;

        container.all('> div').each(function(control) {
            if (sender.get('id') !== control.get('id')) {
                var top = control.getY();
                var bottom = (top + parseInt(control.getComputedStyle('height'), 10));

                if (y > top && y < bottom) {
                    sender.insertBefore(sender, control);

                    hit = true;
                }
            }
        });

        if (hit === false && y > (container.getY() + parseInt(container.getComputedStyle('height'), 10))) {
            container.append(sender);
        }
    },

    _setSortOrder: function(container) {
        var counter = 0,
            controls = [];

        container.all('> div').each(function(node) {
            var control = node.getData('model');

            control.set('sortOrder', counter);
            controls.push(control);

            counter++;
        });

        this.get('model').set('controls', controls);
    },

    _evalutateExpressions: function () {
        var self = this;

        var objectDefinitions = [];

        Y.Object.each(this._controlViewMap, function (view) {
            var id    = view.get('model').get('foreignId'),
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
    },

    _handleAddControl: function (e) {
        this._renderControl(e.model);
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.FormModel() }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').FormView = FormView;
