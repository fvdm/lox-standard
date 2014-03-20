/*jshint boss:true, expr:true, onevar:false */

var Micro = Y.Template.Micro,
    AutoComplete;

AutoComplete = Y.Base.create('autoComplete', Y.AutoCompleteList, [], {
    AUTOCOMPLETE_TEMPLATE: Micro.compile(
        '<a role="menuitem">' +
            '<% if (data.image) { %>' +
                '<img class="avatar size32" src="<%= data.image %>">' +
            '<% } %>' +
            '<span class="title-block">' +
                '<span class="title"><%== data.title %></span>' +
            '</span>' +
            '<span class="subtitle"><%= data.subtitle %></span>' +
        '</a>'
    ),

    initializer: function () {
        var template   = this.AUTOCOMPLETE_TEMPLATE,
            choices    = this.get('choices'),
            datasource = this.get('datasource'),
            self       = this;

        this.get('inputNode').setAttribute('autocomplete', 'off');

        if (datasource) {
            this.set('resultListLocator', 'results');
            this.set('resultFormatter', function (query, raw) {
                return Y.Array.map(raw, function (result) {
                    var mapped = self._mapDataProviderData(result.raw, datasource.map);

                    mapped.title = Y.Highlight.all(mapped.title, query);

                    return template(mapped);
                });
            });
            this.set('resultTextLocator', function (result) {
                return datasource.map && datasource.map.value ? result[datasource.map.value] : result.value;
            });
            this.set('source', this._getDataProviderRoute(datasource.id, datasource.map && datasource.map.title ? datasource.map.title : 'title'));
        } else if (choices) {
            this.set('resultFormatter', function (query, raw) {
                return Y.Array.map(raw, function (result) {
                    return template(result.raw);
                });
            });
            this.set('resultTextLocator', 'value');
            this.set('source', choices);
        }

        // Prevent default node change handler.
        this.get('inputNode').on('change', function (e) {
            // Don't stop propagation for our own `change` event simulation.
            if (e.which !== 0) {
                e.stopPropagation();
            }
        });

        // Store the selection before we fire a change event on the input node.
        this.after('select', function (e) {
            self.set('record', e.result.raw);

            self.get('inputNode').simulate('change');
        });
    },

    _getDataProviderRoute: function (id, key) {
        return Routing.generate('rednose_dataprovider_data_list') + '?id=' + id + '&q={query}&key=' + key + '&callback={callback}';
    },

    _mapDataProviderData: function (data, map) {
        map || (map = {});

        return {
            title   : map.title    ? data[map.title]    : data.title,
            subtitle: map.subtitle ? data[map.subtitle] : data.subtitle,
            image   : map.image    ? data[map.image]    : data.image,
            value   : map.value    ? data[map.value]    : data.value
        };
    }
}, {
    CSS_PREFIX: 'rednose-autocomplete',

    ATTRS: {
        width: {
            value: true
        },

        maxResults: {
            value: 6
        },

        record: {
            value: null
        },

        choices: {
            value: null
        },

        datasource: {
            value: null
        }
    }
});

Y.namespace('Rednose').ControlFormAutoComplete = AutoComplete;
