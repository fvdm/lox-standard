var FormItem;

FormItem = Y.Base.create('formItem', Y.Model, [], {

}, {
    ATTRS: {
        template: { value: null },
        step: { value: 0 },
        sortOrder: { value: 0 },
        direction: { value: 'left' },
        controlForm: { value: null },
        fieldGroupOrder: { value: [] }
    }
});

Y.namespace('ControlForm').FormItem = FormItem;
