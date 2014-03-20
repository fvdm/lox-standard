/*jshint boss:true, expr:true, onevar:false */

var Common;

Common = Y.Base.create('common', Y.Widget, [ ], {

    initializer: function() {
    },

    render: function() {
        var properties = this.get('properties');

        if (typeof(properties.input_method) === 'undefined') {
            this._renderInput();

            return;
        }

        switch (properties.input_method.inputElement) {
            case 'input':
                this._renderInput();
                break;

            case 'textarea':
                this._renderInput(true);
                break;

            case 'dropdown':
                this._renderDropdown();
                break;

            case 'checkbox':
                this._renderCheckbox();
                break;

            case 'radio':
                this._renderRadio();
                break;
        }
    },

    _renderInput: function(textarea) {
        var textfield = Y.Node.create(textarea ? '<textarea />' : '<input />');
        var properties = this._getProperties();

        if (properties.defaultValue) {
            textfield.set('value', properties.defaultValue);
        }

        this.get('srcNode').append(textfield);
    },

    _renderDropdown: function() {
        var select = Y.Node.create('<select />');
        var properties = this._getProperties();

        if (typeof(properties.input_restrictions) !== 'undefined') {
            for (var i in properties.input_restrictions) {
                var restrictions = properties.input_restrictions[i];
                var option = Y.Node.create('<option>' + restrictions.name + '</option>');

                if (restrictions.value === '') {
                    option.setAttribute('value', restrictions.name);
                } else {
                    option.setAttribute('value', restrictions.value);
                }

                if (properties.defaultValue) {
                    if (option.get('innerHTML') === properties.defaultValue) {
                        option.setAttribute('selected', 'selected');
                    }
                }

                select.append(option);
            }
        }

        this.get('srcNode').append(select);
    },

    _renderCheckbox: function() {
        var properties = this._getProperties();
        var checkbox = Y.Node.create('<input type="checkbox" />');

        this.get('srcNode').append(checkbox);

        if (properties.defaultValue) {
            checkbox.set('checked', (properties.defaultValue === 'true'));
        }
    },

    _renderRadio: function() {
        var name = 'rand' + Math.floor(Math.random() * 1010101) + (new Date().getTime());
        var properties = this._getProperties();
        var container = Y.Node.create('<span class="radioGroup" id="' + name + '" />');

        if (typeof(properties.input_restrictions) !== 'undefined') {
            for (var i in properties.input_restrictions) {
                var restrictions = properties.input_restrictions[i];
                var radio = Y.Node.create('<input type="radio" name="' + name + '" />');

                if (properties.defaultValue) {
                    if (properties.defaultValue === restrictions.name) {
                        radio.set('checked', true);
                    }
                }

                if (restrictions.value === '') {
                    radio.setAttribute('value', restrictions.name);
                } else {
                    radio.setAttribute('value', restrictions.value);
                }

                container.append(radio);
                container.append(Y.Node.create(restrictions.name));
                container.append(Y.Node.create('<br />'));
            }

            this.get('srcNode').append(container);
        }
    },

    _getProperties: function() {
        var properties = this.get('properties');

        return properties;
    }
}, {
    ATTRS: {
        properties: { value: {} },
    }
});

Y.namespace('Rednose').ControlFormCommon = Common;
