/*jshint boss:true, expr:true, onevar:false */

var TXT_NAVBAR_CAPTION = 'Form Designer';

var ConfigureDynamicItemsView = Y.Rednose.FormDesigner.ConfigureDynamicItemsView,
    DataSourceManager         = Y.Rednose.DataSourceManager.DataSourceManager,
    Panel                     = Y.Rednose.Panel,
    FormDesigner;

FormDesigner = Y.Base.create('formDesigner', Y.App, [ Y.Rednose.Template.ThreeColumn ], {
    views: {
        form: {
            type: Y.Rednose.FormDesigner.FormView
        }
    },

    _navbar: null,

    _objectLibrary       : null,
    _hierarchyView       : null,
    _objectAttributesView: null,
    _dataSourcesView     : null,

    initializer: function () {
        this._objectLibrary        = new Y.Rednose.FormDesigner.ObjectLibrary();
        this._hierarchyView        = new Y.Rednose.FormDesigner.HierarchyView();
        this._objectAttributesView = new Y.Rednose.FormDesigner.ObjectAttributesView();
        this._dataSourcesView      = new Y.Rednose.FormDesigner.DataSourcesView();

        this._objectLibrary.addTarget(this);
        this._hierarchyView.addTarget(this);
        this._objectAttributesView.addTarget(this);
        this._dataSourcesView.addTarget(this);

        this.after('hierarchyView:select', this._handleControlSelect, this);

        this.after('objectLibrary:objectAdd', this._handleObjectAdd, this);

        this.after('objectAttributesView:typeChange', this._handleObjectTypeChange, this);
        this.after('objectAttributesView:configureItems', this._handleConfigureItems, this);
        this.after('objectAttributesView:configureDynamicItems', this._handleConfigureDynamicItems, this);

        this._initNavbar();

        this.on('navbar:preview', this._handlePreview, this);
        this.on('navbar:save', this._handleSave, this);
        this.on('navbar:newDataSource', this._handleNewDataSource, this);
        this.on('navbar:closeDesigner', this._handleClose, this);

        this.on('contextMenu:removeControl', this._handleRemoveControl, this);
        this.on('contextMenu:dataSourceEdit', this._handleDataSourceEdit, this);
        this.on('contextMenu:dataSourceDelete', this._handleDataSourceDelete, this);

        if (this.hasRoute(this.getPath())) {
            this.dispatch();
        }
    },

    destructor: function () {
        if (this.get('activeView')) {
            this.get('activeView').destroy();
        }

        this._navbar.destroy();
        this._navbar = null;

        this._objectLibrary.destroy();
        this._objectLibrary = null;

        this._hierarchyView.destroy();
        this._hierarchyView = null;

        this._dataSourcesView.destroy();
        this._dataSourcesView = null;

        this._objectAttributesView.destroy();
        this._objectAttributesView = null;
    },

    render: function () {
        // We always need to call the parent's class `render` function first for the `App` object to function.
        FormDesigner.superclass.render.apply(this, arguments);

        this.get('container').addClass('rednose-form-designer');

        this._navbar.render(this.get('container'));

        this._objectLibrary.render(this._navbar, 'insert');

        this.get('gridLeft').append(this._hierarchyView.render().get('container'));
        this.get('gridLeft').append(this._dataSourcesView.render().get('container'));
        this.get('gridRight').append(this._objectAttributesView.render().get('container'));

        // If the model contains controls render the form view
        if (this.get('model').get('controls').size() > 0) {
            this.showForm();
        }

        return this;
    },

    _initNavbar: function () {
        this._navbar = new Y.Rednose.Navbar({
            title        : TXT_NAVBAR_CAPTION,
            columnLayout : true,
            menu         : [
                { title: 'File', items: [
                    { id: 'newDataSource', title: 'New Data Source...' },
                    { title: '-' },
                    { id: 'preview', title: 'Preview' },
                    { id: 'save', title: 'Save' },
                    { title: '-' },
                    { id: 'closeDesigner', title: 'Close' }
                ]}, {
                    id: 'insert', title: 'Insert'
                }
            ],
            menuSecondary: [
                { title: YUI.Env.user.name, icon: 'icon-user', items: [
                    {
                        url  : Routing.generate('_security_logout'),
                        title: 'Sign out'
                    }
                ]}
            ]
        });

        this._navbar.addTarget(this);
        this.set('navbar', this._navbar);
    },

    handleForm: function (req, res, next) {
        var id   = req.params.form,
            form = this.get('model'),
            self = this;

        if (id === form.get('id') && !form.isNew()) {
            req.form = form;
            next();
        } else {
            form = new Y.Rednose.Form.FormModel({id: id});

            form.load(function () {
                self.set('model', form);
                req.form = form;
                next();
            });
        }
    },

    showForm: function (req, res) {
        if (this.get('activeView')) {
            this.get('activeView').destroy();
        }

        if (!req) {
            req = { form: this.get('model') };
            res = { transition: false };
        }

        this.showView('form', {
            model: req.form
        }, {
            // Overrides the default transition with the preferred one, if set.
            transition: res.transition
        });

        this._hierarchyView.set('model', req.form);
        this._hierarchyView.render();
    },

    _handleControlSelect: function (e) {
        var model  = e.model;

        if (model && model instanceof Y.Rednose.Form.ControlModel) {
            if (model.view instanceof Y.Rednose.Form.BaseControlView) {
                model.view.focus();
            }
        }

        this._objectAttributesView.set('model', model);
        this._objectAttributesView.render();
    },

    _handleRemoveControl: function(e) {
        var self = this,
            model = e.data,
            dialog = new Y.Rednose.Dialog();

        dialog.confirm({
            title: 'Remove control: ' + model.get('caption') + '?',
            text: 'Are you sure you want to remove the control' + model.get('caption') + ' connected data may possibly be lost!',
            type: 'warning',
            confirm: 'DELETE'
        }, function() {
            self.get('model').get('controls').remove(model);

            self.showForm();
            self._handleControlSelect({
                model: self._objectAttributesView.get('model')
            });
        });
    },

    _handleObjectTypeChange: function() {
        this.showForm();
        this._handleControlSelect({
            model: this._objectAttributesView.get('model')
        });
    },

    _handleConfigureItems: function (e) {
        var dialog = new Y.Rednose.FormDesigner.ConfigureItems({
            model: e.model
        });

        dialog.render();
    },

    /**
    Shows a modal view where the items for this collection can be configured
    dynamically, by specifying a mapping to data source attributes.

    @method _handleConfigureDynamicItems
    @param {EventFacade} e Event containing the control model.
    @protected
    **/
    _handleConfigureDynamicItems: function (e) {
        var model = e.model;

        if (!model) {
            return;
        }

        var dataSourceList = this._dataSourcesView.get('modelList'),
            view,
            panel;

        view = new ConfigureDynamicItemsView({
            model         : model,
            dataSourceList: dataSourceList
        }).render();

        panel = new Panel({
            srcNode: view.get('container'),
            width  : 500
        }).render();

        view.on(['close', 'ok'], function () {
            view.destroy();
            panel.destroy();
        });
    },

    _handleObjectAdd: function (e) {
        var self = this;
        var dialog = new Y.Rednose.FormDesigner.ObjectLibraryView({
            model: this.get('model'),
            item: e.item
        });

        dialog.on('destroy', function() {
            self.showForm();
        });

        dialog.render();
    },

    /**
    Saves the current form.

    @method _handleSave
    @protected
    **/
    _handleSave: function () {
        var form = this.get('model');

        console.log(Y.JSON.stringify(form.toJSON()));
    },

    /**
    Shows a preview of the current (saved) form.

    @method _handlePreview
    @protected
    **/
    _handlePreview: function () {
        var form = this.get('model');

        window.open(Routing.generate('rednose_framework_forms_preview', { id: form.get('id') }), '_blank');
    },

    // XXX
    _handleNewDataSource: function () {
        var dataSourceManagerView = new DataSourceManager(),
            self                  = this;

        dataSourceManagerView.render();
        dataSourceManagerView.showChoicePage();

        var dataSourceManagerPanel = new Y.Rednose.Panel({
            srcNode: dataSourceManagerView.get('container'),
            width  : 640
        });

        dataSourceManagerPanel.render();

        dataSourceManagerView.on('close', function () {
            dataSourceManagerView.destroy();
            dataSourceManagerPanel.destroy();
        });

        dataSourceManagerView.on('create', function (e) {
            var model = e.model;

            model.save(function () {
                dataSourceManagerView.destroy();
                dataSourceManagerPanel.destroy();

                self._dataSourcesView.render();
            });
        });
    },

    // XXX
    _handleDataSourceEdit: function (e) {
        var model = e.data;

        var dataSourceManagerView = new DataSourceManager({ model: model }),
            self                  = this;

        dataSourceManagerView.render();
        dataSourceManagerView.showChoicePage();

        var dataSourceManagerPanel = new Y.Rednose.Panel({
            srcNode: dataSourceManagerView.get('container'),
            width  : 640
        });

        dataSourceManagerPanel.render();

        dataSourceManagerView.on('close', function () {
            dataSourceManagerView.destroy();
            dataSourceManagerPanel.destroy();
        });

        dataSourceManagerView.on('create', function (e) {
            var model = e.model;

            model.save(function () {
                dataSourceManagerView.destroy();
                dataSourceManagerPanel.destroy();

                self._dataSourcesView.render();
            });
        });
    },

    _handleClose: function() {
        this.destroy();
    },

    // XXX
    _handleDataSourceDelete: function (e) {
        console.log(e);
    }
}, {
    ATTRS: {
        model: { value: new Y.Rednose.Form.FormModel() },

        navbar: { value: null },

        routes: {
            value: [{
                path: '/:form/edit', callbacks: [
                    'handleForm',
                    'showForm'
                ]}
            ]
        }
    }
});



// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.FormDesigner').FormDesigner = FormDesigner;
