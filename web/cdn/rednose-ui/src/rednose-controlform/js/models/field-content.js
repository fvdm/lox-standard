var FieldContent;

FieldContent = Y.Base.create('fieldContent', Y.Model, [], {

}, {
    ATTRS: {
        field: { value: null },
        content: { value: '' }
    }
});

Y.namespace('ControlForm').FieldContent = FieldContent;
