/*jshint boss:true, expr:true, onevar:false */

var FieldGroupItem;

FieldGroupItem = Y.Base.create('fieldGroupItem', Y.ModelList, [], {

}, {
    ATTRS: {
        field: { value: null },
        fieldGroup: { value: null },
        position: { value: 0 },
        rules: { value: {} },
        sortOrder: { value: 0 },
    }
});

Y.namespace('ControlForm').FieldGroupItem = FieldGroupItem;
