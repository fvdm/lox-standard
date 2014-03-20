var WidgetFactory;

WidgetFactory = Y.Base.create('widgetFactory', Y.Base, [], {

    /**
    Create a widget node based on the provided property-set

    @param properties
    @method _createWidget
    @protected
    **/
    _createWidget: function(properties) {
        var node = Y.Node.create('<span />');

        if (properties.is_date) {
            new Y.Rednose.ControlFormDatepicker({ srcNode: node, properties: properties }).render();
        } else if (properties.is_html) {
            new Y.Rednose.ControlFormRichTextEditor({ srcNode: node, properties: properties }).render();
        } else {
            new Y.Rednose.ControlFormCommon({ srcNode: node, properties: properties }).render();

            if (node.one('*')) {
                node = node.one('*');
            }
        }

        return node;
    }

});

Y.namespace('Rednose').WidgetFactory = WidgetFactory;
