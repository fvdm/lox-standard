YUI.add('rednose-dataprovider', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

var TreeModel = Y.Rednose.ModelTree,
    DataSource,
    PdoSource,
    XmlSource,
    DataSourceList;

DataSourceAttribute = Y.Base.create('dataSourceAttribute', Y.Model, [], {}, {
    ATTRS: {
        source: { value: null },
        name  : { value: null }
    }
});

DataSourceAttributeCollection = Y.Base.create('dataSourceAttributeCollection', Y.Model, [], {}, {
    ATTRS: {
        source    : { value: null },
        name      : { value: null },
        attributes: { value: [] }
    }
});

DataSource = Y.Base.create('dataSource', Y.Model, [], {
    sync: function (action, options, callback) {
        switch (action) {
            case 'create':
                Y.io(Routing.generate('rednose_dataprovider_post_data_sources'), {
                    method: 'POST',
                    data: Y.JSON.stringify(this.toJSON()),
                    on : {
                        success : function (tx, r) {
                            callback(null, r.responseText);
                        },
                        failure: function (tx, r) {
                            callback(Y.JSON.parse(r.responseText));
                        }
                    }
                });

            break;
        }
    },

    _setAttributes: function (attributes) {
        var self   = this,
            parsed = [];

        if (Y.Lang.isArray(attributes)) {
            Y.Array.each(attributes, function (attribute) {
                parsed.push(new DataSourceAttribute({
                    source: self,
                    name  : attribute
                }));
            });
        } else {
            Y.Object.each(attributes, function (subAttributes, key) {
                var collection = [];

                Y.Array.each(subAttributes, function (attribute) {
                    collection.push(new DataSourceAttribute({
                        source: self,
                        name  : attribute
                    }));
                });

                parsed.push(new DataSourceAttributeCollection({
                    source    : self,
                    name      : key,
                    attributes: collection
                }));

                parsed.push(collection);
            });
        }

        return parsed;
    }
}, {
    ATTRS: {
        name      : { value: null },
        identifier: { value: null },
        type      : { value: 'pdo' },
        attributes: { value: [], setter: '_setAttributes', lazyAdd: false }
    }
});

DatagenSource = Y.Base.create('datagenSource', DataSource, [], {}, {
    ATTRS: {
        url     : { value: null },
        username: { value: null },
        password: { value: null },
        section : { value: null }
    }
});

PdoSource = Y.Base.create('pdoSource', DataSource, [], {}, {
    ATTRS: {
        dsn     : { value: null },
        username: { value: null },
        password: { value: null },
        table   : { value: null },
        query   : { value: null },
        source  : { value: 'table' }
    }
});

XmlSource = Y.Base.create('xmlSource', DataSource, [], {}, {
    ATTRS: {
        xsd : { value: null },
        xslt: { value: null },
        xml : { value: null },
        root: { value: null }
    }
});

DataSourceList = Y.Base.create('dataSourceList', Y.ModelList, [], {
    model: DataSource,

    getTree: function () {
        var items = [];

        this.each(function (model) {
            var node = {
                label   : model.get('name'),
                data    : model,
                children: []
            };

            Y.Array.each(model.get('attributes'), function (attribute) {
                if (attribute instanceof DataSourceAttribute) {
                    node.children.push({
                        label: attribute.get('name'),
                        data : attribute
                    });
                } else if (attribute instanceof DataSourceAttributeCollection) {
                    var collection = {
                        label   : attribute.get('name'),
                        data    : attribute,
                        children: []
                    };

                    Y.Array.each(attribute.get('attributes'), function (subAttribute) {
                        if (subAttribute instanceof DataSourceAttribute) {
                            collection.children.push({
                                label: subAttribute.get('name'),
                                data : subAttribute
                            });
                        }
                    });

                    node.children.push(collection);
                }
            });

            items.push(node);
        });

        return new TreeModel({
            items: items,
            icons: {
                'datagenSource'                : 'icon-list-alt',
                'pdoSource'                    : 'icon-align-justify',
                'xmlSource'                    : 'icon-file',
                'dataSourceAttribute'          : 'icon-minus',
                'dataSourceAttributeCollection': 'icon-th-list'
            }
        });
    },

    parse: function (response) {
        var items = [];

        Y.Array.each(Y.JSON.parse(response), function (item) {
            switch (item.type) {
                case 'dataGen':
                    items.push(new DatagenSource(item));
                    break;
                case 'pdo':
                    items.push(new PdoSource(item));
                    break;
                case 'xml':
                    items.push(new XmlSource(item));
                    break;
            }
        });

        return items;
    },

    sync: function (action, options, callback) {
        if (action === 'read') {
            Y.io(Routing.generate('rednose_dataprovider_data_sources'), {
                method: 'GET',
                on : {
                    success : function (tx, r) {
                        callback(null, r.responseText);
                    },
                    failure: function (tx, r) {
                        callback(Y.JSON.parse(r.responseText));
                    }
                }
            });
        }
    }
});

Y.namespace('Rednose.DataSource').DataSource          = DataSource;
Y.namespace('Rednose.DataSource').DataSourceAttribute = DataSourceAttribute;
Y.namespace('Rednose.DataSource').DatagenSource       = DatagenSource;
Y.namespace('Rednose.DataSource').PdoSource           = PdoSource;
Y.namespace('Rednose.DataSource').XmlSource           = XmlSource;
Y.namespace('Rednose.DataSource').DataSourceList      = DataSourceList;
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


}, '1.1.0-DEV', {
    "requires": [
        "autocomplete",
        "autocomplete-filters",
        "autocomplete-highlighters",
        "base",
        "json",
        "model",
        "model-list",
        "rednose-treeview",
        "widget"
    ],
    "skinnable": true
});
