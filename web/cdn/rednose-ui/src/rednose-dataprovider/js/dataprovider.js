var DataProvider;

DataProvider = Y.Base.create('dataProvider', Y.Widget, [], {
    ac: null,

    template:
        '<div class="dataprovider-form">' +
            '<div class="input-append">' +
                '<input type="text" class="dataprovider-search" placeholder="{placeholder}" />' +
                '<button class="btn btn dataprovider-button" type="button">{caption}</button>' +
            '</div>' +
            '<div class="ac"></div>' +
        '</div>',

    formatterTemplate:
            '<div class="entry">' +
                '<div class="hd">' +
                    '<img src="{img}" class="photo" />' +
                '</div>' +
                '<div class="bd">' +
                    '<div class="autocomplete-title">{title}</div>' +
                    '<div class="autocomplete-subtitle">{subtitle}</div>' +
                '</div>' +
            '</div>',

    initializer: function() {
        var self          = this,
            container     = this.get('contentBox'),
            route         = 'rednose_dataprovider_data_list',
            id            = this.get('dataProviderId'),
            parameterBag  = this.get('parameterBag'),
            placeHolder   = this.get('placeholder'),
            buttonCaption = this.get('buttonCaption');

        var defaultFormatter = function(query, raw) {
            return Y.Array.map(raw, function (result) {
                return Y.Lang.sub(
                    self.formatterTemplate,
                    {
                        img     : result.raw.img,
                        title   : result.highlighted,
                        subtitle: result.raw.subtitle
                    }
                );
            });
        };

        container.append(Y.Lang.sub(this.template, { placeholder: placeHolder, caption: buttonCaption }));
        container.one('.dataprovider-button').on('click', function(e) {
            self._handleComboButton(e);
        });

        route =
            Routing.generate(route) + '?id=' + id +
            '&parameterbag=' + Y.JSON.stringify(parameterBag) +
            '&q={query}&callback={callback}';

        this.ac = new Y.AutoCompleteList({
            inputNode        : container.one('.dataprovider-search'),
            resultFormatter  : defaultFormatter,
            minQueryLength   : 0,
            maxResults       : 0,
            resultHighlighter: 'phraseMatch',
            resultListLocator: 'results',
            resultTextLocator: this.get('display_handle'),
            source           : route,
            render           : container.one('.ac')
        });

        this.ac.after('select', function (e) {
            self.fire('selected', e.result);
        });

        this.ac.on(
            "query",
            function (e) {
                container.one('.dataprovider-button').addClass('dataprovider-spinner');
                container.one('.dataprovider-button').setHTML('&nbsp;');
            }
        );

        this.ac.after(
            "results",
            function (e) {
                container.one('.dataprovider-button').removeClass('dataprovider-spinner');
                container.one('.dataprovider-button').setHTML(self.get('buttonCaption'));
            }
        );
    },

    _handleComboButton: function (e) {
        var ac = this.ac;

        e.stopPropagation();

        if (ac.get('visible')) {
            ac.hide();
        } else {
            if (ac.get('results').length === 0) {
                ac.fire('query');
            }

            ac.sendRequest();
            ac.show();
        }
    },
}, {
    ATTRS: {
        placeholder: { value: 'Type here to search…' },
        buttonCaption: { value: '…' },
        parameterBag: { value: {} },
        dataProviderId: { value: 'unknown.id' },
        display_handle: { value: 'display_name' },
    }
});

Y.namespace('Rednose').DataProvider = DataProvider;
