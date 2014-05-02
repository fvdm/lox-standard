YUI.add('dropdown-plugin-test', function (Y) {

    var Assert = Y.Assert,
        suite;

    suite = new Y.Test.Suite('Dropdown Plugin');

    suite.add(new Y.Test.Case({
        name: 'Lifecycle',

        setUp: function () {
            Y.one('#container').append(Y.Node.create('<li class="menu"><button id="button">Test</button></li>'));
        },

        tearDown: function () {
            Y.one('.menu').remove();
        },

        '`plug()` should bind the dropdown': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isInstanceOf(Y.Rednose.Plugin.Dropdown, button.hasPlugin('dropdown'));

            button.unplug('dropdown');
        },

        '`unplug()` should purge the dropdown': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            button.unplug('dropdown');

            Assert.isUndefined(button.hasPlugin('dropdown'));
        }
    }));

    suite.add(new Y.Test.Case({
        name: 'Config',

        setUp: function () {
            Y.one('#container').append(Y.Node.create('<li class="menu"><button id="button">Test</button></li>'));
        },

        tearDown: function () {
            Y.one('.menu').remove();
        },

        '`dropup` set to `false` should render the menu downwards': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                dropup: false,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isTrue(button.get('parentNode').hasClass('dropdown'));

            button.unplug('dropdown');
        },

        '`dropup` set to `true` should render the menu upwards': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                dropup: true,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isTrue(button.get('parentNode').hasClass('dropup'));

            button.unplug('dropdown');
        },

        '`showCaret` should render a caret by default': function () {
            var button = Y.one('#button'),
                menu   = Y.one('.menu');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isInstanceOf(Y.Node, menu.one('.caret'));

            button.unplug('dropdown');
        },

        '`showCaret` set to false should not render a caret': function () {
            var button = Y.one('#button'),
                menu   = Y.one('.menu');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                showCaret: false,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isNull(menu.one('.caret'));

            button.unplug('dropdown');
        }
    }));

    suite.add(new Y.Test.Case({
        name: 'Events',

        setUp: function () {
            Y.one('#container').append(Y.Node.create('<li class="menu"><button id="button">Test</button></li>'));
        },

        tearDown: function () {
            Y.one('.menu').remove();
        },

        'Dropdown should be invisible when initialized': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                dropup: false,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            Assert.isFalse(button.get('parentNode').hasClass('open'));

            button.unplug('dropdown');
        },

        'Dropdown should be visible when host is clicked': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                dropup: false,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            button.simulate('click');

            Assert.isTrue(button.get('parentNode').hasClass('open'));

            button.unplug('dropdown');
        },

        'Dropdown should toggle when host is clicked multiple times': function () {
            var button = Y.one('#button');

            button.plug(Y.Rednose.Plugin.Dropdown, {
                dropup: false,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            button.simulate('click');
            Assert.isTrue(button.get('parentNode').hasClass('open'));

            button.simulate('click');
            Assert.isFalse(button.get('parentNode').hasClass('open'));

            button.simulate('click');
            Assert.isTrue(button.get('parentNode').hasClass('open'));

            button.unplug('dropdown');
        },

        '`showOnContext` should not show the menu when initialized': function () {
            var menu = Y.one('.menu');

            menu.plug(Y.Rednose.Plugin.Dropdown, {
                showOnContext: true,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            var dropdown = Y.one('.dropdown');

            Assert.isNull(dropdown);
        },

        '`showOnContext` should render the menu on right-clicking': function () {
            var menu = Y.one('.menu');

            menu.plug(Y.Rednose.Plugin.Dropdown, {
                showOnContext: true,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });

            menu.simulate('contextmenu');

            var dropdown = Y.one('.dropdown');

            Assert.isTrue(dropdown.hasClass('open'));

            menu.unplug('dropdown');

            Y.all('.dropdown').remove();
        }
    }));

    Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dropdown', 'test', 'node-event-simulate']
});
