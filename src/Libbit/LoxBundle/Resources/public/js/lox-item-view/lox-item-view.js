YUI.add('lox-item-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Header subview.
**/
Y.Lox.ItemView = Y.Base.create('itemView', Y.View, [], {

    // View templates
	template: '<div class="libbit-lox-header">' +
                  '<div class="header-top">' +
                      '<div id="breadcrumb" class="pull-left"></div>' +
                      '<form class="pull-right">' +
                          '<div class="btn-group">' +
                              '<button title="{titleUpload}" rel="tooltip" id="lox-upload-button" type="button" class="btn">' +
                                  '<i class="icon-upload"></i>' +
                              '</button>' +
                              '<button title="{titleNewFolder}" rel="tooltip" id="lox-newfolder-button" type="button" class="btn">' +
                                  '<i class="icon-folder-close"></i>' +
                              '</button>' +
                          '</div>' +
                      '</form>' +
                  '</div>' +
                  '<div class="header-bottom">' +
                  '</div>' +
              '</div>',

    headerTemplate: '<table class="table">' +
                         '<thead>' +
                             '<tr>' +
                                 '<th class="span4">{name}</th>' +
                                 '<th class="span2">{size}</th>' +
                                 '<th class="span2">{modified}</th>' +
                             '</tr>' +
                         '<thead>' +
                     '</table>',

    detailsTemplate: '<div class="details">' +
                         '<div class="item-name pull-left">{item}</div>' +
                         '<div class="menu dropdown pull-right">' +
                             '<a href="#" class="dropdown-toggle" data-toggle="dropdown">{menu}</a>' +
                         '</div>' +
                     '</div>',

	/**
	UI delegation events

	@property events
	@type {Object}
	**/
	events: {
        '#lox-upload-link': {
            click: '_handleUpload'
        },

		'#lox-upload-button': {
            click: '_handleUpload'
		},

		'#lox-newfolder-button': {
			click: '_handleCreateFolder'
		}
	},

    // -- Life Cycle Methods ---------------------------------------------------

    initializer: function () {
		var container = this.get('container'),
			item      = this.get('model'),
            strings   = this.get('strings');

		container.setHTML(Y.Lang.sub(this.template, {
            titleUpload   : strings.upload_file,
            titleNewFolder: strings.new_folder
		}));

        container.one('.libbit-lox-header').plug(Y.Plugin.Affix, {
            offset: {
                top: 40
            }
        });

        // Init breadcrumb.
		this.breadcrumbView = new Y.Rednose.Breadcrumb({
			container: container.one('#breadcrumb'),
			path     : item.get('path')
		});

        this.breadcrumbView.addTarget(this);

		this.on('*:navigate', this._handleNavigate);

        this.after('selectionChange', this._afterSelectionChange, this);
	},

	destructor: function () {
        this.breadcrumbView.destroy();

        delete this.breadcrumbView;
	},

    // -- Public Methods -------------------------------------------------------

    /**
     * @chainable
     */
    render: function () {
		this.breadcrumbView.render();

        this._renderHeader();

		return this;
	},

    // -- Protected Methods ----------------------------------------------------

    /**
     * Renders the table header in case no item is selected.
     *
     * @private
     */
    _renderHeader: function () {
        var container = this.get('container'),
            strings   = this.get('strings');

        container.one('.header-bottom').setContent(Y.Lang.sub(this.headerTemplate, {
            name    : strings.name,
            size    : strings.size,
            modified: strings.modified
        }));
    },

    /**
     * Renders the detail pane for a given selected model.
     *
     * @param {Lox.ItemModel} model
     * @private
     */
    _renderDetails: function (model) {
        var container  = this.get('container'),
            anchorNode,
            items;

        container.one('.header-bottom').setContent(Y.Lang.sub(this.detailsTemplate, {
            item: model.get('title'),
            menu: this.get('strings.menu')
        }));

        anchorNode = container.one('a');

        if (model.get('isDir')) {
            if (model.get('isShare')) {
                items = Y.Lox.Item.Menu.share;
            } else if (model.get('isShared')) {
                items = Y.Lox.Item.Menu.shared;
            } else {
                items = Y.Lox.Item.Menu.folder;
            }
        } else {
            items = Y.Lox.Item.Menu.file;
        }

        anchorNode.plug(Y.Rednose.Plugin.Dropdown, {
            items: items
        });

        anchorNode.dropdown.on('select', function (e) {
            // Stop propagation so we don't trigger a deselect on the data table.
            e.stopPropagation();
        });

        anchorNode.dropdown.addTarget(this);
    },

    // -- Protected Event Handlers ---------------------------------------------

	_handleNavigate: function (e) {
		var path = e.data;

		if (path) {
			this.fire('navigateItem', { path: path });
		}
	},

	/**
	@method _handleCreateFolder
    @param {EventFacade} e Event
	@protected
	**/
	_handleUpload: function (e) {
        e.preventDefault();

		this.fire('upload');
	},

	/**
	@method _handleCreateFolder
	@protected
	**/
	_handleCreateFolder: function () {
		var dialog  = new Y.Rednose.Dialog(),
			path    = this.get('model').get('path'),
            strings = this.get('strings'),
			self    = this;

		dialog.prompt({
			title  : strings.create_folder_title,
			text   : strings.create_folder_label,
			confirm: strings.button_create,
			cancel : strings.button_cancel
		}, function (value) {

            Y.io(YUI.Env.routing.operations_create_folder, {
                method: 'POST',
                data: { 'path': path + '/' + value },
                on : {
                    success : function (tx, r) {
                        var data = Y.JSON.parse(r.responseText),
                            item = new Y.Lox.ItemModel();

                        item.setAttrs(item.parse(data));

                        dialog.destroy();

                        self.fire('itemAdded', { data: item });

						Y.Rednose.Notifier.notify({
							title: strings.title_created,
							text : strings.folder_created,
							type : 'success'
						});
                    },
                    failure : function (tx, r) {
                        var err = r.responseText && Y.JSON.parse(r.responseText);

                        if (err.error) {
							dialog.set('error', {
								message: err.error
							});
                        }
                    }
                }
			});
		});
	},

    /**
    @method _afterSelectionChange
    @protected
    **/
    _afterSelectionChange: function (e) {
        var model     = e.newVal,
            container = this.get('container');

        model ? this._renderDetails(model) : this._renderHeader();
    }
}, {
    ATTRS: {
        /**
         * Translation dictionary used by the Lox.Page module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-item-view');
            }
        },

        /**
        The current selection.

        @attribute selection
        @type Lox.ItemModel
        **/
        selection: {
            value: null
        }
    }
});

}, '@VERSION@', {
    "requires": [
        "gallery-affix",
        "lox-app-item-model",
        "rednose-app",
        "rednose-breadcrumb",
        "rednose-dialog",
        "rednose-dropdown-plugin",
        "rednose-notifier",
        "view"
    ],
    "lang": [
        "en"
    ]
});


