YUI.add("rednose-grid-select",function(e,t){var n;n=function(){},n.prototype={initializer:function(){this._setSelectable()},select:function(e){e.simulate("click")},_bind:function(){var e=this.get("container");e.delegate("dblclick",this._handleDoubleClick,".model-grid-icon-container .model-grid-icon",this),e.on("click",this._handleClick,this),e.on("clickoutside",this._handleClickOutside,this),this.after("selectedItemChange",this._afterSelectedItemChange,this)},_getModelFromGridItem:function(e){var t=e.ancestor(".model-grid-container").getAttribute("data-yui3-record"),n=this.get("data"),r=null;return n.getByClientId(t)},_setSelectable:function(){var e=this.get("selectable");e&&this._bind()},_handleClick:function(e){var t=null;e.target.hasClass("model-grid-icon")&&(t=e.target.ancestor(".model-grid-icon-container")),this.set("selectedItem",t)},_handleDoubleClick:function(e){var t=e.currentTarget.ancestor(".model-grid-icon-container"),n=this._getModelFromGridItem(t);this.fire("open",{model:n})},_handleClickOutside:function(t){e.Rednose.Util.isAncestor(t.target,t.currentTarget)&&this.set("selectedItem",null)},_afterSelectedItemChange:function(t){var n=this.get("container"),r=t.newVal,i=t.prevVal,s=null;if(r&&r===i)return;n.all(".model-grid-item-selected").removeClass("model-grid-item-selected"),e.Lang.isNull(r)===!1&&(r.addClass("model-grid-item-selected"),s=this._getModelFromGridItem(r)),this.fire("select",{model:s})}},n.ATTRS={selectable:{value:!1},selectedItem:{value:null}},e.namespace("Rednose.Grid").Selectable=n},"1.4.0");
