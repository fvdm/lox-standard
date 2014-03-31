YUI.add("lox-app-folder-share-view",function(e,t){var n="Cancel",r="Share",i="Update",s="Remove share",o="Share folder with...",u="Invite users and groups...",a="Remove",f="btn",l="btn-danger",c="tooltip",h="close",p="icon-user",d="icon-th-list",v=e.Base.create("folderShareView",e.View,[e.Rednose.View.Nav],{template:'<div class="share-form"><div class="input-append"><input type="text" class="share-search" placeholder="{placeholder}" /><button class="btn share-button" type="button">...</button></div><div class="share-ac"></div><div class="share-table"></div></div>',close:!0,buttons:{confirm:{position:"right",primary:!0},cancel:{value:n,position:"right"}},events:{".rednose-datatable-data button":{click:"_handleRemoveIdentity"},".share-button":{click:"_handleComboButton"}},initializer:function(){function m(t,n){return e.Array.map(n,function(t){return e.Lang.sub('<span><i class="{icon}"></i> {title}</span>',{title:t.raw.title,icon:t.raw.type==="group"?d:p})})}this._folderShareViewEvents||(this._folderShareViewEvents=[]);var t=this.get("container"),n=this.get("model"),c=this;this._folderShareViewEvents.push(this.on({buttonConfirm:this._handleConfirm,buttonRemove:this._handleRemove})),this.title=o,this.buttons.confirm.value=n.isNew()?r:i,n.isNew()?(delete this.buttons.remove,n.get("identities").reset()):this.buttons.remove={value:s,position:"left",className:f+" "+l},t.setContent(e.Lang.sub(this.template,{placeholder:u}));var v=t.one("input");this.ac=new e.AutoCompleteList({inputNode:v,resultFormatter:m,minQueryLength:0,maxResults:0,resultFilters:"charMatch",resultHighlighter:"charMatch",resultTextLocator:"title",source:YUI.Env.routing.shares_identities+"?q={query}&callback={callback}",render:t.one(".share-ac")}),this.ac.on("select",function(e){var r=e.result.raw;t.one(".share-search").set("value",""),n.get("identities").add(r)}),this.ac.after("select",function(){c.ac.set("value","")}),this._dataTable=new e.Rednose.DataTable({columns:[{key:"title",nodeFormatter:function(t){t.cell.set("innerHTML",e.Lang.sub('<span><i class="{icon}"></i> {title}</span>',{icon:t.data.type==="group"?d:p,title:t.data.title}))}},{key:"action",nodeFormatter:function(t){t.cell.addClass("last"),t.cell.set("innerHTML",e.Lang.sub('<button rel="tooltip" class="{class}" title="{title}">&times;</button>',{"class":h,title:a}))}}],sortBy:"title",data:n.get("identities")})},destructor:function(){(new e.EventHandle(this._folderShareViewEvents)).detach(),this.ac.destroy(),this.ac=null},render:function(){var e=this._dataTable,t=this.get("container");return e.render(t.one(".share-table")),this},_handleComboButton:function(e){e.stopPropagation();var t=this.ac;t.get("visible")?t.hide():(t.sendRequest(),t.show())},_handleConfirm:function(e){var t=this.get("model");e.data={model:t}},_handleRemove:function(e){var t=this.get("model");e.data={model:t}},_handleRemoveIdentity:function(t){var n=this.get("model").get("identities"),r=n.getByClientId(t.currentTarget.ancestor("tr").getAttribute("data-yui3-record"));e.all("."+c).hide(),r.destroy()}},{ATTRS:{model:{value:new e.Lox.ShareModel}}});e.namespace("Lox.App").FolderShareView=v},"@VERSION@",{requires:["autocomplete","autocomplete-filters","autocomplete-highlighters","lox-app-share-model","model","model-list","rednose-datatable","rednose-panel","rednose-view-nav"]});