YUI.add('dropdown-base-test', function (Y) {

    var Assert = Y.Assert,
        suite;

    suite = new Y.Test.Suite('DropdownBase');

    suite.add(new Y.Test.Case({
        name: 'Basic',

        setUp: function () {
            this.dropdown = new Y.Rednose.DropdownBase({
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2', disabled: true }
                ]
            });
        },

        tearDown: function () {
            this.dropdown.destroy();
        },

        '`open` should enable the dropdown open state': function () {
            var dropdown = this.dropdown;

            Assert.isFalse(dropdown.isOpen());

            dropdown.open();

            Assert.isTrue(dropdown.isOpen());
        },

        '`close` should disable the dropdown open state': function () {
            var dropdown = this.dropdown;

            dropdown.open();

            Assert.isTrue(dropdown.isOpen());

            dropdown.close();

            Assert.isFalse(dropdown.isOpen());
        },

        '`toggle` should toggle the dropdown open state': function () {
            var dropdown = this.dropdown;

            Assert.isFalse(dropdown.isOpen());

            dropdown.toggle();

            Assert.isTrue(dropdown.isOpen());

            dropdown.toggle();

            Assert.isFalse(dropdown.isOpen());
        },

        '`disable` should disable an item': function () {
            var dropdown = this.dropdown,
                item     = dropdown.getItemById('testItem1');

            Assert.isFalse(item.isDisabled());

            item.disable();

            Assert.isTrue(item.isDisabled());
        },

        '`enable` should enable an item': function () {
            var dropdown = this.dropdown,
                item     = dropdown.getItemById('testItem2');

            Assert.isTrue(item.isDisabled());

            item.enable();

            Assert.isFalse(item.isDisabled());
        },

        '`rename` should rename an item': function () {
            var dropdown = this.dropdown,
                item     = dropdown.getItemById('testItem1');

            Assert.areEqual('Test Item 1', item.title);

            item.rename('Renamed Item');

            Assert.areEqual('Renamed Item', item.title);
        },

        '`reset` should reset the dropdown items': function () {
            var dropdown = this.dropdown;

            dropdown.reset([
                { id: 'testItem3', title: 'Test Item 3' },
                { id: 'testItem4', title: 'Test Item 4', disabled: true }
            ]);

            Assert.isInstanceOf(Y.Rednose.DropdownItem, dropdown.getItemById('testItem3'));
        }
    }));

    suite.add(new Y.Test.Case({
        name: 'Events',

        setUp: function () {
            this.dropdown = new Y.Rednose.DropdownBase({
                items: [
                    { id: 'testItem1', title: 'Test Item 1' },
                    { id: 'testItem2', title: 'Test Item 2' }
                ]
            });
        },

        tearDown: function () {
            this.dropdown.destroy();
        },

        '`open` event should fire when the dropdown opens': function () {
            var calls    = 0,
                dropdown = this.dropdown;

            dropdown.on('open', function (e) {
                calls++;
            });

            dropdown.open();

            Assert.areEqual(1, calls);
        },

        '`close` event should fire when the dropdown opens': function () {
            var calls    = 0,
                dropdown = this.dropdown;

            dropdown.on('close', function (e) {
                calls++;
            });

            dropdown.open().close();

            Assert.areEqual(1, calls);
        }
    }));

    Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dropdown', 'test', 'node-event-simulate']
});
