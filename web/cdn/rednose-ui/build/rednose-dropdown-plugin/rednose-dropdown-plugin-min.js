YUI.add("rednose-dropdown-plugin",function(e,t){e.namespace("Rednose.Plugin").Dropdown=e.Base.create("dropdown",e.Rednose.Dropdown,[e.Plugin.Base],{initializer:function(e){this._host=e.host;var t=this.get("container"),n=this.get("dropup"),r=this.classNames;t.addClass(r.dropdown),n&&t.addClass(r.dropup);if(this.get("showOnContext")){this._host.on("contextmenu",this._afterAnchorContextMenu,this);return}this._host.addClass(r.toggle),this.get("showCaret")&&this._host.setHTML(this.templates.caret({classNames:r,content:this._host.getHTML()})),this._host.on("click",this._afterAnchorClick,this)},_positionContainer:function(e,t){var n=this.get("container");n.setStyles({position:"absolute",left:e,top:t})},_afterAnchorContextMenu:function(e){if(e.shiftKey)return;e.preventDefault(),this._positionContainer(e.pageX,e.pageY),this.open()},_afterAnchorClick:function(e){e.preventDefault(),this.toggle()}},{NS:"dropdown",ATTRS:{showCaret:{value:!0,writeOnce:"initOnly"},showOnContext:{value:!1,writeOnce:"initOnly"},dropup:{value:!1,writeOnce:"initOnly"},container:{getter:function(e){return this.get("showOnContext")?this._getContainer(e):this._host.get("parentNode")}}}})},"1.4.0",{requires:["rednose-dropdown","node-pluginhost","plugin"]});
