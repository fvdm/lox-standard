YUI.add("rednose-datatable-select",function(e,t){function l(){l.superclass.constructor.apply(this,arguments)}function p(){l.superclass.constructor.apply(this,arguments)}var n="selected",r="data",i="columns",s="icon-white",o="data-yui3-record",u="select",a="dblclick",f="open";l.NAME="dataTableSelectPlugin",l.NS="selectable",l.ATTRS={selectedRow:{value:null}},e.extend(l,e.Plugin.Base,{initializer:function(){var e=this.get("host"),t=e.get("contentBox");this.after("selectedRowChange",this._afterSelectedRowChange,this),t.on("click",this._handleClick,this),t.on("dblclick",this._handleDblClick,this),t.on("clickoutside",this._handleClickOutside,this)},setSelection:function(e){var t=this.get("host"),n=t.getRow(e);n&&this.set("selectedRow",n)},getSelection:function(){var e=this.get("selectedRow");return e===null?null:this._getModelFromTableRow(e)},_handleClick:function(e){var t=e.target,n=this.get("host");if(t.test("a"))return!1;if(t.ancestor("."+n.getClassName(r)+" tr"))this.set("selectedRow",t.ancestor("."+n.getClassName(r)+" tr"));else{if(t.ancestor("."+n.getClassName(i)))return!1;this.set("selectedRow",null)}return!0},_handleDblClick:function(e){var t=this.get("host");t.fire(a),t.fire(f,{model:this._getModelFromTableRow(this.get("selectedRow"))})},_handleClickOutside:function(t){e.Rednose.Util.isAncestor(t.target,t.currentTarget)&&this.set("selectedRow",null)},_afterSelectedRowChange:function(t){var r=this.get("host"),i=t.newVal,o=t.prevVal,a=null;return i===o?!1:(o&&(o.all("td").removeClass(r.getClassName(n)),o.one("i")&&o.one("i").hasClass(s)&&o.one("i").removeClass(s)),e.Lang.isNull(i)===!1&&(i.all("td").addClass(r.getClassName(n)),i.one("i")&&i.one("i").addClass(s),a=this._getModelFromTableRow(i)),r.fire(u,{model:a}),!0)},_getModelFromTableRow:function(e){var t=e.getAttribute(o),n=this.get("host").data;return n.getByClientId(t)}}),e.namespace("Rednose").DataTableSelectPlugin=l;var c="rednose-datatable-col-",h="rednose-datatable-input";p.NAME="dataTableEditRowPlugin",p.NS="editable",e.extend(p,e.Plugin.Base,{_activeInputNode:null,initializer:function(){var e=this,t=this.get("host"),n=t.get("data");this._renderFields(),n.before(["add","remove"],function(){e._updateModel()}),n.after(["add","remove"],function(){e._renderFields()})},getData:function(){return this._updateModel(),this.get("host").get("data")},_renderFields:function(t){var n=this,r=this.get("host"),i=r.get("boundingBox"),s=r.get("columns");e.Array.each(s,function(e){var t=c+e.key;e.editable&&i.all("td."+t).each(function(t){var i=r.getRecord(t.ancestor("tr").getAttribute("data-yui3-record"));n._addField(t,i,e.key)})})},_addField:function(t,n,r){var i=this,s=t.get("text"),o=e.Node.create("<input />");o.set("value",s),o.addClass(h),o.setAttribute("name",r),o.setData("model",n),t.setHTML(""),t.append(o)},_updateModel:function(){var t=this.get("host"),n=t.get("boundingBox"),r=[];n.all("input").each(function(e){r.push({model:e.getData("model"),property:e.get("name"),value:e.get("value")})}),e.Array.each(r,function(e){e.model.set(e.property,e.value)})}}),e.namespace("Rednose").DataTableEditRowPlugin=p},"1.1.0-DEV",{requires:["rednose-datatable","plugin"]});
