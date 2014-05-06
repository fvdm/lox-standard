YUI.add('lox-item-menu', function (Y, NAME) {

/*jshint expr:true, onevar:false */

var strings = Y.Intl.get('lox-item-menu');

Y.namespace('Lox.Item').Menu = {
   share: [
        { title: strings.leave_share, icon: 'icon-share',              id: 'leave'},
        { title: strings.delete,      icon: 'icon-remove-circle',      id: 'delete'},
        { title: strings.rename,      icon: 'icon-edit',               id: 'rename' },
        { title: strings.move,        icon: 'icon-circle-arrow-right', id: 'move' },
        { title: strings.copy,        icon: 'icon-check',              id: 'copy' }
    ],

    shared: [
        { title: strings.share_settings, icon: 'icon-share',              id: 'share'},
        { title: strings.delete,         icon: 'icon-remove-circle',      id: 'delete'},
        { title: strings.rename,         icon: 'icon-edit',               id: 'rename' },
        { title: strings.move,           icon: 'icon-circle-arrow-right', id: 'move' },
        { title: strings.copy,           icon: 'icon-check',              id: 'copy' }
    ],

    folder: [
        { title: strings.share,  icon: 'icon-share',              id: 'share'},
        { title: strings.delete, icon: 'icon-remove-circle',      id: 'delete'},
        { title: strings.rename, icon: 'icon-edit',               id: 'rename' },
        { title: strings.move,   icon: 'icon-circle-arrow-right', id: 'move' },
        { title: strings.copy,   icon: 'icon-check',              id: 'copy' }
    ],

    file: [
        { title: strings.link,     icon: 'icon-globe',              id: 'link'},
        { title: strings.download, icon: 'icon-download',           id: 'download' },
        { title: strings.delete,   icon: 'icon-remove-circle',      id: 'delete'},
        { title: strings.rename,   icon: 'icon-edit',               id: 'rename' },
        { title: strings.move,     icon: 'icon-circle-arrow-right', id: 'move' },
        { title: strings.copy,     icon: 'icon-check',              id: 'copy' }
    ]
};

}, '@VERSION@', {
    "lang": [
        "en"
    ]
});
