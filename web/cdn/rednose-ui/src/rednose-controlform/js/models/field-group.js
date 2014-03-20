/*jshint boss:true, expr:true, onevar:false */

var FieldGroup;

FieldGroup = Y.Base.create('fieldGroup', Y.Model, [], {

}, {
    ATTRS: {
        name: { value: null },
        category: { value: null },
        fieldGroupItems: { value: [] }
    }
});

Y.namespace('ControlForm').FieldGroup = FieldGroup;
