YUI.add('lox-app-file-browser-view', function (Y, NAME) {

/*jshint expr:true, onevar:false */

/** Provides the filebrowser view.

@module lox-app
@submodule lox-app-file-browser-view
**/

/**
Provides the filebrowser view.

@class FileBrowserView
@param {Object} [config] Config properties.
	@param {Object} [config.container] The container the view will be rendered in.
@namespace Lox.App
@constructor
@extends View
**/
var FileBrowserView = Y.Base.create('fileBrowserView', Y.View, [], {
    templates: {
        welcome:
            '<p class="text-center"><strong>{welcome_title}</strong></p>' +
            '<p class="text-center">{welcome_body}</p>' +
            '<p class="text-center"><a id="lox-upload-link" href="#">{welcome_subtitle_upload}</a> {welcome_subtitle_body}</p>'
    },

	// -- Lifecycle Methods ----------------------------------------------------

	/**
	@method initializer
	@protected
	**/
	initializer: function () {
        this._fileBrowserViewEvents || (this._fileBrowserViewEvents = []);

        var item     = this.get('model'),
            children = this.get('modelList');

        this.itemView     = new Y.Lox.ItemView({ model: item });
        this.itemListView = new Y.Lox.ItemListView({ modelList: children });

        this.itemView.addTarget(this);
        this.itemListView.addTarget(this);

        this._fileBrowserViewEvents.push(
            this.on({
                '*:link'    : this._handleCreateLink,
                '*:download': this._handleDownload,
                '*:delete'  : this._handleDelete,
                '*:rename'  : this._handleRename,

                '*:leave': this._prepEvent,
                '*:share': this._prepEvent,
                '*:move' : this._prepEvent,
                '*:copy' : this._prepEvent,

                '*:itemAdded': this._handleItemAdded,
                '*:select'   : this._handleSelect
            }),

            children.after(['add', 'reset', 'remove'], this._checkCount, this)
        );
	},

	/**
	@method destructor
	@protected
	**/
	destructor: function () {
        (new Y.EventHandle(this._fileBrowserViewEvents)).detach();

        this.itemView.destroy();
        this.itemListView.destroy();

        delete this.itemView;
        delete this.itemListView;
	},

	// -- Public Methods -------------------------------------------------------

	/**
	Renders this DialogView into its container, encapsulated in a modal panel.

	@method render
	@chainable
	**/
	render: function () {
		var container = this.get('container'),
			content   = Y.one(Y.config.doc.createDocumentFragment());

        content.append(this.itemView.render().get('container'));
        content.append(this.itemListView.render().get('container'));

        container.setHTML(content);

        this._checkCount();

        return this;
	},

    // -- Protected Event Handlers ----------------------------------------------

    _checkCount: function () {
        var container = this.get('container'),
            list      = this.get('modelList'),
            model     = this.get('model'),
            strings   = this.get('strings');

        if (list.get('items').length === 0) {
            var message = Y.Lang.sub('<h4>{empty}</h4>', { empty: strings.folder_empty });

            if (model.get('path') === '/') {
                message = Y.Lang.sub(this.templates.welcome, {
                    welcome_title          : strings.welcome_title,
                    welcome_body           : strings.welcome_body,
                    welcome_subtitle_upload: strings.welcome_subtitle_upload,
                    welcome_subtitle_body  : strings.welcome_subtitle_body
                });
            }

            container.one('.table').append(
                '<tbody class="table-message">' +
                    '<tr>' +
                        '<td colspan="3">' + message + '</td>' +
                    '</tr>' +
                '</tbody>'
            );
        } else {
            container.all('tbody.table-message').remove();
        }
    },

    /**
    @method _handleSelect
    @param {EventFacade} e Event
    @protected
    **/
    _handleSelect: function (e) {
        var model = e.model;

        this.itemView.set('selection', model);
    },

    /**
    @method _handleItemAdded
    @param {EventFacade} e Event
    @protected
    **/
    _handleItemAdded: function (e) {
        var item = e.data;

        this.itemListView.get('modelList').add(item);
    },

    /**
    @method _handleCreateLink
    @param {EventFacade} e Event
    @protected
    **/
    _handleCreateLink: function (e) {
        var item = e.data || this.itemView.get('selection');

        if (item) {
            Y.config.win.open(YUI.Env.routing.link_create + item.get('path'), '_blank');
        }
    },

    /**
    @method _handleDownload
    @param {EventFacade} e Event
    @protected
    **/
    _handleDownload: function (e) {
        var item = e.data || this.itemView.get('selection');

        if (item) {
            Y.config.win.location = YUI.Env.routing.item + item.get('path') + '?download=1';
        }
    },

    /**
    @method _handleDelete
    @param {EventFacade} e Event
    @protected
    **/
    _handleDelete: function (e) {
        var item    = e.data || this.itemView.get('selection'),
            strings = this.get('strings');

        if (item) {
            Y.Rednose.Dialog.confirm({
                title  : Y.Lang.sub(strings.delete_title, { item: item.get('title') }),
                text   : strings.delete_body,
                confirm: strings.delete,
                type   : 'danger'
            }, function () {
                item.destroy({remove: true}, function (err) {
                    if (err) {
                        Y.Rednose.Notifier.notify({
                            title: strings.title_error,
                            text : err.error || '',
                            type : 'error'
                        });
                    } else {
                        Y.Rednose.Notifier.notify({
                            title: strings.title_deleted,
                            text : strings.item_deleted,
                            type : 'success'
                        });
                    }
                });
            });
        }
    },

    /**
    @method _handleRename
    @param {EventFacade} e Event
    @protected
    **/
    _handleRename: function (e) {
        var item    = e.data || this.itemView.get('selection'),
            dialog  = new Y.Rednose.Dialog(),
            strings = this.get('strings'),
            self    = this;

        dialog.prompt({
            title  : Y.Lang.sub(strings.rename_title, { item: item.get('title') }),
            text   : strings.rename_label,
            confirm: strings.rename,
            value  : item.get('title')
        }, function (value) {
            var fromPath = item.get('path'),
                toPath   = item.getBase() + '/' + value;

            Y.io(YUI.Env.routing.operations_move, {
                method: 'POST',
                data: { 'from_path': fromPath, 'to_path': toPath },
                on : {
                    success : function () {
                        dialog.destroy();
                        self.fire('reload');

                        Y.Rednose.Notifier.notify({
                            title: strings.title_renamed,
                            text : strings.item_renamed,
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

    _prepEvent: function (e) {
        e.data || (e.data = this.itemView.get('selection'));
    }
},{
    ATTRS: {
        /**
         * Translation dictionary used by the Lox.App.FileBrowserView module.
         *
         * @attribute strings
         * @type Object
         */
        strings: {
            valueFn: function () {
                return Y.Intl.get('lox-app-file-browser-view');
            }
        }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Lox.App').FileBrowserView = FileBrowserView;

}, '@VERSION@', {
    "requires": [
        "lox-item-view",
        "lox-item-list-view",
        "rednose-dialog",
        "rednose-notifier",
        "view"
    ],
    "lang": [
        "en"
    ]
});
