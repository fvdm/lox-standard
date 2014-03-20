/*jshint boss:true, expr:true, onevar:false */

var TextAreaControlView;

TextAreaControlView = Y.Base.create('textAreaControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<textarea rows="3" class="input-block-level" id="{id}"></textarea>' +
                  '</div>' +
              '</div>',

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        return this;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').TextAreaControlView = TextAreaControlView;

var RichTextControlView;

RichTextControlView = Y.Base.create('richTextControlView', Y.Rednose.Form.BaseControlView, [], {

    template: '<div class="control-group">' +
                  '<label class="control-label" for="{id}">{label}</label>' +
                  '<div class="controls">' +
                      '<textarea class="input-block-level" id="{id}"></textarea>' +
                  '</div>' +
              '</div>',

    _editor: null,

    _rendered: false,

    destructor: function () {
        this._editor.destroy();

        this._editor = null;
    },

    render: function () {
        var container = this.get('container'),
            model     = this.get('model'),
            template  = this.template;

        if (this._rendered) {
            return;
        }

        container.setHTML(Y.Lang.sub(template, {
            id   : model.get('id'),
            label: model.get('caption')
        }));

        this._editor = new Y.Rednose.ControlFormRichTextEditor({
            srcNode   : container.one('textarea'),
            replace   : true,
            properties: {
                input_properties: {
                    styles    : 'true',
                    clipboard : 'true',
                    editing   : 'true',
                    undoredo  : 'true'
                }
            }
        }).render();

        this._rendered = true;

        return this;
    }
});

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose.Form').RichTextControlView = RichTextControlView;
