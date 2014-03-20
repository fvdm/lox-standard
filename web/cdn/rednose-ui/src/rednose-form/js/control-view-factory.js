/*jshint boss:true, expr:true, onevar:false */

var TYPE_TEXT          = 'text',
    TYPE_TEXTAREA      = 'textarea',
    TYPE_HTML          = 'html',
    TYPE_DATE          = 'date',
    TYPE_DATETIME      = 'datetime',
    TYPE_DROPDOWN      = 'dropdown',
    TYPE_RADIO         = 'radio',
    TYPE_CHECKBOX      = 'checkbox',
    TYPE_AUTOCOMPLETE  = 'autocomplete',
    TYPE_FILE          = 'file';

function ControlViewFactory() {
    ControlViewFactory.superclass.constructor.apply(this);
}

ControlViewFactory.create = function (model) {
    switch (model.get('type')) {
        case TYPE_TEXT:
            return new Y.Rednose.Form.TextControlView({ model: model });
        case TYPE_DROPDOWN:
            return new Y.Rednose.Form.DropDownControlView({ model: model });
        case TYPE_TEXTAREA:
            return new Y.Rednose.Form.TextAreaControlView({ model: model });
        case TYPE_HTML:
            return new Y.Rednose.Form.RichTextControlView({ model: model });
        case TYPE_DATE:
            return null;
        case TYPE_DATETIME:
            return new Y.Rednose.Form.DateTimeControlView({ model: model });
        case TYPE_RADIO:
            return null;
        case TYPE_CHECKBOX:
            return new Y.Rednose.Form.CheckboxControlView({ model: model });
        case TYPE_AUTOCOMPLETE:
            return new Y.Rednose.Form.AutocompleteControlView({ model: model });
        case TYPE_FILE:
            return null;
    }

    return null;
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').ControlViewFactory = ControlViewFactory;
