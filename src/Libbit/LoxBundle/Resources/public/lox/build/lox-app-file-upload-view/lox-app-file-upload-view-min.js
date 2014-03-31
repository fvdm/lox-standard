YUI.add("lox-app-file-upload-view",function(e,t){var n="Choose files",r="Close",i="Upload files...",s="Upload files to LocalBox.",o="You can upload more then one file at a time.",u=YUI.Env.routing.upload,a=104,f=30,l="file-list",c="body-text",h="btn",p="btn-primary",d="float-right",v="disabled",m="progress",g="bar",y="success",b="warning",w="error",E="uploadcomplete",S="pending",x="failed",T="finished",N="\u2718",C="\u2718",k="\u2714",L=e.Base.create("fileUploadView",e.View,[e.Rednose.View.Nav],{UPLOADER_TEMPLATE:'<button class="{buttonClass}">{buttonText}</button>',title:i,close:!0,template:'<div><div class="{classBody}"><p>{textBody}</p><p>{textSubBody}</p></div><p><div class="{classFileList}"></div></p><p><div class="{classProgress}"><div class="{classBar}" style="width: 0%;"></div></div></p></div>',buttons:{cancel:{value:r,position:"right"}},_uploader:null,_progressBar:null,initializer:function(){this._dialogViewEvents||(this._dialogViewEvents=[]);var t=this.get("container");t.setContent(e.Lang.sub(this.template,{classBody:c,textBody:s,textSubBody:o,classFileList:l,classProgress:m,classBar:g})),this._progressBar=t.one("."+m),this._progressBar.hide(),this.items=new e.ModelList,this._initializeUploader(),this._dialogViewEvents.push(e.Do.after(this._renderUploader,this,"_afterRender",this),this._uploader.after("fileselect",this._afterFileSelect,this),this._uploader.on("uploadstart",this._onUploadStart,this),this._uploader.on("uploadcomplete",this._onUploadComplete,this),this._uploader.on("uploaderror",this._onUploadError,this),this._uploader.on("totaluploadprogress",this._onTotalUploadProgress,this),this._uploader.on("alluploadscomplete",this._onAllUploadsComplete,this))},destructor:function(){(new e.EventHandle(this._dialogViewEvents)).detach(),this._uploader.destroy(),this._progressBar.destroy(),this.items.destroy(),this._uploader=null,this._progressBar=null,this.items=null,this.UPLOADER_TEMPLATE=null},render:function(){var t=new e.Rednose.DataTable({columns:[{key:"name",formatter:function(e){var t;switch(e.data.state){case S:t=b;break;case T:t=y;break;default:t=w}e.rowClass=t},nodeFormatter:function(e){e.cell.set("innerHTML",'<div style="width: 319px;">'+e.data.name+"</div>")}},{key:"type",nodeFormatter:function(e){e.cell.set("innerHTML",'<div style="width: 120px;">'+e.data.type+"</div>")}},{key:"size",nodeFormatter:function(t){t.cell.set("innerHTML",'<div style="width: 80px;">'+e.Rednose.Formatter.size(t.data.size)+"</div>")}},{key:"icon",nodeFormatter:function(e){var t;switch(e.data.state){case S:t=N;break;case T:t=k;break;default:t=C}e.cell.set("innerHTML",'<div style="width: 25px;">'+t+"</div>")}}],data:this.items});return t.render(this.get("container").one("."+l)),this},_initializeUploader:function(){if(e.Uploader.TYPE!=="none"&&!e.UA.ios){var t=this.get("path");e.Uploader.SELECT_FILES_BUTTON=e.Lang.sub(this.UPLOADER_TEMPLATE,{buttonClass:h+" "+p+" "+d,buttonText:n}),this._uploader=new e.Uploader({width:a,height:f,multipleFiles:!0,uploadURL:u,simLimit:2,postVarsPerFile:{token:YUI.Env.token,path:t},withCredentials:!1,buttonClassNames:{disabled:v}})}},_renderUploader:function(){if(this._uploader){var t=this.get("container");t.one(".yui3-widget-ft div").prepend(e.Node.create('<div id="choose-files-button" class="'+d+'"></div>')),this._uploader.render(this.get("container").one("#choose-files-button"))}},_afterFileSelect:function(){var t=this._uploader.get("fileList"),n=[];t.length>0&&(e.Array.each(t,function(t){n.push(new e.Model({id:t.get("id"),name:t.get("name"),type:t.get("type"),size:t.get("size"),state:S}))}),this.get("container").one("."+c).hide(),this.items.reset(n),this._uploader.uploadAll())},_onUploadStart:function(){this._uploader.set("enabled",!1),this._progressBar.show(),this._progressBar.one("."+g).setStyle("width","0%")},_onUploadError:function(e){var t=e.file.get("id"),n=this.items.getById(t);n&&n.set("state",x)},_onUploadComplete:function(e){var t=e.file.get("id"),n=this.items.getById(t);n&&n.set("state",T)},_onTotalUploadProgress:function(e){var t=e.percentLoaded;this._progressBar.one("."+g).setStyle("width",String(t)+"%")},_onAllUploadsComplete:function(){this._uploader.set("enabled",!0),this._uploader.set("fileList",[]),this._progressBar.hide(),this.fire(E)}},{ATTRS:{path:{value:"/"}}});e.namespace("Lox.App").FileUploadView=L},"@VERSION@",{requires:["rednose-app","rednose-formatter","uploader"]});