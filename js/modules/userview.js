
UserView = Backbone.View.extend({
	_data: {},
	initialize: function(a, b){
		this._name = a,
		this._template = b
	},
	render: function() {
		if (!this._template) {
			console.error("Null template for userview render");
			return
		}
		var a = Handlebars.compile($("#template-ui-" + this._template).html()), b = a(this._data);
		$(this.el).html(b)
	}
}),

HeaderView = UserView.extend({
	el: "#header",
	initialize: function() {
		var b = this;
		UserView.prototype.initialize.call(this, "headerview", "headerview"),
		this.bindEvents(),
		$("#sel-device-size", this.el).filterSelector({
			width: 120,
			height: 204,
			style: 'vertical-align: 6px; margin-right:6px;',
			multiple: false,
			header: false,
			displaySelectedText: true,
			change: function(){
				b.onChangeDeviceSize($(this).getSelectedValue())
			}
		})
	},
	events: {
		//"click .btn-pageinfo": "onInfoLinkClicked",
		//"click .btn-export": "onExportLinkClicked",
		//"click .btn-publish": "onPublishLinkClicked",
		"click .btn-screen": "onScreenLinkClicked",
		"click .btn-undo.on": "onUndoLinkClicked",
		"click .btn-redo.on": "onRedoLinkClicked",
		//"click .btn-save.on": "onSaveLinkClicked",
		"click .btn-direct": "onDirectLinkClicked",
		"click .btn-design": "onDesignLinkClicked"
	},
	//2013.01.08修改，“页面信息”，“导出HTML”，“发布设定”，“保存”按钮改由jquery绑定点击事件，以便统一处理锁屏逻辑，见app.js
	bindEvents: function(){
		var a = this;
		$(".btn-pageinfo", this.el).click(function(){
			a.onInfoLinkClicked()
		}),
		// $(".btn-export", this.el).click(function(){
		// 	 a.onExportLinkClicked()
		// }),
		$(".btn-publish", this.el).click(function(){
			a.onPublishLinkClicked()
		}),
		$(".btn-save", this.el).click(function(){
			$(this).hasClass("on") && a.onSaveLinkClicked()
		})
	},
	onInfoLinkClicked: function(e){		
		var a = $("#pageinfo-dialog"), b = this;
		if(!a.data("box")){
			a.box({
				title: "页面信息",
				modal: true,
				//effects: true,
				create: function(){
					
					//初始化页面信息数据
					b._initInfoData(),	
					
					//取消按钮事件
					$("div.b a.btn:last", a).click(function(){
						//取消后，判断是否该回退到页面模板管理页面
						a.close(), b._setInfoTips(), window.App.getLoadedApp() || b._gotoBack(b)
					}),
					//确定按钮事件
					$("div.b a.btn:first", a).bind("click", function(){
						b._saveInfo()
					});

					//输入框的焦点事件
					// $("input[type=text], textarea", a).bind({
					// 	focus: function(){
					// 		$(this).addClass("active")
					// 	},
					// 	blur: function(){
					// 		$(this).removeClass("active")
					// 	}
					// })
				}
			})			
		}
		a.open()
	},
	_initInfoData: function(){
		var b = this, c = window.App.getLoadedApp();
		if(!c) return;
		$("#templateName").val(c.name.getValue()),
		$("#templateRemark").val(c.remark.getValue());
	},
	_saveInfo: function(){
		if(!this._checkInfoData()) return;
		var a = this, 
			b = window.App, 
			c = b.getLoadedApp(), 
			d = Utils.getQueryParameter("operateType"), 
			e = {				
				id: c ? c.getId() : Utils.getQueryParameter("id"), //模板ID
				name: $.trim($("#templateName").val()), //模板名称
				remark: $.trim($("#templateRemark").val()), //备注
				//templateType: c ? c.templateType.getValue() : Utils.getQueryParameter("templateType"), //模板类型
				operateType: c ? "3" : d == "" ? "1" : d, //操作类型
				businessFlag: c ? c.businessFlag.getValue() : Utils.getQueryParameter("businessFlag"), //业务标识
				businessName: c ? c.businessName.getValue() : Utils.getQueryParameter("businessName"),
				token: Utils.getQueryParameter("token"),
				lgnId: b.getLgnId()
			};
			
		Utils.request({
			url: c ? b.getSitePath() + "editPageTemp.action" : b.getSitePath() + "addPageTemp.action", //app已存在，做修改逻辑
			data: e,
			type: "post",
			loader: false,
			errorTip: "#pageinfo-dialog .error-tip",
			success: function(d){
				$("#pageinfo-dialog").close(); //关闭弹窗

				if(d.doc){ //新增、复制时返回的初始化数据
					b.trigger("appLoading"), 
					b.openFromObject(d),
					a._savePageWhenCheckInfo(),
					b.trigger("appLoaded");
					return;
				}
				a._savePageWhenCheckInfo();
				//更新app属性值
				c && c.initFromSerializedProperties({
					name: e.name,
					remark: e.remark,
					//templateType: e.templateType,
					businessFlag: e.businessFlag,
					businessName: e.businessName					
				});					
			}
		}, "#pageinfo-dialog div.b a.btn:first", a._saveInfo, this)
	},
	
	_savePageWhenCheckInfo: function(){ //保存页面信息
		var app = window.App,saveUrl = app.getSaveUrl(),BackUrl = app.getBackUrl(),c = app.getLoadedApp();
		var data = {
				"pageId": c.getId(),
				"pageName": $.trim($("#templateName").val()),
				"pageRemark": $.trim($("#templateRemark").val()),
				"businessName": c ? c.businessName.getValue() : Utils.getQueryParameter("businessName"),
				"businessFlag": c ? c.businessFlag.getValue() : Utils.getQueryParameter("businessFlag")
			};
	
		Utils.request({
			url: saveUrl,
			data: data,
			type: "post",
			loader: false,
			success: function (d) {
				
			}
		});
	},
	
	_checkInfoData: function(){
		var a = this, 
			b = !0,
			c = $.trim($("#templateName").val());
			
		if(c == ""){
			a._setInfoTips("请您输入页面名称；"),
			b = !1
		}else if(Utils.getStrLength(c) > 50){
			a._setInfoTips("页面名称长度限制为50（汉字按2字节计算）；"),
			b = !1
		}
				
		return b
	},
	_setInfoTips: function(a){
		$("#pageinfo-dialog .error-tip").html(a ? Utils.getTipWapper(a) : "").show()
	},
	onExportLinkClicked: function(e){
		return window.App.exportHtml(), !1		
	},
	onPublishLinkClicked: function(e){
		var a = this, b = window.App;
		Utils.confirm("您确定要保存并且离开本页吗？", function(){
			b.saveApp({
				//loader: false,
				success: function(){
					Utils.request({
						url: b.getSitePath() + "doPublicStatus.action",
						data: {
							pageId: b.getLoadedApp().getId(), //站点ID
							state: 1 //状态
						},
						//loader: false,
						success: function(d){
							a._gotoBack(d)
						}
					})
				}
			})
		})
	},	
	_gotoBack: function(a){	
		var app = window.App, backUrl = app.getBackUrl();
		backUrl = unescape(backUrl)
			if(a.resultData === undefined){
				backUrl.indexOf("?") === -1 ? (backUrl += "?") : (backUrl += "&"), 
				backUrl += "pid=null";
			}else{
				backUrl.indexOf("?") === -1 ? (backUrl += "?") : (backUrl += "&"), 
				backUrl += "pid=" + a.resultData[0].id + "&name=" + a.resultData[0].name, 
				backUrl += "&remark=" + a.resultData[0].remark + "&businessName=" + a.resultData[0].businessName, 
				backUrl += "&businessFlag=" + a.resultData[0].businessFlag + "&pagurl=" + a.resultData[0].url;
			}
			location.href = backUrl
	},	
	onScreenLinkClicked: function(e){
		var a = $("a.btn-screen", this.el);
		$('#mainContent', parent.document).toggleClass("fullScreen_s"),
		$("a.btn-screen, div.h-icon-screen", this.el).toggleClass("on off"),
		a.attr("title") === "全屏" ? a.attr("title", "退出全屏") : a.attr("title", "全屏")
	},
	onUndoLinkClicked: function(e){
		window.App.undo()
	},
	onRedoLinkClicked: function(e){
		window.App.redo()
	},
	onSaveLinkClicked: function(e){
		window.App.saveApp()
	},
	onDirectLinkClicked: function(e){		
		$(".btn-direct, .h-icon-direct", this.el).toggleClass("trans"), 
		window.App.toggleDeviceOrientation()
	},
	onDesignLinkClicked: function(e){
		var app = window.App;
		//判断当前是否为预览模式，且当前显示的page为临时添加的模板页（canDesign === false）
		if(app.isPreviewMode() && !app.canDesign()) return;
		$("body").toggleClass('design preview'),
		$(".btn-design, .h-icon-design", this.el).toggleClass("off"),
		app.setInterfaceMode($(".btn-design", this.el).hasClass("off") ? SETTINGS.InterfaceModes.PREVIEW : SETTINGS.InterfaceModes.DESIGN)
	},
	onChangeDeviceSize: function(a){
		window.App.setDeviceSize(SETTINGS.DeviceSizes[a])
	},
	/**
	 * 刷新工具栏按钮
	 * a, 标识是否设为“不可用”状态
	 */
	refreshToolbar: function(a){
		a ? $(".btn-undo, .h-icon-undo, .btn-redo, .h-icon-redo, .btn-save, .h-icon-save", this.el).removeClass("on").toggleClass("off", true) : (this._refreshUndoStyles(), this._refreshRedoStyles(), this._refreshSaveStyles())
		
	},
	_refreshUndoStyles: function(){
		var a = $(".btn-undo, .h-icon-undo", this.el);
		window.App._actionStack.length <= 0 ? a.removeClass("on").toggleClass("off", true) : a.removeClass("off").toggleClass("on", true)
	},
	_refreshRedoStyles: function(){
		var a = $(".btn-redo, .h-icon-redo", this.el);
		window.App._redoStack.length <= 0 ? a.removeClass("on").toggleClass("off", true) : a.removeClass("off").toggleClass("on", true)
	},
	_refreshSaveStyles: function(){
		$(".btn-save, .h-icon-save", this.el).removeClass("off").toggleClass("on", true)
	}

}),

PageView = UserView.extend({
	el: "#userview-page",
	initialize: function() {
		UserView.prototype.initialize.call(this, "pageview", "pageview")	
	},
	render: function() {
		//console.log("PAGE-VIEW: rendering");
		//重新设值_data.pages，父类UserView在render()时使用_data去加载模板数据
		var a = this._data.pages = window.App.getPages();
		//重新设值它的nodes
		for (var b in a) {
			a[b].initTreeNodes()
		}
		UserView.prototype.render.call(this),
		this.trigger("rendered")
	},
	events: {
		"click li.item": "onControlClicked",
		"click a.newpage": "onAddPageLinkClicked",
		"click a.share": "onShareLinkClicked",
		"click a.duplicate": "onDuplicateLinkClicked",
		"click a.delete": "onDeleteLinkClicked",
		"mouseover li.item": "onItemMouseOver",
		"mouseout li.item": "onItemMouseOut"
	},
	onControlClicked: function(a) {
		var b = $(a.currentTarget),
			c = b.data("cid");
		console.log("PAGE-VIEW: Control clicked:", c), a.stopPropagation(), this.trigger("controlClicked", c), this.selectControl(c)
	},
	onAddPageLinkClicked: function(e) {

		var a = $("#newpage-dialog"), b = this;

		if(!a.data("box")){
			a.box({
				title: "新增页面",
				modal: true,
				btnClose: $(".btn:last", a),
				close: function(){
					var dlg = $("#newpage-dialog");
					$(".error-tip", dlg).html(""), $("input[name=txt_pagename]", dlg).val("")
				},
				create: function(){

					$(".btn:first", a).click(function(){
						var tip = $(".error-tip", a), n = $.trim($("input[name=txt_pagename]", a).val());
						if(n === ""){
							tip.html(Utils.getTipWapper("请您输入页面名称；"));
							return;
						}
						
						b.trigger("pageAdded", n, function(d) {								
							a.close();
							setTimeout(function(){
								b.trigger("controlClicked", d.getId()), b._refreshScroll()
							}, 50)
						})
					})

				}
			})
		}
		a.open()
	},
	onShareLinkClicked: function(a){
		var b = this,
			c = $(a.currentTarget),
			d = c.closest("li"),
			f = d.data("cid"),
			g = $("#sharepage-dialog");
		a.stopPropagation();
		//, b.trigger("pageShared", f)
		if(!g.data("box")){
			g.box({
				title: "共享模板页",
				madal: true,
				btnClose: $(".btn:last", g),
				close: function(){
					var dlg = $("#sharepage-dialog");
					$(".error-tip", dlg).html(""), $("input", dlg).val("")
				},
				create: function(){
					$(".btn:first", g).click(function(){
						var tip = $(".error-tip", g), n = $.trim($("input", g).val());
						if(n === ""){
							tip.html(Utils.getTipWapper("请您输入页面名称；"));
							return;
						}
						
						b.trigger("pageShared", f, n, function(d) {
							g.close();
							//更新公共模板页数据
							window.App._views.materialview.putTemplatePage(d)
						})
					})
				}
			})
		}

		$("input", g).val($("> a > span", d).text())
		g.open()
	},
	// 复制
	onDuplicateLinkClicked: function(a) {
		var b = this,
			c = $(a.currentTarget),
			d = c.closest("li").data("cid");
		a.stopPropagation(), b.trigger("controlDuplicated", d, function(a) {
				b.trigger("controlClicked", a.getId()),
				b.refresh(),
				b._refreshScroll()
			})
	},
	onDeleteLinkClicked: function(a) {
		var b = this,
			c = $(a.currentTarget),
			d = c.closest("li"),
			e = d.data("cid");
		
		//jquery1.7.2版本中，return b.trigger("controlDeleted", e), !1会导致其点击事件冒泡。而jquery1.6.2正常。
		console.log("PAGE-VIEW: Deleting control", e), a.stopPropagation(), b.trigger("controlDeleted", e)
	},
	onItemMouseOver: function(a) {
		$(".button-container", a.currentTarget).removeClass("hidden")
	},
	onItemMouseOut: function(a) {
		$(".button-container", a.currentTarget).addClass("hidden")
	},
	//page删除后由Builder.js回调触发
	onPageDeleted: function() {
		var a = this._data.pages[0];
		this.render(),
		this.trigger("controlClicked", a.getId()),
		this._selectPage(a.getId())
	},
	/**
	 * 选取控件（包括pagecontrol）
	 * a, 控件ID
	 */
	selectControl: function(a) {
		var b = window.App.getControl(a);		
		return b && (b.getControlType() == "page" ? this._selectPage(a) : this._selectControl(a)), !1
	},
	_selectControl: function(a) {
		this._currentControlId = a;
		var b = $('li[data-cid="' + a + '"]', this.el);
		//确定选中的控件在pageview里是存在的（因为pageview不是显示所有的控件）
		return b.length > 0 && this._highlightText(b), !1
	},
	_selectPage: function(a) {
		this._currentPageId = a;
		var b = $('li[data-cid="' + a + '"]', this.el);
		$(".control", this.el).hide(), b.nextUntil(".page").removeClass("last").show().last().addClass("last"), this._highlightRow(b)
	},	
	_highlightRow: function(a) {
		this._toggleItemStyle($(".item", this.el), false),  this._toggleItemStyle(a, true)
	},
	_toggleItemStyle: function(a, b) {
		$(a).toggleClass("selected", b),
		$("> a > .b-icon", a).toggleClass("selected", b)
	},
	_highlightText: function(a) {
		this._toggleItemStyle($(".item.control", this.el), false), this._toggleItemStyle(a, true)
	},
	_refreshScroll: function() {
		var b = $(".b-c", this.el).get(0);
		b.scrollTop = b.scrollHeight
	},
	refresh: function() {
		console.log("PAGE-VIEW: refresh");
		this.render(),
		this._selectPage(this._currentPageId),
		this._selectControl(this._currentControlId)
	}
});
//_.extend(PageView, Backbone.Events);

ControlView = UserView.extend({
	el: "#userview-control",
	// _controlLookupMap: {},
	_data: {
		// WIDGETTABS 表示控件导航分类配置, 在settings.js中配置
		categories: [{
			name: SETTINGS.WIDGETTABS.toolsBar,
			id: "navigation",
			controls: [new PageHeaderControl, new PageFooterControl, new NavBarControl]
		},
		{
			name: SETTINGS.WIDGETTABS.button,
			id: "action",
			controls: [new ButtonControl, new LinkControl]
		},
		{
			name: SETTINGS.WIDGETTABS.content,
			id: "content",
			controls: [new HeadingControl, new ListViewControl, new TextBlockControl, new ImageControl/*, new VideoControl, new AudioControl, new CollapsibleSetControl, new GridControl, new GoogleMapsControl, new DataTableControl*/, new HtmlControl]
		},
		{
			name: SETTINGS.WIDGETTABS.form,
			id: "forms",
			controls: [/*new FormControl, */new TextInputControl, new TextAreaControl, new SelectControl/*, new SliderControl*/, new RadioButtonControl, new CheckboxControl, new SubmitButtonControl]
		}]
	},	
	initialize: function() {		
		UserView.prototype.initialize.call(this, "controlview", "controlview");
		// for (var a = 0; a < this._data.categories.length; a++) {
		// 	var b = this._data.categories[a];
		// 	for (var c = 0; c < b.controls.length; c++) {
		// 		var d = b.controls[c];
		// 		this._controlLookupMap[d.controlType] = d
		// 	}
		// };		
	},
	events: {
		"click .widget-tabs .button": "onTabClick"
	},
	render: function(){
		UserView.prototype.render.call(this),
		this.bindEvents();
	},
	// 切换分组控件
	onTabClick: function(a) {
		var b = $(a.currentTarget).data("category");
		b == "ALL" ? $(".icon-list li", this.el).show() : ($(".icon-list li", this.el).hide(), $('.icon-list li[data-category="' + b + '"]', this.el).show()),
		$(".widget-tabs .button", this.el).removeClass("active"),
		$(a.currentTarget).addClass("active");
	},
	bindEvents: function(){

		var a = window.App, d = $("#phone-drop");

		$(".icon-list > li", this.el).draggable({
			appendTo: "body",
			opacity: 0.5,
			cursorAt: {
				left: 2,
				top: 2
			},
			helper: function() {
				var a = $(":first", this).clone(),
				b = $('<div class="b-icon b-icon-add"></div>');
				return b.css({
					position: "absolute",
					top: "4px",
					left: "4px"
				}),
				$(a).append(b),
				a
			},
			start: function() {
				if(!a.canDesign()) return !1;
				//切换为编辑状态
				a.isPreviewMode() && $(".btn-design").click(),
				$("#phone-drop").removeClass("empty").show(),
				$(this).data("origPosition", $(this).position())
			},
			stop: function() {
				$("#phone-drop").addClass("empty").hide()
			},
			revert: "invalid"
		}),
		d.droppable({
			greedy: !0,
			tolerance: "pointer",
			activate: function(b, c) {
				//console.log("Phone drop activate")
				a.onDropActivate(b.originalEvent, c)
			},
			deactivate: function(b, c) {
				//console.log("Phone drop deactivate")
				a.onDropDeactivate(b.originalEvent, c)
			},
			over: function(b, c) {
				//console.log("Phone drop over")
				a.onDropOver(b.originalEvent, c)
			},
			out: function(b, c) {
				//console.log("Phone drop out")
				a.onDropOut(b.originalEvent, c)
			},
			drop: function(b, c) {
				a.onDrop(b.originalEvent, c)
			}
		}),
		d.mousemove(function(b) {
			if (a.isPreviewMode()) return;
			a._detachedControlEl && a._detachedControlEl.css({
				left: b.pageX + "px",
				top: b.pageY + "px"
			}),
			a.onDropTargetMouseMove(b)
		});

	}
});
//_.extend(ControlView, Backbone.Events);

MaterialView = UserView.extend({
	el: "#userview-material",
	_data: {
		tpls: [],
		pages: []
	},
	initialize: function() {		
		UserView.prototype.initialize.call(this, "materialview", "materialview");
		this._initTemplate()
	},
	events: {
		"click div.widget-tabs a.button": "onTabsClicked",
		"click li.item": "onItemClicked",
		"click li.item a.insert": "onInsertTemplateClicked",
		"click a.delete_tpl": "onDeleteTemplete",
		"mouseover li.item": "onItemMouseOver",
		"mouseout li.item": "onItemMouseOut"
	},
	render: function(){
		UserView.prototype.render.call(this)
		//,this.trigger("rendered")
	},
	onTabsClicked: function(e){
		var a = $(e.currentTarget);

		if(a.hasClass("active")) return;

		$("li > a", this.el).toggleClass("active"),
		$("ul.item-list", this.el).toggleClass("hidden")
	},
	onItemClicked: function(e){
		var a = $(e.currentTarget), b = a.data("cid"), c = a.index(), d = a.hasClass("tpl") ? this._data.tpls[c].code : this._stringifyTemplatePage(c);
		this._highlightRow(a), 
		this._preview(d), 
		this.trigger("previewed")
	},
	onInsertTemplateClicked: function(e){
		var a = $(e.currentTarget), b = a.closest("li.item"), c = b.index(), d = b.hasClass("tpl") ? this._data.tpls[c].code : this._stringifyTemplatePage(c);
		e.stopPropagation(),
		window.App.insertTemplate(d, a.attr("insert-default") === "true")
	},
	/**
	 * 为与系统模板接口一致，这里字符串化模板页的JSON
	 */
	_stringifyTemplatePage: function(a){
		var b = this._data.pages;
		return "[" + (b.length > 0 ? JSON.stringify(b[a].pbpgtemp_jsoncode) : "") + "]"
	},
	onItemMouseOver: function(a) {
		var b = window.App, 
			c = $(a.currentTarget),
			d = c.closest("li"),
			e = d.attr("data-lgnId");
		if(b.getLgnId() !== e){
			d.find(".delete_tpl").remove();
		}
		$(".button-container", a.currentTarget).removeClass("hidden")
	},	
	onItemMouseOut: function(a) {
		$(".button-container", a.currentTarget).addClass("hidden")
	},	
	onDeleteTemplete: function(a){ // 删除用户模版
		var b = window.App,
			c = $(a.currentTarget).closest("li"),
			d = this._data.pages,
			e = c.attr("data-pubid");
			
			//避免事件冒泡后，选中当前ITEM
			a.stopPropagation();
			
			Utils.confirm("确定要删除该模板吗？", function(){
				Utils.request({
					url: b.getSitePath() + "delPugPgTempPage.action",
					data: {
						"pubId" : e
					},
					success: function(data){
						if(data.result === true){
							//如果当前模板为选择状态，切换到设计模式，并选中第一个page
							c.hasClass("selected") && ($("#userview-page .page:first").trigger("click")),
							c.remove();
							//清除缓存数据
							for (var i = 0, j = d.length; i < j; i++) {
								if(d[i].pbpgtemp_id == e){
									d.splice(i, 1); //删除当前元素
									break;
								}
							};
						}else{
							Utils.alert("抱谦，删除失败，请稍候重试。");
						}
					}
				});
			})
	},	
	_preview: function(a){
		var app = window.App;
		
		app.previewTemplate(a),
		app.isPreviewMode() || $("#header a.btn-design").trigger("click")
		
	},	
	_highlightRow: function(a) {
		this._toggleRowStyle($("li.item", this.el), false),  this._toggleRowStyle(a, true)
	},
	_toggleRowStyle: function(a, b) {
		$(a).toggleClass("selected", b),
		$("> a > .b-icon", a).toggleClass("selected", b)
	},
	_initTemplate: function() {		
		this._loadTemplates(),
		this._loadTemplatePages(!1)
	},
	_loadTemplates: function(){
		var a = this;
		Utils.request({
			url: 'js/sys-tempate.json',
			// url: window.App.getSitePath() + "queryUserdefinedControl.action",
			loader: false,
			async: false,
			success: function(d){
				// console.log("MaterialView: templates loaded.", d);
				a._data.tpls = $.parseJSON(d)	
			}
		});
	},
	_loadTemplatePages: function(a, b){
		// var c = this;
		// Utils.request({
		// 	url: window.App.getSitePath() + "queryPublicPageTemplateList.action?token=" + Utils.getQueryParameter("token"),
		// 	loader: false,
		// 	async: a === undefined ? true : a === true,
		// 	success: function(d){
		// 		console.log("MaterialView: template pages loaded.", d);
		// 		c._data.pages = d;
		// 		$.isFunction(b) && b.call(this)
		// 	}
		// });
	},
	putTemplatePage: function(a){
		//把新共享的模板页插入到数据前面，然后重新渲染当前UI
		this._data.pages.splice(0, 0, a),
		this.render()
	}
});

PropertyView = UserView.extend({
	el: "#userview-property-content",
	initialize: function(a) {
		UserView.prototype.initialize.call(this, "propertyview", "propertyview")
	},
	render: function() {
		var b = $(this.el);
		$("#userview-property").hasClass("mCustomScrollbar") || $("#userview-property").mCustomScrollbar({
			autoHideScrollbar: true,
			scrollInertia: 500,
			theme: "dark",
			advanced:{
		        updateOnContentResize: true
		    }			
		});

		if (this._control) {
			var c = [], d = this._control.getPropertiesSorted(), f, g;
			for (var e = 0; e < d.length; e++) {
				f = d[e],
				f.property.renderWidget(),
				g = $(f.property.getRenderedWidget()),
				b.append(g)
			}
			console.log("PROPERTY-VIEW: rendered " + d.length + " properties")
		}
	},
	setControl: function(a){
		this._control = a
	},
	getControl: function(){
		return this._control
	}, 
	showRenderedProperties: function(a) {
		this._renderedProperties = a,
		this.render(),
		$("input:first", this.el).focus()
	},
	//添加附件（property items）后的处理事件
	onAttach: function() {
		if (this._control) {
			var a = this._control.getPropertiesSorted();
			for (var b = 0; b < a.length; b++) {
				var c = a[b];
				c.property.getWidget().onAttach()
			}
		}	
	},
	clear: function() {
		this._renderedProperties = "",
		this._control = null,
		$(this.el).empty()
	},
	refresh: function() {
		console.log("PROPERTY-VIEW: refresh");
		this.render(),
		this.onAttach()
	}
});
//_.extend(PropertyView, Backbone.Events);


