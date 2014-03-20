var ConfigureItems;

ConfigureItems = Y.Base.create('configureItems', Y.Widget, [ Y.Rednose.Dialog ], {
    template:
        '<div>' +
        '   <div class="control-group">' +
        '   </div>' +
        '</div>',

    _table: null,

    render: function () {
        var self = this,
            view = Y.Node.create(this.template),
            properties = this.get('model').get('properties'),
            data = [];

        if (properties.choices) {
            Y.Object.each(properties.choices, function (label, value) {
                data.push({ label: label, value: value });
            });
        }

        this._table = new Y.Rednose.DataTable({
            columns: [
                { key: 'label', label: 'Label', editable: true },
                { key: 'value', label: 'Value', editable: true }
            ],
            data: data,
        })

        this._table.render(view.one('.control-group'));
        view.one('.control-group').setStyle('width', '630px;');

        this.prompt({
            title: 'Configure items: ' + this.get('model').get('caption'),
            html: view
        }, function(form) {
            var items = {},
                properties = self.get('model').get('properties'),
                modellist = self._table.hasPlugin('editable').getData()

            modellist.each(function(model) {
                items[model.get('value')] = model.get('label');
            });

            properties.choices = items;

            self.get('model').set('properties', properties);

            self.destroy();
        });

        this._table.plug(Y.Rednose.DataTableEditRowPlugin);
        this._table.plug(Y.Rednose.DataTableSelectPlugin);

        this.addButtons([
            {
                value: '',
                icon: 'icon-plus',
                position: 'left',
                callback: function() {
                    self._addItem();
                }
            }, {
                value: '',
                icon: 'icon-remove',
                position: 'left',
                callback: function() {
                    self._removeItem();
                }
            }
        ]);
    },

    _addItem: function() {
        var model = this._table.get('data');

        model.add({ name: '', value: '' });
    },

    _removeItem: function() {
        var selectedRow = this._table.hasPlugin('selectable').getSelection();

        if (selectedRow) {
            selectedRow.destroy();
        }
    },

}, {
    ATTRS: {
        model: { value: null }
    }
});

Y.namespace('Rednose.FormDesigner').ConfigureItems = ConfigureItems;
