YUI.add("rednose-breadcrumb",function(e,t){var n="breadcrumb",r="divider",i="active",s="data-rednose-entry",o="Home",u="navigate",a=e.Base.create("breadcrumb",e.View,[],{_UL_TEMPLATE:'<ul class="{className}"></ul>',_LI_ITEM_TEMPLATE:'<li><a href="#">{itemLabel}</a> <span class="{dividerClass}">/</span></li>',_LI_ITEM_TRAILING_TEMPLATE:'<li class="{activeClass}"><span>{itemLabel}</span></li>',events:{a:{click:"_handleClick"}},_breadcrumbs:[],initializer:function(){var t=this.get("container");t.setContent(e.Lang.sub(this._UL_TEMPLATE,{className:n})),this.after("pathChange",this.render,this)},destructor:function(){this._breadcrumbs=null},render:function(){var t=this.get("container"),n=this._breadcrumbs,o=this;return t.one("ul").empty(),n instanceof Array&&n.length>0&&e.Array.each(n,function(u,a){var f;a+1===n.length?f=e.Node.create(e.Lang.sub(o._LI_ITEM_TRAILING_TEMPLATE,{activeClass:i,itemLabel:u.label})):f=e.Node.create(e.Lang.sub(o._LI_ITEM_TEMPLATE,{dividerClass:r,itemLabel:u.label})),u.data&&f.setAttribute(s,u.data),t.one("ul").append(f)}),this},_handleClick:function(e){e.preventDefault();var t=e.currentTarget.ancestor("li"),n=t.getAttribute(s);n&&this.fire(u,{data:n})},_setPath:function(t){var n=t==="/"?[o]:t.split("/"),r="/";return crumbs=[],e.Array.each(n,function(e){r+=e,crumbs.push({label:e===""?o:e,data:r}),r!=="/"&&(r+="/")}),this._breadcrumbs=crumbs,t}},{ATTRS:{path:{lazyAdd:!1,value:"/",setter:"_setPath"}}});e.namespace("Rednose").Breadcrumb=a},"1.4.0",{requires:["base","view"]});
