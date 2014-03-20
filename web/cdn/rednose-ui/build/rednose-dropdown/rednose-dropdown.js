YUI.add('rednose-dropdown', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

/**
Provides a dropdown plugin with custom event binding.

@module rednose-dropdown
**/
var Dropdown;

/**
Provides a context menu plugin with custom event binding.

@class Dropdown
@namespace Rednose
@constructor
@extends Bootstrap.Dropdown
**/
Dropdown = Y.Base.create('dropdown', Y.Bootstrap.Dropdown, [], {
    // -- Lifecycle methods ----------------------------------------------------

    initializer: function () {
        var node      = this._node,
            menuNode  = null,
            direction = this.config.dropup ? 'dropup' : 'dropdown';

        node.wrap('<div class="dropdown-wrapper ' + direction + '"></div>');
        node.addClass('dropdown-toggle');
        node.setAttribute('data-toggle', 'dropdown');
        this.node = node;

        menuNode = node.get('parentNode');
        menuNode.append(this._buildHTML(
            this.get('content')
        ));

        // Close the dropdown on click.
        menuNode.delegate('click', function(e) {
            e.preventDefault();

            if (e.target.hasClass('disabled') !== true) {
                if (e.target.getAttribute('data-id')) {
                    node.dropdown.fire(e.target.getAttribute('data-id'));
                }

                node.dropdown.toggle();
            } else {
                e.target.blur();
            }
        }, 'a');

        this.set('node', menuNode);
    },

    destructor: function () {
        this.get('node').replace(this.node);

        this.node.removeClass('dropdown-toggle');
        this.node.removeAttribute('data-toggle');

        delete this.node;
    },

    // -- Public methods -------------------------------------------------------

    enable: function (id) {
        // FIXME: Shouldn't we rename this to toggle?
        this.disable(id);
    },

    disable: function (id) {
        var container = this.get('node'),
            node = container.one('[data-id=' + id + ']');

        if (node.ancestor('li').hasClass('disabled')) {
            node.removeClass('disabled');
            node.ancestor('li').removeClass('disabled');
        } else {
            node.addClass('disabled');
            node.ancestor('li').addClass('disabled');
        }
    },

    rename: function (id, title) {
        var container = this.get('node'),
            node = container.one('[data-id=' + id + ']');

        node.setHTML(title);
    },

    // -- Protected methods ----------------------------------------------------

    _buildHTML: function (content) {
        var template = '<ul class="dropdown-menu"></ul>';
        var node = Y.Node.create(template);

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
                    html = '<i class="icon ' + item.icon + '"></i> ' + html;
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

            node.append(elLi);
        });

        return node.get('outerHTML');
    }
}, {
    NS : 'dropdown',
    ATTRS : {
        content: { value: [] },
        node: { value: null }
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Dropdown = Dropdown;


}, '1.1.0-DEV', {"requires": ["base", "node", "gallery-bootstrap-dropdown"]});
