/*jshint boss:true, expr:true, onevar:false */

var FormItem = Y.ControlForm.FormItem,
    Form = Y.ControlForm.Form,
    FormItems;

FormItems = Y.Base.create('formItems', Y.ModelList, [], {
    model: FormItem,

    parse: function (response) {
        return response.map(function (controlFormItem) {
            if (controlFormItem.controlForm !== null) {
                controlFormItem.controlForm = new Form(controlFormItem.controlForm);
            }

            return controlFormItem;
        });
    },

    sync: function (action, options, callback) {
        var self = this;

        if (action === 'read') {
            Y.io(Routing.generate('rednose_docgen_forms_list', options), {
                method: 'GET',
                on: {
                    success: function (tx, r) {
                        self.set('templateId', options.templateId);

                        callback(null, Y.JSON.parse(r.responseText));
                    }
                }
            });
        }
    },

    comparator: function (model) {
        return model.get('sortOrder');
    },

    setPosition: function(formId, sortOrder, direction) {
        this.updateProperty(formId, 'sortOrder', sortOrder);
        this.updateProperty(formId, 'direction', direction);
    },

    updateProperty: function(formId, property, value) {
        this.each(function(formItem) {
            if (formItem.get('id') === formId) {
                formItem.set(property, value);
            }
        });
    },

    isModified: function() {
        // TODO...
        return true;
    },

    addForm: function(title) {
        var self = this;
        var newForm = {
            id: 'tmp_' + Math.round((new Date()).getTime() / 1000) + (Math.round(Math.random()) * 999999),
            direction: 'left',
            controlForm: new Y.ControlForm.Form({
                caption: title,
                fieldGroups: []
            }),
            sortOrder: self.size(),
            template: self.get('templateId')
        };

        self.add(newForm);
    },

    deleteForm: function(formId) {
        var self = this;

        this.each(function(formItem) {
            if (formItem.get('id') === formId) {
                self.remove(formItem);
            }
        });
    },

    getFieldGroup: function(fgId) {
        var fg = null;

        this.each(function(formItem) {
            if (formItem.get('controlForm').getFieldGroup(fgId)) {
                fg = formItem.get('controlForm').getFieldGroup(fgId);
            }
        });

        return fg;
    },

    deleteFieldGroup: function(formId, fgId) {
        this.each(function(formItem) {
            if (formItem.get('id') === formId) {
                formItem.get('controlForm').removeFieldGroup(fgId);
            }
        });
    }
}, {
    ATTRS: {
        templateId: { value: null }
    }
});

Y.namespace('ControlForm').FormItems = FormItems;
