YUI.add('lox-item-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/**
Header subview.
**/
Y.Lox.ItemView = Y.Base.create('itemView', Y.View, [], {
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
                      '<table class="table">' +
                          '<thead>' +
                              '<tr>' +
                                  '<th class="span4">{name}</th>' +
                                  '<th class="span2">{size}</th>' +
                                  '<th class="span2">{modified}</th>' +
                              '</tr>' +
                          '<thead>' +
                      '</table>' +
                      '<div class="details" style="display: none;">' +
                          '<div class="item-name pull-left"></div>' +
                          '<div class="menu dropdown pull-right">' +
                              '<a href="#" class="dropdown-toggle" data-toggle="dropdown">{menu} <b class="caret"></b></a>' +
                              '<ul class="dropdown-menu"></ul>' +
                          '</div>' +
                      '</div>' +
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

	initializer: function () {
		var container = this.get('container'),
			item      = this.get('model'),
            strings   = this.get('strings');

		container.setHTML(Y.Lang.sub(this.template, {
			name          : strings.name,
			size          : strings.size,
			modified      : strings.modified,
			titleUpload   : strings.upload_file,
			titleNewFolder: strings.new_folder,
            menu          : strings.menu
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

        // Init dropdown.
        var dropdown = container.one('.menu');

        dropdown.on('click', function (e) {
            // Stop propagation so we don't trigger a deselect on the datatable.
            e.stopImmediatePropagation();
        });
	},

	destructor: function () {
        this.breadcrumbView.destroy();

        delete this.breadcrumbView;
	},

	render: function () {
		this.breadcrumbView.render();

		return this;
	},

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

        if (model !== null) {
            var dropdown = container.one('.menu'),
                navBar   = new Y.Rednose.Navbar(),
                content  = null;

            container.one('.item-name').setContent(model.get('title'));

            dropdown.one('ul').empty();

            navBar.addTarget(this);

            if (model.get('isDir')) {
                if (model.get('isShare')) {
                    content = Y.Lox.Item.Menu.share;
                } else if (model.get('isShared')) {
                    content = Y.Lox.Item.Menu.shared;
                } else {
                    content = Y.Lox.Item.Menu.folder;
                }
            } else {
                content = Y.Lox.Item.Menu.file;
            }

            navBar.createDropdown(dropdown, content);

            container.one('.table').hide();
            container.one('.details').show();
        } else {
            container.one('.details').hide();
            container.one('.table').show();
        }
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
        "rednose-navbar",
        "rednose-notifier",
        "view"
    ],
    "lang": [
        "en"
    ]
});


