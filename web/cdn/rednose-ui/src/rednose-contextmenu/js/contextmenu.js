/*jshint boss:true, expr:true, onevar:false */

/**
Provides a context menu plugin with custom event binding.

@module renodse-contextmenu
**/
var ContextMenu,

    CSS_CONTEXT_MENU = 'rednose-context-menu',
    CSS_CONTEXT_OPEN = 'rednose-context-open';

    CSS_BOOTSTRAP_ICON_WHITE    = 'icon-white',
    CSS_BOOTSTRAP_DROPDOWN      = 'dropdown',
    CSS_BOOTSTRAP_DROPDOWN_MENU = 'dropdown-menu',
    CSS_BOOTSTRAP_OPEN          = 'open';

/**
Provides a context menu plugin with custom event binding.

@class ContextMenu
@namespace Rednose
@param {Object} [config] Config properties.
    @param {Object} [config.content] Contextmenu configuration object.
    @param {Oject} [config.data] Optional object to pass with fired events.
    @param {Object} [config.bubbleTarget] Optional bubble target.
@constructor
@extends Plugin.Base
**/
ContextMenu = Y.Base.create('contextMenu', Y.Plugin.Base, [], {
    // -- Public Properties ----------------------------------------------------

    /**
     * Optional data object, to pass with the event
     */
     data: null,

    // -- Protected Properties -------------------------------------------------

    /**
     * State variable, holds a possible active instance.
     */
    _contextMenu: null,

    // -- Lifecycle Methods ----------------------------------------------------

    /**
     * Initializer, gets called upon instance initiation.
     */
    initializer: function (config) {
        var node         = config.host,
            content      = config.content ? config.content : '',
            bubbleTarget = config.bubbleTarget;

        this._node = node;
        this._content = this._buildHTML(content);

        if (bubbleTarget) {
            this.addTarget(bubbleTarget);
        }

        if (typeof config.data !== 'undefined') {
            this.data = config.data;
        }

        node.on('contextmenu', this._handleContextMenu, this);
    },

    destructor: function () {
        var node = this.get('host');

        if (this._contextMenu) {
            this._contextMenu.destroy();
        }

        this.data         = null;
        this._contextMenu = null;

        node.detach('contextmenu');
    },

    // -- Public Methods -------------------------------------------------------
    open: function (x, y) {
        var node        = this._node,
            contextMenu = this._contextMenu,
            content     = this._content;

        // Remove a previous context menu if it exists, ideally we prolly wanna toggle it.
        Y.all('.' + CSS_CONTEXT_OPEN).each(function (node) {
            node.contextMenu._contextMenu.destroy();
        });

        contextMenu = new Y.Overlay({
            bodyContent: content,
            visible: false,
            constrain: true,
            zIndex: this._getHighzIndex(),
            render: true
        });

        node.addClass(CSS_CONTEXT_OPEN);

        contextMenu.get('boundingBox').addClass(CSS_CONTEXT_MENU);
        contextMenu.get('boundingBox').setStyle('left', x);
        contextMenu.get('boundingBox').setStyle('top', y);
        contextMenu.show();

        this._contextMenu = contextMenu;
        this._bindContextMenu();
    },

    // -- Protected Methods ----------------------------------------------------

    _buildHTML: function (content) {
        var template =
            '<div class="' + CSS_BOOTSTRAP_DROPDOWN + ' ' + CSS_BOOTSTRAP_OPEN + '">' +
                '<ul class="' + CSS_BOOTSTRAP_DROPDOWN_MENU + '"></ul>' +
            '</div>';

        var node = Y.Node.create(template);
        var ul = node.one('ul');

        if (content === '') {
            return content;
        }

        Y.Array.each(content, function (item) {
            var elLi = Y.Node.create('<li>');
            var elA = Y.Node.create('<a href="#">');
            var html = item.title;

            if (item.className) {
                elLi.addClass(item.className);
            }

            if (item.title !== '-') {
                if (item.icon) {
                    html = '<i class="icon icon-' + item.icon + '"></i> ' + html;
                }

                elA.set('innerHTML', html);
                elA.setAttribute('data-id', item.id);

                elLi.append(elA);

                if (item.disabled === true) {
                    elLi.addClass('disabled');
                    elA.addClass('disabled');
                }
             } else {
                elLi.addClass('divider');
            }

            ul.append(elLi);
        });

        return node.get('outerHTML');
    },

    _bindContextMenu: function () {
        var self         = this,
            node         = this._node,
            contextMenu  = this._contextMenu;

        // Bind the menu events
        contextMenu.get('boundingBox').all('a').each(function() {
            this.on(['click', 'contextmenu'], function (e) {
                var target = e.currentTarget,
                    args = { node: node };

                e.preventDefault();

                if (target.hasClass('disabled') !== true) {
                    if (self.data !== null) {
                        args.data = self.data;
                    }

                    self.fire(target.getAttribute('data-id'), args);

                    contextMenu.destroy();
                } else {
                    target.blur();
                }
            });
        });

        contextMenu.get('boundingBox').all('li').on('mouseenter', function (e) {
            var node = e.currentTarget;

            if (node.one('i')) {
                node.one('i').addClass(CSS_BOOTSTRAP_ICON_WHITE);
            }
        });

        contextMenu.get('boundingBox').all('li').on('mouseleave', function (e) {
            var node = e.currentTarget;

            if (node.one('i') && node.one('i').hasClass(CSS_BOOTSTRAP_ICON_WHITE)) {
                node.one('i').removeClass(CSS_BOOTSTRAP_ICON_WHITE);
            }
        });

        contextMenu.get('boundingBox').on('clickoutside', function (e) {
            // Dont allow the rightclick mousebutton to hide the contextMenu
            // In some cases a browser (tested on FF17) will fire false positives and
            // immediately hide the contextmenu again.
            if (e.button !== 3) {
                contextMenu.destroy();
            }
        });
    },

    // -- Protected Event Handlers ---------------------------------------------

    _handleContextMenu: function (e) {
        var x = e.pageX,
            y = e.pageY;

        e.preventDefault();

        this.open(x, y);
    },

    _getHighzIndex: function() {
        var elements = document.getElementsByTagName('*');
        var highIndex = 0;

        for (var i = 0; i < elements.length - 1; i++) {
            if (parseInt(elements[i].style.zIndex) > highIndex) {
                highIndex = parseInt(elements[i].style.zIndex)
            }
        }

        return (highIndex + 1);
    }
}, {
    NS : 'contextMenu',
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').ContextMenu = ContextMenu;
