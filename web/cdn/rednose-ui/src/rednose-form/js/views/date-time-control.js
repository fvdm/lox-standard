/*jshint boss:true, expr:true, onevar:false */

var Micro = Y.Template.Micro,
    DateTimeControlView;

DateTimeControlView = Y.Base.create('dateTimeControlView', Y.Rednose.Form.BaseControlView, [], {

    OPTION_TEMPLATE: Micro.compile('<option value="<%= data.value %>"<% if (data.selected) { %> selected<% }%>><%= data.label %></option>'),

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls controls-row">' +
                      '<select id="{id}" class="rednose-date-day"></select>' +
                      '<select class="rednose-date-month"></select>' +
                      '<select class="rednose-date-year"></select>' +
                      '<select class="rednose-date-hour"></select>' +
                      ':' +
                      '<select class="rednose-date-minute"></select>' +
                  '</div>' +
              '</div>',

    render: function () {
        var date           = new Date(),
            reflectionDate = new Date();

        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id:    model.get('id'),
            label: model.get('caption')
        }));

        for (var i = 1; i <= 31; i++) {
            reflectionDate.setDate(i);

            container.one('.rednose-date-day').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%d'} ),
                selected: i === date.getDate()
            }));
        }

        for (var i = 0; i <= 11; i++) {
            reflectionDate.setMonth(i);

            container.one('.rednose-date-month').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%B'} ),
                selected: i === date.getMonth()
            }));
        }

        for (var i = date.getFullYear() - 5; i <= date.getFullYear() + 5; i++) {
            reflectionDate.setFullYear(i);

            container.one('.rednose-date-year').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%G'} ),
                selected: i === date.getFullYear()
            }));
        }

        for (var i = 0; i <= 23; i++) {
            reflectionDate.setHours(i);

            container.one('.rednose-date-hour').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%H'} ),
                selected: i === date.getHours()
            }));
        }

        for (var i = 0; i <= 59; i++) {
            reflectionDate.setMinutes(i);

            container.one('.rednose-date-minute').append(this.OPTION_TEMPLATE({
                value   : i,
                label   : Y.Date.format(reflectionDate, { format: '%M'} ),
                selected: i === date.getMinutes()
            }));
        }

        return this;
    },

    // XXX
    focus: function () {
        var node = this.get('container').one('select');

        if (node) {
            node.focus();
        }
    },

});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').DateTimeControlView = DateTimeControlView;
