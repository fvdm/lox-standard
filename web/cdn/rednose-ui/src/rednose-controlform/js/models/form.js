var Form;

Form = Y.Base.create('form', Y.Model, [], {

    removeFieldGroup: function(fgId) {
        for (var i in this.get('fieldGroups')) {
            if (this.get('fieldGroups')[i]['id'] == fgId) {
                var fieldGroups = this.get('fieldGroups');

                fieldGroups.splice(i, 1);

                this.set('fieldGroups', fieldGroups);
            }
        }
    },

    getFieldGroup: function(fgId) {
        for (var i in this.get('fieldGroups')) {
            if (this.get('fieldGroups')[i].get('id') == fgId) {
                return this.get('fieldGroups')[i];
            }
        }

        return false;
    },

    _setFieldGroups: function(value) {
        var fgBuffer = Array();

        Y.each(value, function(fg) {
            var fgiBuffer = Array();

            Y.each(fg.fieldGroupItems, function(fgi) {
                fgiBuffer.push(new Y.ControlForm.FieldGroupItem(fgi));
            });

            fg = new Y.ControlForm.FieldGroup(fg);
            fg.set('fieldGroupItems', fgiBuffer);

            fgBuffer.push(fg);
        });

        return fgBuffer;
    }

}, {
    ATTRS: {
        caption: { value: '' },
        fieldGroups: {
            value: [],
            setter: '_setFieldGroups'
        }
    }
});

Y.namespace('ControlForm').Form = Form;
