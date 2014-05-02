YUI.add('dropdown-test', function (Y) {

    var Assert = Y.Assert,
        suite;

    suite = new Y.Test.Suite('Dropdown');

    suite.add(new Y.Test.Case({
        name: 'Config',

        setUp: function () {
            Y.one('#container').append(Y.Node.create('<div class="menu"></div>'));
        },

        tearDown: function () {
            Y.one('.menu').remove();
        },

        'Default `href` attribute should be hash': function () {
            var menu = Y.one('.menu');

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' }
                ]
            }).render().open();

            Assert.areEqual('#', menu.one('a').getAttribute('href'));
        },

        '`url` should set the `href` attribute': function () {
            var menu = Y.one('.menu');

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { id: 'testItem1', title: 'Test Item 1', url: 'http://wwww.rednose.nl' }
                ]
            }).render().open();

            Assert.areEqual('http://wwww.rednose.nl', menu.one('a').getAttribute('href'));
        },

        '`html` property should render custom HTML': function () {
            var menu = Y.one('.menu'),
                html = '<a href="http://www.rednose.nl"><div>You joined the folder <strong>Demo user\'s shared folder</strong></div><div><small class="muted">39 minutes ago</small></div></a>';

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { html: html }
                ]
            }).render().open();

            Assert.areEqual(html, menu.one('a').get('outerHTML'));
        }
    }));

    suite.add(new Y.Test.Case({
        name: 'Events',

        setUp: function () {
            Y.one('#container').append(Y.Node.create('<div class="menu"></div>'));
        },

        tearDown: function () {
            Y.one('.menu').remove();
        },

        'Dropdown should hide when clicked outside': function () {
            var menu = Y.one('.menu');

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            }).render().open();

            Assert.isTrue(menu.hasClass('open'));

            Y.one('body').simulate('click');
            Assert.isFalse(menu.hasClass('open'));

            dropdown.destroy();
        },

        'Dropdown should hide when an item is clicked': function () {
            var menu = Y.one('.menu');

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            }).render().open();

            Assert.isTrue(menu.hasClass('open'));

            menu.one('a').simulate('click');

            Assert.isFalse(menu.hasClass('open'));

            dropdown.destroy();
        },

        'Dropdown should update when `reset` is called after it\'s rendered': function () {
            var menu = Y.one('.menu');

            var dropdown = new Y.Rednose.Dropdown({
                container: menu,
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            }).render().open();

            dropdown.reset([{ id: 'testItem3', title: 'Test Item 3' }]);

            Assert.areEqual('testItem3', menu.one('a').getAttribute('data-id'));
        }
    }));

    Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dropdown', 'test', 'node-event-simulate']
});
