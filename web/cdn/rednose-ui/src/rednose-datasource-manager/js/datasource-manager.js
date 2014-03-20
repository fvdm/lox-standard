/*jshint boss:true, expr:true, onevar:false */

var App = Y.Base.create('app', Y.App, [], {
    views: {
        choicePage: {
            type    : ChoicePageView,
            preserve: false
        },

        pdoGenericPage: {
            type    : PdoGenericPageView,
            parent  : 'choicePage',
            preserve: false
        },

        pdoSourcePage: {
            type    : PdoSourcePageView,
            parent  : 'pdoGenericPage',
            preserve: false
        },

        dataGenGenericPage: {
            type    : DataGenGenericPageView,
            parent  : 'choicePage',
            preserve: false
        },

        dataGenSourcePage: {
            type    : DataGenSourcePageView,
            parent  : 'dataGenGenericPage',
            preserve: false
        },

        xmlPage: {
            type    : XMLPageView,
            parent  : 'choicePage',
            preserve: false
        }
    }
});

var TXT_NEW_DATA_SOURCE = 'New Data Source',
    TXT_NEXT            = 'Next',
    TXT_BACK            = 'Back',
    TXT_CANCEL          = 'Cancel',
    TXT_CREATE          = 'Create';

var DataSource    = Y.Rednose.DataSource.DataSource,
    DatagenSource = Y.Rednose.DataSource.DatagenSource,
    PdoSource     = Y.Rednose.DataSource.PdoSource,
    XmlSource     = Y.Rednose.DataSource.XmlSource;

var DataSourceManager = Y.Base.create('dataSourceManager', Y.View, [ Y.Rednose.View.Nav ], {
    _app: null,

    title: TXT_NEW_DATA_SOURCE,

    close: true,

    initializer: function () {
        this.on('dataSourceManager:buttonChoice', this.showChoicePage, this);
        this.on('dataSourceManager:buttonChoose', this._handleButtonChoose, this);
        this.on('dataSourceManager:buttonPdoGeneric', this.showPdoGenericPage, this);
        this.on('dataSourceManager:buttonPdoSource', this.showPdoSourcePage, this);
        this.on('dataSourceManager:buttonDataGenGeneric', this.showDataGenGenericPage, this);
        this.on('dataSourceManager:buttonDataGenSource', this.showDataGenSourcePage, this);
        this.on('dataSourceManager:buttonClose', this._handleButtonClose, this);
        this.on('dataSourceManager:buttonCreate', this._handleButtonCreate, this);
    },

    render: function () {
        var container = this.get('container');

        this._app = new App({
            container  : container,
            transitions: true
        }).render();

        return this;
    },

    showChoicePage: function () {
        var view    = this._app.get('activeView'),
            options = view ? {} : { transition: false },
            model;

        view && this.set('model', view.get('model'));

        model = this.get('model');

        this._app.showView('choicePage', { model: model }, options);

        this._updateButtons({
            choose: {
                value:    TXT_NEXT,
                position: 'right',
                primary:   true
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    showPdoGenericPage: function () {
        var model = this._app.get('activeView').get('model');

        this.set('model', model);

        this._app.showView('pdoGenericPage', {
            model: model
        });

        this._updateButtons({
            pdoSource: {
                value:    TXT_NEXT,
                position: 'right',
                primary:   true
            },

            choice: {
                value:    TXT_BACK,
                position: 'right'
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    showPdoSourcePage: function () {
        var model = this._app.get('activeView').get('model');

        this.set('model', model);

        this._app.showView('pdoSourcePage', {
            model: model
        });

        this._updateButtons({
            create: {
                value:    TXT_CREATE,
                position: 'right',
                primary:   true
            },

            pdoGeneric: {
                value:    TXT_BACK,
                position: 'right'
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    showDataGenGenericPage: function () {
        var model = this._app.get('activeView').get('model');

        this.set('model', model);

        this._app.showView('dataGenGenericPage', {
            model: model
        });

        this._updateButtons({
            dataGenSource: {
                value:    TXT_NEXT,
                position: 'right',
                primary:   true
            },

            choice: {
                value:    TXT_BACK,
                position: 'right'
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    showDataGenSourcePage: function () {
        var model = this._app.get('activeView').get('model');

        this.set('model', model);

        this._app.showView('dataGenSourcePage', {
            model: model
        });

        this._updateButtons({
            create: {
                value:    TXT_CREATE,
                position: 'right',
                primary:   true
            },

            dataGenGeneric: {
                value:    TXT_BACK,
                position: 'right'
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    showXMLPage: function () {
        var model = this._app.get('activeView').get('model');

        this.set('model', model);

        this._app.showView('xmlPage', {
            model: model
        });

        this._updateButtons({
            create: {
                value:    TXT_CREATE,
                position: 'right',
                primary:   true
            },

            choice: {
                value:    TXT_BACK,
                position: 'right'
            },

            close: {
                value:    TXT_CANCEL,
                position: 'left'
            }
        });
    },

    _updateButtons: function (buttons) {
        this.buttons = {};

        this.set('buttons', buttons);
    },

    _handleButtonChoose: function () {
        var choiceView = this._app.get('activeView'),
            model      = choiceView.get('model'),
            baseAttrs  = ['id', 'identifier', 'name', 'type'];

        switch (model.get('type')) {
            case 'dataGen':
                model instanceof DatagenSource || (model = new DatagenSource(model.getAttrs(baseAttrs)));

                choiceView.set('model', model);

                this.showDataGenGenericPage();
                break;
            case 'pdo':
                model instanceof PdoSource || (model = new PdoSource(model.getAttrs(baseAttrs)));

                choiceView.set('model', model);

                this.showPdoGenericPage();
                break;
            case 'xml':
                model instanceof XmlSource || (model = new XmlSource(model.getAttrs(baseAttrs)));

                choiceView.set('model', model);

                this.showXMLPage();
                break;
        }
    },

    // XXX
    _handleButtonClose: function () {
        this.fire('close');
    },

    // XXX
    _handleButtonCreate: function () {
        var model = this._app.get('activeView').get('model');

        this.fire('create', { model: model });
    }
}, {
    ATTRS: {
        model: { value: new DataSource() }
    }
});

Y.namespace('Rednose.DataSourceManager').DataSourceManager = DataSourceManager;
