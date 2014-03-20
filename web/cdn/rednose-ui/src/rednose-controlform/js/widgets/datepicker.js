/*jshint boss:true, expr:true, onevar:false */

var Datepicker;

Datepicker = Y.Base.create('datepicker', Y.Calendar, [ ], {

    initializer: function() {
        var self = this;

        this.after('render', function() {
            var wrapper = Y.Node.create('<span />');
            var input = Y.Node.create('<input />');
            var icon = Y.Node.create('<span />');
            var container = this.get('contentBox');

            icon.addClass('icon-calendar');

            input.addClass('dialogCalendar');
            input.setAttribute('readonly', 'true');
            input.on('click', function() {
                self.showCalendar(input, wrapper);
            });

            wrapper.addClass('calendarWrapper');
            wrapper.hide();
            wrapper.append(container.one('.yui3-calendar-pane'));
            wrapper.one('.yui3-calendar-pane').addClass('dialogCalendarPane');

            container.append(input);
            container.append(icon);
            container.append(wrapper);

            this.set('wrapper', wrapper);

            self.dateSelected({date: new Date() });
        });

        this.on('dateClick', self.dateSelected);
    },

    showCalendar: function(sender) {
        var wrapper = this.get('wrapper');
        var properties = this.get('properties');

        if (typeof(properties.is_date.accepts_input) === 'undefined') {
            return;
        }

        // Events
        var activateHide = false;

        wrapper.detach('clickoutside');
        wrapper.on('clickoutside', function() {
            if (activateHide === false) {
                activateHide = true;
            } else {
                wrapper.hide();
            }
        });

        // Show and set position
        wrapper.show();
        wrapper.setX(sender.getX());
        wrapper.setY(sender.getY() + parseInt(sender.getStyle('height')) + 5);
    },

    dateSelected: function(e) {
        var wrapper = this.get('wrapper');
        var input = wrapper.ancestor().one('input');

        input.set('value', e.date.toLocaleDateString());
        input.setAttribute('data-unixtime', e.date.getTime());

        wrapper.hide();
    }

}, {
    ATTRS: {
        wrapper: { value: null },
        properties: { value: {} },
    }
});

Y.namespace('Rednose').ControlFormDatepicker = Datepicker;
