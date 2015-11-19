
Utils = {
	/**
	 * 获取string长度，中文按2个字节长度计算
	 */
	getStrLength: function(a) {
		var b = 0;
		if($.trim(a)){		  
		   b = $.trim(a).replace(/[^\x00-\xff]/g,"##").length
		}
		return b
	},
	/**
	 * 获取游览器URL中的查询参数
	 * a, 参数name
	 */
	getQueryParameter: function(a) {
		var c = location.href, b = "";
		c = c.replace("?", "?&").split("&");
		// console.log("after:" +c);
		for (i = 1; i < c.length; i++) {
			if (c[i].indexOf(a + "=") == 0) {
				b = c[i].replace(a + "=", "")
			}
		}
		return b
	},
	_alert: function(type, msg, classes, callback, context){
	
		var tpl = '<div id="$id" class="alert">'
				+   '<div class="content">';

		if(type === "error"){
			tpl+=    '<div class="icon1"></div><div class="icon2" style="background:none;font-size:38px;margin:2px 0 10px 15px;color:#ccc;">ERROR</div><div class="txt"></div>'
		}else{
			tpl+=    '<div class="icon"></div><div class="txt"></div>'
		}
				
			tpl+=   '</div>'
				+   '<div class="bottom">'
				+     '<div class="right buttons">'
				+       '<a class="btn btn-blue" href="javascript:void(0);">'
				+         '<div class="l"></div><div class="l-c">确定</div><div class="r"></div>'
				+       '</a>';
				
		if(type === "confirm"){		
			tpl+=       '<a class="btn btn-blue" href="javascript:void(0);">'
				+         '<div class="l"></div><div class="l-c">取消</div><div class="r"></div>'
				+       '</a>';
		}
		
			tpl+=     '</div>'
				+   '</div>'
				+ '</div>';
				
		var dialogSelector = "#alert_panel",
			dialog = null,
			dialogTitle = "提示",
			dialogClass = "alert-box";
			
		if(type === "error"){
			dialogSelector = "#error_panel",
			dialogTitle = "错误提示",
			dialogClass = "error-box"
		}else if(type === "confirm"){
			dialogSelector = "#confirm_panel",
			dialogClass = "confirm-box"
		}
		
		if(classes){			
			if(typeof classes === "function"){
				var _callback = callback;
				callback = classes;
				if(_callback && typeof _callback === "object"){
					context = _callback
				}
			}else if(typeof classes === "string"){
				dialogClass += " " + classes
			}			
		}
		
		dialog = $(dialogSelector),		
		dialog.length < 1 && ($(tpl.replace(/\$id/, dialogSelector.substring(1))).appendTo("body"), dialog = $(dialogSelector)),		
		dialog.data("box") || dialog.box({title: dialogTitle, modal: true, boxClass: dialogClass}),		
		dialog.find(".txt").html(msg);
		
		//询问窗仅点击“确定”进行回调
		if(type === "confirm"){
			dialog.find(".btn:last").unbind("click").click(function(){
				dialog.close()
			}),
			dialog.find(".btn:first").unbind("click").click(function(){
				dialog.close(), $.isFunction(callback) && callback.call(context || this, !0)
			})
		}else{
			dialog.find(".btn").unbind("click").click(function(){
				dialog.close(), $.isFunction(callback) && callback.call(context || this, !0)
			})
		}
 		
		dialog.open()
		
	},
	/**
	 * 显示错误弹出窗
	 * @param msg 需显示的信息
	 * @param callback 点击确定按钮后的回调方法
	 * @param context 回调函数的作用域，不指定默认为this
	 */
	error: function(msg, callback, context){
		Utils._alert("error", msg, callback, context)		
	},
	/**
	 * 普通提示窗
	 * @param msg 需显示的信息
	 * @param callback 点击确定按钮后的回调方法
	 * @param context 回调函数的作用域，不指定默认为this
	 */
	alert: function(msg, callback, context){
		Utils._alert("alert", msg, callback, context)
	},
	/**
	 * 询问提示窗
	 * @param msg 需显示的信息
	 * @param callback 点击确定按钮后的回调方法
	 * @param context 回调函数的作用域，不指定默认为this
	 */
	confirm: function(msg, callback, context){
		Utils._alert("confirm", msg, callback, context)
	},
	/**
     * 获取包装后的提示信息
     * @param msg
     */
	getTipWapper: function(msg){
		var tpl = '<div class="tip-wapper"><span class="tip-title">提示：</span><span class="tip-txt">$msg</span></div>';
		return tpl.replace(/\$msg/, msg || "")
	},
	routes: {},
	request: function(opt, ele, onclick, context){
		
		if (!opt || !opt.url) return;
		
		var key = "_" + encodeURIComponent(opt.url).replace(/[\/\.%!?&=]/g, ""), 
			route = Utils.routes[key] || {};
		
		//console.log(key, route);
		
		//避免重复发送请求
		if (opt.url === route.url && route.request) return;
		
		Utils.routes[key] = {url: opt.url, request: true};
		
		var loaderSelector = "#loader",
			loaderBackSelector = "#loader-back",
			loaderTpl = '<div id="loader" class="loader"><h1>请稍候，正在发送请求...</h1></div><div id="loader-back" class="loader-back"></div>',
			loader = opt.loader === undefined ? true : opt.loader === true,
			errorTip = (typeof opt.errorTip === "string" || typeof opt.errorTip === "object") ? opt.errorTip : false;
		
		if(errorTip && !$.isFunction(errorTip.html)){
			errorTip = $(errorTip)
		}
		
		$.ajax({
			url: opt.url,
			cache: opt.cache === undefined ? false : opt.cache === true,
			type: opt.type || "get",
			data: opt.data || {},
			dataType: opt.dataType || "json",
			timeout: opt.timeout || 60000,
			async: opt.async === undefined ? true : opt.async === true,
			beforeSend: function(b) {
				$.isFunction(opt.beforeSend) && opt.beforeSend.call(this, b),				
				//加入后台约定请求头，方便后台处理相关逻辑
				b.setRequestHeader("X-XMLHttpRequest", "AJAX"),
				//隐藏错误提示层
				errorTip && errorTip.html("").hide(),
				//去除元素绑定的click事件并添加disabled样式
				ele && $.isFunction(onclick) && $(ele).attr({"click": "", "disabled": "disabled"}).unbind("click").addClass("disabled"),
				//加入loader效果
				loader === true && ($(loaderSelector).length < 1 && $(loaderTpl).appendTo("body"), $(loaderSelector).css({top: $(window).height() / 2 + "px"}).show(), $(loaderBackSelector).show());
			},
			success: function(b) {
				if(b.code === "0"){
					$.isFunction(opt.success) && opt.success.call(this, b.data)
				}else if(b.code === "-1"){ //未知系统错误
					Utils.error("抱歉，服务器崩溃了，请稍候重试；")
				}else{ //其它异常
					errorTip ? errorTip.html( Utils.getTipWapper(b.msg) ).show() : Utils.error(b.msg) 
				}								
			},
			error: function(b, c, d) {
				Utils.error("抱歉，请求失败，请稍候重试；"), $.isFunction(opt.error) && opt.error.call(this, b, c, d)
			},
			complete: function() {
				//2012.12.28修改：不能延时删除Utils.routes[key]值，其可能会导致的问题：
				//1，Utils.request()参数async设为false时（即同步请求），其实际回调过程并不是真正的同步。
				//2，页面上快整点击不同菜单，可能使其上个页面中某个ajax请求被终止，导致其弹出错误窗口。
				delete Utils.routes[key],
				setTimeout(function(){
					if(ele && $.isFunction(onclick)){
						$(ele).removeClass("disabled").removeAttr("disabled").bind("click", function(){return onclick.call(context || window), !1})
					}
					if(loader === true){
						$(loaderSelector).hide(), $(loaderBackSelector).hide()
					}					
				}, 300)		
				$.isFunction(opt.complete) && opt.complete.call(this)
			}
		});
	},
	IdGiver: {
		_types: {},
		forceIncrement: function(a) {
			this._types.hasOwnProperty(a) || (this._types[a] = 0),
			++this._types[a]
		},
		give: function(a) {
			this._types.hasOwnProperty(a) || (this._types[a] = 0);
			var b = ++this._types[a];
			for (;;) {
				if (!window.App.getControl(a + b)) return b;
				b = ++this._types[a]
			}
		},
		giveRandom: function(a) {
			return this.forceIncrement(), a + parseInt(Math.random() * 1000000 + 1, 10)
		}
	},	
	UUID: function(){ // 生成uuid唯一标识码
		'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		})
	},
	
	/**
	 * 判断是否是URL
	*/
	ValidUrl: function(str){
		  var pattern = new RegExp('^(https?:\\/\\/)?'+ // 协议
		  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // 域名
		  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip地址
		  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // 端口和路径
		  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // 请求的字符串
		  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		  if(!pattern.test(str)) {
			return false;
		  } else {
			return true;
		  }
	},
	/**
     * 判断当前坐标是否在element内
     * a, 坐标对象
     * b, 可能坐标在其之内的对象
     */
    containsPoint: function (a, b) {
    	if(!a || !b || b.length <= 0) return;
        var c = b.offset(),
            d = b.outerWidth(),
            e = b.outerHeight(),
            f = this._getCalculatedMargin(b);
        if (f[3] < 0 && f[1] < 0) {
            if (a.pageX > c.left + d + -f[1] || a.pageX < c.left + f[3] || a.pageY > c.top + e || a.pageY < c.top) return !1
        } else if (a.pageX > c.left + d || a.pageX < c.left || a.pageY > c.top + e || a.pageY < c.top) return !1;
        return !0
    },
    _getCalculatedMargin: function (a) {
        if (a) {
            var b = parseInt(a.css("marginLeft"), 10),
                c = parseInt(a.css("paddingLeft"), 10),
                d = parseInt(a.css("marginTop"), 10),
                e = parseInt(a.css("paddingTop"), 10),
                f = parseInt(a.css("marginRight"), 10),
                g = parseInt(a.css("paddingRight"), 10),
                h = parseInt(a.css("marginBottom"), 10),
                i = parseInt(a.css("paddingBottom"), 10);
            return [d + e, f + g, h + i, b + c]
        }
        return [0, 0, 0, 0]
    }
},
BuilderDeviceGlue = {
	_builder: null,
	_device: null,
	_deviceSelector: "#phone iframe",
	initFromDevice: function(a) {
		this._device = a
	},
	/*initFromBuilder: function(a, b) {
		this._builder = a,
		this._deviceSelector = b
	},*/
	getDeviceWindow: function() {
		return this._deviceWindow ? this._deviceWindow: (this._deviceWindow = $(this._deviceSelector).get(0).contentWindow, this._deviceWindow)
	},
	getDeviceFromBuilder: function() {
		return this._device
	},
	getBuilderFromDevice: function() {
		return this._builder ? this._builder: (this._builder = window.App, this._builder)
	}
},
Builder = Backbone.View.extend({
	_document: {
		root: null,
		lookup: {},
		resouces: {}
	},
	_views: {},
	_currentOrientation: SETTINGS.DeviceOrientation.PORTRAIT,
	_currentInterfaceMode: SETTINGS.InterfaceModes.DESIGN,
	_currentDeviceSize: SETTINGS.DeviceSizes._320x480,
	_currentPage: null,
	_actionStack: [],
	_redoStack: [],
	_internalActionCount: 0,
	_lastSavedAction: 0,
	_device: null,
	_isUiInited: !1,
	_isLoading: !1,
	_dragDropType: null, //当前拖拽的控件类型
	_sitePath: null,
	_interimStack: [], //保存当前临时添加的page
	_canDesign: !0,
	_backUrl: null,
	_saveUrl: null,
	_LgnId:null,
	initialize: function() {
		console.log("BUILDER: initializing");
	},
	render: function(){	
		this._renderHeaderView(),
		this._renderPageView(),
		this._renderControlView(),
		this._renderMaterialView(),
		this._renderPropertyView(),
		this._initAccordion(),
		this._isUiInited = !0,
		this._backUrl = unescape(Utils.getQueryParameter("backurl")),
		this._saveUrl = unescape(Utils.getQueryParameter("saveurl")),
		this._LgnId = Utils.getQueryParameter("lgnId")
	},
	canDesign: function(){
		return this._canDesign
	},
	getDocument: function(){
		return this._document
	},
	getLoadedApp: function(){
		return this._document.root
	},
	isUiInited: function(){
		return this._isUiInited
	},
	isLoading: function(){
		return this._isLoading
	},
	//设置应用模式（编辑、预览）
	setInterfaceMode: function(a) {
		this._currentInterfaceMode = a,
		//触发modeChanged事件
		this.trigger("interfaceModeChanged")
	},
	getInterfaceMode: function() {
		return this._currentInterfaceMode
	},
	isPreviewMode: function() {
		return this._currentInterfaceMode === SETTINGS.InterfaceModes.PREVIEW
	},
	//设置应用当前page
	setCurrentPage: function(a) {
		var b = this._document.lookup[a];
		//通知Deive切换page
		this._device._setCurrentPage(a),
		this._currentPage = b
	},
	getCurrentPage: function() {
		return this._currentPage
	},
	setSelectedControl: function(a) {
		this._selectedControl = a
	},
	getSelectedControl: function() {
		return this._selectedControl
	},
	//根据id获取当前document的control
	getControl: function(a) {
		return this._document.lookup[a]
	},
	//索引control
	indexControl: function(a) {
		this._document.lookup[a.getId()] = a
	},
	unindexControl: function(a) {
		delete this._document.lookup[a.getId()]
	},
	getPageView: function(){
		return this._views.pageview
	},
	getPropertyView: function(){
		return this._views.propertyview
	},
	//获取所有的page对象
	getPages: function() {
		return this._document.root ? this._document.root.getChildren() : []
	},	
	_renderHeaderView: function(){
		this._views.headerview = new HeaderView
	},
	_renderPageView: function(){
		var a = this, b;
		b = new PageView(),
		b.render(),
		b.bind("controlClicked", a.onControlClicked, this),
		b.bind("pageAdded", a.onPageAdded, this),
		b.bind("controlDeleted", a.onControlDeleted, this),
		b.bind("controlDuplicated", a.onControlDuplicated, this),
		b.bind("pageShared", a.onPageShared, this),
		b.bind("rendered", a.onPageViewRendered, this),
		this._views.pageview = b
	},
	_renderControlView: function(){
		var a = new ControlView();
		a.render(),
		this._views.controlview = a
	},
	_renderMaterialView: function(){
		var a = new MaterialView();
		a.render(),
		//a.bind("rendered", this.onMaterialViewRendered, this),
		a.bind("previewed", this.onTemplatePreviewed, this),
		this._views.materialview = a
	},
	_renderPropertyView: function(){
		var a = new PropertyView();
		a.render(),
		this._views.propertyview = a
	},
	_initAccordion: function(){

		_expand();
		
		$("#b-l-c").delegate("div.b-h", "click", function(e){
			_expand($(this).parent())
		});

		$(window).bind("resize", function(){
			_expand()
		});

		function _expand(target){
			var a = $("#b-l-c"), 
				b = $("> div.userview", a), 
				c = $(target || b[0]), 
				d = c.index(),
				e = a.height();

			//if(c.attr("expand") === "true") return;

			b.each(function(i, n){
				var g = $(n);

				if(i <= d){// top
					g.css({top: 32 * i})
				}else{// buttom
					g.css({top: e - 32 * (b.length - i)})
				}
			
				g.toggleClass("expand", i == d).find("div.b-h > span").toggleClass("selected", i === d)				
			})
		};

	},
	onPageViewRendered: function(){
		var a = $("#userview-page"), b = this._interimStack, c = {};
		//第一个page为首页，不可删
		$(".page:first .delete", a).remove();		

		for (var i = 0; i < b.length; i++) {
			c[b[i]] = true;
		};

		//标识当前是否可切换为编辑模式
		this._canDesign = !c.hasOwnProperty(this._currentPage.getId());
		
	},
	onMaterialViewRendered: function(){
		//this._refreshUserViewHeight()
	},
	initEvents: function(){
		var a = this;
		this.bind("appLoading", function(b) {
			console.log("BUILDER: app loading"),
			a._isLoading = !0			
		}),
		this.bind("appLoaded", function(b) {
			console.log("BUILDER: app loaded"),
			a._device.initAppPages(a._document.root),
			setTimeout(function() {
				a.hiddenDropTip(),			
				//默认选取第一个page（激活并渲染它的child control）
				a.onControlClicked(b || a._document.root.children[0].getId()),
				a._isLoading = !1
			}, 10)
		}),
		this.bind("interfaceModeChanged", function(b) {
			a._updateInterfaceMode()
		})
	},
	bindShortcuts: function() {
		var a = this;
		key("ctrl+z", function() {
			a.undo()
		}),
		key("ctrl+y", function() {
			a.redo()
		}),
		key("+z", function() {
			a.undo()
		}),
		key("+y", function() {
			a.redo()
		})
	},
	bindDeviceEvents: function() {
		var a = this;
		this._device.bind("controlSelected", function (b) {
			var c = a._document.lookup[b];
			if (!c) {
				console.error("Clicked control but unable to find it in document!");
				return
			}
			a.onControlSelected(c)
		}),
		this._device.bind("controlMoved", function (b, c, d, e) {
			if (d === e) return;
			var f = a.getControl(b);
			if (!f) {
				console.error("Tried to move control that doesn't exist!");
				return
			}
			a.moveControl(f, c, d, e)
		}),
		this._device.bind("pageChanged", function (b) {
			a.isLoading() || (a.getPageView()._selectPage(b), a.setCurrentPage(b), a._device.refreshPage())
		});
	},
	onControlDeselected: function(a) {
		if (!this.isUiInited()) return;
		this.onAllControlsDeselected()
	},
	//去除所有控件的选取状态
	onAllControlsDeselected: function() {
		if (!this.isUiInited()) return;
		this.hidePropertyDialog(),
		this.getPropertyView().clear(),
		this._device.onAllControlsDeselected()
	},
	/**
	 * 判断控件是否可选取的
	 * a, 控件对象
	 */
	isSelectableControl: function(a) {
		var b = a.getControlType();
		return ! {
			app: 1,
			gridblock: 1,
			pagecontent: 1,
			collapsiblecontent: 1,
			checkbox: 1,
			radio: 1,
			splitprimary: 1,
			splitsecondary: 1
		}.hasOwnProperty(b)
	},
	/**
	 * 选中控件
	 * a, 控件对象
	 */
	onControlSelected: function(a) {		
		if (!this.isUiInited() || !this.isSelectableControl(a) || this.isPreviewMode()) return;
		var b = this.getPropertyView();
		this.onAllControlsDeselected(),
		this.setSelectedControl(a),
		this.getPageView().selectControl(a.getId()),		
		b.setControl(a),
		b.render(),
		this.showPropertyDialogForControl(a),
		this._device.onControlSelected(a)
	},
	/**
	 * 点击page item
	 * a, data-cid
	 */
	onControlClicked: function(a) {
		var b = this._document.lookup[a], c = this._interimStack, d = {};
		
		//this.isPreviewMode() && $("#header a.btn-design").click(),

		for (var i = 0; i < c.length; i++) {
			d[c[i]] = true;
		};

		b.getControlType() == "page" && (this._device.showPage(a), this._currentPage = b, this._canDesign = !d.hasOwnProperty(b.getId())),
		//删除预览时添加的page
		this.emptyInterimStack(),
		this._canDesign && (this.deselectPreviewTemplate(), this.isPreviewMode() && $("a.btn-design", this._views.headerview.el).trigger("click")),
		this.onControlSelected(b)
	},
	/**
	 * 新增page
	 * a, 名称
	 * b, 回调函数
	 */
	onPageAdded: function(a, b) {
		var c = this.addPage(a);
		$.isFunction(b) && b(c)
	},
	/**
	 * 删除control
	 * a, data-cid
	 * b, 
	 */
	onControlDeleted: function(a, b) {
		var c = this.getControl(a);
		if (!c) return;
		this.removeControl(c, b)
	},
	/**
	 * 复制page
	 * a, data-cid
	 * b, 回调函数
	 */
	onControlDuplicated: function(a, b) {
		var c = this.getControl(a);
		if (c) {
			var d = this.duplicateControl(c);
			$.isFunction(b) && b(d)
		}
	},
	/**
	 * 共享page
	 * a, data-cid
	 * b, 页面名称
	 * c, 回调
	 */
	onPageShared: function(a, b, c){
		var d = this.getControl(a);
		if(d){
			this.savePage(d, b, c)
		}
	},
	//device初始化完成后回调过来，初始化UI等
	onDeviceReady: function(){
		console.log("BUILDER: on device ready"),
		window.scrollTo(0, 0),		
		this._device = BuilderDeviceGlue.getDeviceFromBuilder(),
		this.bindDeviceEvents(),
		this.bindShortcuts(),
		this.render(),
		this.initEvents(),
		this._deviceInited = !0,
		this.trigger("appInited")		
	},	
	_updateInterfaceMode: function() {
		switch (this._currentInterfaceMode) {
			case SETTINGS.InterfaceModes.DESIGN:
				this._changeToDesignMode();
				break;
			case SETTINGS.InterfaceModes.PREVIEW:
				this._changeToPreviewMode();
				break;
		}
	},
	_changeToDesignMode: function() {
		this.bindDeviceEvents(),
		this._device.designModeHint(),
		this._currentPage && this.onControlClicked(this._currentPage.getId()), //重新选择当前page以便更新设计器UI
		this._isInspectorShowing = !1,
		this._views.headerview.refreshToolbar()
	},
	_changeToPreviewMode: function() {		
		this.onAllControlsDeselected(),		
		this._device.previewModeHint(),		
		this._isInspectorShowing = !1,
		this._views.headerview.refreshToolbar(!0)
	},	
	//拖动激活
	onDropActivate: function(a, b) {
		console.log("BUILDER: drop activate")
	},
	//拖动释放
	onDropDeactivate: function() {
		console.log("BUILDER: drop deactivate"),
		this.onDropFinished()
		this._selectedContainer = null
	},
	onDropOver: function(a, b) {
		console.log("BUILDER: drop over");
		var c = $(b.draggable).data("cid");
		this._dragDropType = c,
		this._device.startDragDrop(c)
	},
	onDropOut: function(a, b) {
		console.log("BUILDER: drop out"),
		this._dragDropType = null,
		this._device.stopDragDrop(),
		this.onDropFinished()
		this._selectedContainer && this._selectedContainer.onDragOut(),
		this._selectedContainer = null
	},
	onDrop: function(a, b) {	
		if (!this._selectedContainer) return;
		//var c = Metrics.start(),
		var d = $("#phone .content"),
		e = d.offset(),
		f = a.pageX - e.left,
		g = a.pageY - e.top,
		h = BuilderDeviceGlue.getDeviceWindow(),
		i = h.pageYOffset,
		j = {
			x: f,
			y: Math.max(g + i, 0)
		};
		//console.log("Dropped over container", this._selectedContainer);
		var k = $(b.draggable).data("cid");
		console.log("BUILDER: dropped %s over container %s", k, this._selectedContainer.getId()),
		b.helper.remove();
		//var l = Metrics.start(),
		var m,
		n,
		o = !1,
		p = !1;
		/*if (this._isPersistentType(k)) {
			if (!this._verifySinglePersistentType(this._selectedContainer, k)) return;
			var q = this._makePersistentCopy(k);
			q ? (m = q[0], n = q[1], p = !0) : (m = ControlFactory.newControl(k), o = !0)
		} else m = ControlFactory.newControl(k);*/
		m = ControlFactory.newControl(k);
		//var r = Metrics.end(l);
		//console.log("Cloned control in " + r + "ms"),
		this.onDropFinished(),
		this.addControl(m, this._selectedContainer, j, !0), 
		this._selectedContainer = null,
		this._device.scrollToControl(m),
		m.controlType !== "page" && m.controlType !== "pagecontent" ? this.onControlSelected(m) : this.onAllControlsDeselected()		
		//o && (this._document.persistent[m._id] = 1),
		//p && n && this._recordAlias(n, m);
		//var s = Metrics.end(c);
		//console.log("Added control - " + s + "ms")
	},
	/**
	 * 拖拽的控件在目标容器移动时的事件（用于获取当前鼠标下的容器控件等）
	 */
	onDropTargetMouseMove: function(a) {
		
		if(!this._currentPage) return;
		var b = $("#phone .content"),
		c = b.offset(),
		d = a.pageX - c.left,
		e = a.pageY - c.top,
		f = $("#phone-drop").offset(),
		g = $("#phone-drop").height(),
		h = g - 60,
		i = BuilderDeviceGlue.getDeviceWindow(),
		//2013.01.04修改：修正IE8下，如果存在pagefooter控件的话，其它控件只能拖放到pagefooter内的BUG；
		//原因是i.pageYOffset取到的值是undefined，导致其在判断坐标是否在该控件内时都会返回true，而pagefooter是page里的最后一个容件控件，所以。。。
		j = i.document.documentElement.scrollTop || i.pageYOffset || i.document.body.scrollTop;		
		//ie8下用console.log()输出日志信息，这里直接假死。。。
		//console.log("BUILDER: onDropTargetMouseMove %d, %d, %d, %d", a.pageX, a.pageY, c.left, c.top);		
		//$("#property-dialog .overview").append("\nX:" + a.pageX + ", Y:" + a.pageY + ", left:" + c.left + ", top:" + c.top + ", scrollTop:" + j);		
		e > h ? this._device.scrollDown() : e < 60 ? this._device.scrollUp() : this._device.stopScrolling(),
		this._currentPage.getDeviceRenderedEl().is(":visible") || (console.error("Current page was hidden. Showing it"), this._device.showPage(this._currentPage.getId()));
		var k = this._getContainerUnderMouse({
			x: d,
			y: Math.max(e + j, 0)
		});
		k && (k != this._selectedContainer && this._selectedContainer && this._selectedContainer.onDragOut(), k.onDragOver({
			x: d,
			y: Math.max(e + j, 0)
		},
		this._dragDropType), this._selectedContainer = k, this._device.repositionCurrentSelector())
	},
	onDropFinished: function() {
		var a = BuilderDeviceGlue.getDeviceWindow();
		a.$(".cfwx-control.selected").removeClass("selected"),
		this._selectedContainer && this._selectedContainer.onDropFinished()
	},
	/**
	 * 获取当前鼠标位置下的容器
	 * a, 坐标对象
	 */
	_getContainerUnderMouse: function(a) {
		var b = this._controlContainsIterative(this._currentPage, a);
		return b
	},
	_controlContainsIterative: function(a, b) {
		var c = [],
			d,
			e;
		c.push(a);
		while (c.length) {
			d = c.shift(); //删除第一个元素并返回它
			//遍历当前控件的子控件
			for (var f = 0; f < d.children.length; f++) {
				var g = d.children[f];
				//如果当前控件是容器，判断当前坐标是否在它之内，如果是，向数组插入它（实现递归检索它的子控件）
				g.isContainer() && g.containsPoint(b) && (e = g, c.splice(0, 0, g))
			}
		}
		return e
	},
	//
	documentChanged: function(){
		
	},
	//给新增到device的控件绑定事件
	_bindAddControlEvents: function(a){
		var b = this;
		if (a.hasAlreadyAfterBound()) return;
		/**
		 * 控件属性更新后触发
		 * a, control
		 * c, 标识是否重新渲染PropertyView（当控件的属性类型为ArrayProperty时，它的item变更时，需重新渲染）
		 * d, 
		 */
		a.bind("controlUpdated", function(a, c, d) {
			//应用初始化时，不处理。（pagefooter控件在初始化时，重绘propertyview时有错，主要是dialog没生成）
			if(b.isLoading()) return;
			b._device.updateControl(a),
			b.documentChanged(),
			c && b.getPropertyView().refresh(),
			b.getPageView().refresh()
		}),
		a.bind("propertyChanged", function(c, d, e) {
			b.pushAction({
				action: SETTINGS.ActionTypes.PROPERTY_FORWARD,
				reaction: SETTINGS.ActionTypes.PROPERTY_BACK,
				control: a,
				property: c,
				oldValue: d,
				newValue: e
			})
		}),
		a.bind("controlRendered", function() {
			console.log("BUILDER: control rendered", this.getId());
			//控件在渲染时，是从里到外的（先渲染它的子控件），仅当controlType == "page"时才刷新pageview
			b._device.onControlRendered(this), this.getControlType() == "page" && b.getPageView().refresh()
		}),
		a.bind("childAdded", function(a) {
			console.log("BUILDER: child added", a.getId(), a),
			b._document.lookup[a.getId()] = a,
			//b.getPageView().refresh(), //这里不需刷新pageview，因为在controlRendered时，pageview会被刷新
			b._bindAddControlEvents(a)
		}),
		a.bind("childRemoved", function(a) {
			a.getControlType() != "page" && b.getPageView().refresh(),
			delete b._document.lookup[a.getId()]		
		})
	},
	_calculateOffsetContentMovePosition: function(a, b) {
		for (var c = 0; c < a.children.length; c++) {
			var d = a.children[c];
			if (d.getAppendMode() === SETTINGS.ControlAppendMode.PAGE_PREPEND) b++;
			else break
		}
		return b
	},
	_moveControl: function(a, b, c, d) {
		var e = this._calculateOffsetContentMovePosition(b, d);
		b.moveChild(a, e),
		console.log("Moved child", a, "of parent", b, "to position", d),
		this._device.updateControl(b),
		this.documentChanged()
	},
	moveControl: function(a, b, c, d) {
		var b = a.getParent();
		this.pushAction({
			action: SETTINGS.ActionTypes.MOVE_FORWARD,
			reaction: SETTINGS.ActionTypes.MOVE_BACK,
			control: a,
			parent: b,
			oldPosition: c,
			newPosition: d
		}),
		this._moveControl(a, b, c, d)
	},
	/**
	 * 清除控件的子控件
	 * a, 要清除子控件的控件对象
	 */
	_cleanupChildrenFromRemovedControl: function(a) {
		var b = [], c;
		b.push(a);
		while (b.length) {
			c = b.shift(),
			delete this._document.lookup[c.getId()];
			for (var d = 0; d < c.children.length; d++) {
				var e = c.children[d];
				b.splice(0, 0, e)
			}
		}
	},
	/**
	 * 删除控件
	 * a, 要删除的控件对象
	 */
	_removeControl: function(a) {
		var c = this.getPages();
		var foundControl = this._document.lookup[a.getId()];
		if (!foundControl) {
			console.error("Unable to find control", a.getId(), " in document lookup map!"),
			this.onAllControlsDeselected();
			return
		}
		//this._cleanupChildrenFromRemovedControl(foundControl), //清除子控件后，还原时，pageview的节点无法选取
		delete this._document.lookup[a.getId()],
		a.getParent() ? a.getParent().removeChild(a) : console.error("Null parent control on child removal!");
		if (a.getControlType() === "page") {
			if (c.length > 0) {
				var d = c[0];
				this.onAllControlsDeselected(),
				this.setCurrentPage(d.getId())
			} else console.error("Tried to switch to page on page delete but none exist!");
			var e = this;
			setTimeout(function() {
				e._device.removeControl(a),
				e.onControlDeselected(a),
				e.documentChanged(),
				e.getPageView().onPageDeleted()
			},
			150)
		} else this._device.removeControl(a), this.onControlDeselected(a), this.documentChanged()
	},
	/**
	 * 删除控件
	 * a, 要删除的控件对象 
	 */
	removeControl: function(a) {
		this.pushAction({
			action: SETTINGS.ActionTypes.REMOVE,
			reaction: SETTINGS.ActionTypes.ADD,
			control: a,
			parent: a.getParent()
		}),
		this._removeControl(a, b)
	},
	removeSelectedControl: function() {
		var a = this.getSelectedControl();
		a && this.removeControl(a)
	},
	/**
	 * 改变控件的属性值
	 * a, 控件对象
	 * b, 控件属性对象
	 * c, 属性值
	 */
	_changeProperty: function(a, b, c) {
		var d = this._views;
		console.log("BUILDER: changing property", a.getId(), b.getName(), c),
		b.setValue(c, !0),
		this._device.updateControl(a),
		d.pageview.refresh(),
		d.propertyview.refresh()
	},
	/**
	 * 复制控件
	 * a, 被复制的控件对象 
	 */
	duplicateControl: function(a) {
		var b = a.getParent(),
		c = a.cloneControl(!1),
		d = $.trim(c.title.getValue()) || a.getId();
		return c.title.setValue(d + " 副本"), //设置复制后的控件的显示名称（即它的title属性值）
		this._bindAddControlEvents(c),
		c.setAlreadyAfterBound(!0),
		this.addControl(c, b),
		c.getControlType() == "page" && (this._currentPage = c),
		this.indexControl(c),
		this._duplicateIndexControls(c),
		c
	},
	/**
	 * 获得复制后的控件对象
	 * a, 被复制的控件对象 
	 */
	getDuplicatedControl: function(a) {
		var b = a.cloneControl(!0);
		return this._bindAddControlEvents(b),
		b.setAlreadyAfterBound(!0),
		this.indexControl(b),
		this._duplicateIndexControls(b),
		b
	},
	/**
	 * 索引复制的控件的子控件
	 * a, 复制后的控件对象 
	 */
	_duplicateIndexControls: function(a) {
		for (var b = 0; b < a.children.length; b++) {
			var c = a.children[b];
			this.indexControl(c),
			this._bindAddControlEvents(c),
			c.setAlreadyAfterBound(!0),
			this._duplicateIndexControls(c)
		}
	},
	_userAddedControl: function(a) {
		this._device.scrollToControl(a),
		a.controlType !== "page" && a.controlType !== "pagecontent" ? this.onControlSelected(a) : this.onAllControlsDeselected()
	},
	/**
	 * 添加control到目标容器
	 * a, control
	 * b, container
	 * c, point
	 * d, 标识是否验证当前容器是否接收子控件
	 * e, 增量，标识当前容器的控件数
	 */
	_addControlToContainer: function(a, b, c, d, e) {
		console.log("BUILDER: adding control to container", a, b, c, d, e);
		if (!b) return; 
		!d || d && b.acceptControl(a) ? (this._device.addControlToContainer(a, b, c), this._document.lookup[a.getId()] = a) : this._addControlToContainer(a, b.getParent(), c, d, e + 1)
	},
	_addControl: function(a, b, c, d) {
		console.log("BUILDER: adding control", a, b, c, d);
		if(b){
			this._bindAddControlEvents(a), 
			a.hasAlreadyAfterBound() || (a.onAfterBind(), a.setAlreadyAfterBound(!0)), 
			this._addControlToContainer(a, b, c, d, 1)
		}else{
			this._bindAddControlEvents(a), 
			a.hasAlreadyAfterBound() || (a.onAfterBind(), a.setAlreadyAfterBound(!0)), 
			this._device.addControl(a), 
			a.controlType !== "page" && a.controlType != "pagecontent" ? this.onControlSelected(a) : this.onAllControlsDeselected()
		}
	},
	/**
	 * 与_addControl不同，该方法不调用control.onAfterBind()
	 */
	_addControlFromObject: function(a, b, c, d) {
		console.log("BUILDER: adding control", a, b, c, d);
		if(b){
			this._bindAddControlEvents(a), 
			a.hasAlreadyAfterBound() || a.setAlreadyAfterBound(!0), 
			this._addControlToContainer(a, b, c, d, 1)
		}else{
			this._bindAddControlEvents(a), 
			a.hasAlreadyAfterBound() || a.setAlreadyAfterBound(!0), 
			this._device.addControl(a)
		}
	},
	addControl: function(a, b, c, d) {
		this.pushAction({
			action: SETTINGS.ActionTypes.ADD,
			reaction: SETTINGS.ActionTypes.REMOVE,
			control: a,
			parent: b ? (b.acceptControl(a) ? b : b.getParent()) : b, //当前选择的容器不一定有效（header在渲染时，不在pagecontent容器内），还原时有问题。
			point: c
		}),
		this._addControl(a, b, c, d)
	},
	addPage: function(a) {
		var b = new PageControl;
		b.title.setValue(a),
		this.addControl(b, this._document.root),
		this._currentPage = b;
		var c = new PageContentControl;
		return this.addControl(c, b),
		this.onAllControlsDeselected(),
		this.getPageView().refresh(),
		b
	},
	addPageControl: function(a) {
		return this._currentPage || (this._currentPage = a),
		this._addControl(a, this._document.root),
		this.onAllControlsDeselected(),
		this.getPageView().refresh(),
		a
	},	
	//验证是否为JSON
	_isValidJSON: function(a) {
		if ($.trim(a) == "") return ! 1;
		var b = null;
		try {
			b = JSON.parse(a)
		} catch(c) {
			return console.error("Invalid data, unable to parse", a),
			!1
		}
		return b ? !0 : !1
	},
	/**
	 * 新增AppControl
	 * a, id
	 * b, 初始化的json对象
	 */
	_newAppFromObject: function(a, b) {
		var d = new AppControl;
		return d.initFromSerialized(b), d
	},
	/**
	 * 新增PageControl
	 * a, 初始化的json对象
	 * b, 插入控件时的插入索引
	 */
	_newPageFromObject: function(a, b) {
		var d = new PageControl;
		return d.initFromSerialized(a),
			typeof b === "number" ? this._document.root.insertChild(d, b) : this._document.root.addChild(d),
			this._document.lookup[d.getId()] = d,
			this.addControl(d),
			this._currentPage = d,
			d
	},
	openFromObject: function(a){
		//if (!this._isValidJSON(JSON.stringify(a))) return;
		console.log("BUILDER: new app");
		var b = this, d = a.doc; // app node
		if (!d) {
			Utils.alert("Unable to load app.");
			return
		}

		this._document.root = this._newAppFromObject(d.id, d);

		//新增模板时，填写了模板信息，确定后，没有点击保存按钮就直接退出时，其children为[]
		if(d.children.length === 0){

			var g = this.addPage("首页");
			Utils.IdGiver.forceIncrement("page"),
			this._openFromObjectRoot(g, null, this._document.root)

		}else{

			for (var e = 0; e < d.children.length; e++) {
				var f = d.children[e], g = this._newPageFromObject(f);
				Utils.IdGiver.forceIncrement("page"),
				this._openFromObjectRoot(g, f, this._document.root)
			}

		}

		//2013.06.18增加定时自动保存，避免长时间没有和后台交互，导致其超时
		// setInterval(function(){
		// 	b.saveApp({
		// 		loader: false,
		// 		success: function(){
		// 			var $msgBox = $("#msgBox"), 
		// 				now = new Date();

		// 			$msgBox.html(now.getHours() + ":" + now.getMinutes() + " 数据自动保存成功。").show(),

		// 			setTimeout(function(){ $msgBox.hide() }, 2 * 1000)
		// 		}
		// 	})

		// }, 5 * 60 * 1000)
					
		//this.trigger("appLoaded")

	},
	_openFromObjectRoot: function(a, b, c, d){
		a.getControlType() != "page" && this._addControlFromObject(a, c);

		if(!b || !b.children) return;

		var giver = Utils.IdGiver;

		for (var i = 0; i < b.children.length; i++) {			
			var e = b.children[i], 
				//传递多一个参数过去，为了让heading控件不添加“title”属性
				f = ControlFactory.newControl(e.type, e.type == "heading" && b.type != "pagecontent" ? !0 : !1);
			
			if (!f) continue;

			//标识是否重设其控件ID（插入模板时会传递true过来）
			if(d){
				e.id = giver.giveRandom(e.type);
				//2013.03.14修改，可折叠文本、单选按钮、复选按钮控件需更新其父容器collapsible的propertype值
				if(e.type == "collapsiblecontent"){
					b.properties.sections[i]._controlId = e.id
				}else if(e.type == "radio" || e.type == "checkbox"){
					b.properties.items[i]._controlId = e.id
				}
			}else{
				giver.forceIncrement(e.type)
			}
			
			//d ? (e.id = giver.giveRandom(e.type)) : giver.forceIncrement(e.type), 
			f.initFromSerialized(e, d),
			console.log("BUILDER: \tAdding child %s from %s", f.getId(), a.getId()),
			this._openFromObjectRoot(f, e, a, d)
		}
	},
	deselectPreviewTemplate: function(){
		var a = this._views.materialview;
		$("li.item", a.el).removeClass("selected")
	},
	/**
	 * 预览模板完成时触发的事件
	 */
	onTemplatePreviewed: function(){
		console.log("BUILDER: onTemplatePreviewed")
		var a = this._views.pageview, b = this._interimStack, c = {};

		for (var i = 0; i < b.length; i++) {
			c[b[i]] = true
		};

		$("li.item", a.el).each(function(i, n){
			var d = $(n);
			//去除之前选定的item样式，并且隐藏新增的item
			d.hasClass("page") ? (d.removeClass("selected"), $("> a > div.b-icon", d).removeClass("selected"), c.hasOwnProperty(d.data("cid")) && d.hide()) : d.hide()
		})
	},
	/**
	 * 清空预览模板时添加的page栈
	 */
	emptyInterimStack: function(){
		console.log("BUILDER: emptyInterimStack")
		var a = this._interimStack, b;
		for (var i = 0; i < a.length; i++) {
			b = this.getControl(a[i]);
			delete this._document.lookup[a[i]],
			b && b.getParent() && b.getParent().removeChild(b)
		};
		this._interimStack = []
	},
	/**
	 * 预览模板
	 * a, 模板json字符串
	 */
	previewTemplate: function(a){
		this._insertTemplate(a, !0)
	},
	/**
	 * 插入模板
	 * a, 模板json字符串
	 * b, 标识是否把模板设为首页
	 */
	insertTemplate: function(a, b){
		this._insertTemplate(a, !1, b),
		$("#userview-page div.b-h div.l-c").trigger("click")
	},
	/**
	 * 插入模板
	 * a, 模板json字符串
	 * b, 标识是否把当前模板添加到临时栈，表明它是预览的
	 * c, 标识是否把模板设为首页
	 */
	_insertTemplate: function(a, b, c){
		console.log("BUILDER: insert template");
		if(!a){
			Utils.alert("Unable insert to template.");
			return
		}

		var loader = $("#loader"), loaderBack = $("#loader-back"), giver = Utils.IdGiver, jsonStr = a, pages = $.parseJSON(a);

		//this.emptyInterimStack(),
		loader.css({ top: $(window).height() / 2 + "px" }).show(),
		loaderBack.show(),
		this.trigger("appLoading");

		//多页面模板时，可能存在页面间的引用，这里得先处理页面的URL引用问题。
		for (var i = 0; i < pages.length; i++) {
			var d = pages[i], e = giver.giveRandom(d.type);
			//替换原有的json字符串里的pageid值，以便替换其内部控件url属性引用的pageid
			jsonStr = jsonStr.replace(new RegExp(d.id, "g"), e);
		};

		//重新转换成json对象
		pages = $.parseJSON(jsonStr);

		for (var i = 0; i < pages.length; i++) {
			var d = pages[i], 
				e = this._newPageFromObject(d, c === true ? i : null);
			b && this._interimStack.push(d.id),
			this._openFromObjectRoot(e, d, this._document.root, true)
		};
				
		this.trigger("appLoaded", pages[0].id),
		
		setTimeout(function(){
			loader.hide(), loaderBack.hide()
		}, 500);

	},
	hidePropertyDialog: function() {
		this._propertyDialog && $(this._propertyDialog).dialog("close")
	},
	/**
	 * 更新PropertyView视图的Title等
	 *
	 */
	updatePropertyView: function(a) {
		//$("#userview-property").show(),
		//$("#userview-property .title").text(a.getName().toUpperCase()),
		//$("#userview-property .b-h").show(),
		//$("#userview-property").tinyscrollbar_update("relative"),
		this.showPropertyDialogForControl(a)
		//this._views.propertyview.onAttach()
		
	},	
	/**
	 * 打开属性窗口
	 *  
	 */
	showPropertyDialogForControl: function(a) {
		var b = this, 
			d = a.getControlType(), 
			dialogWidth = 316,
			dialogClass = "";

		switch(d){
			case "image":
				dialogClass = "m-dialog image-dialog";
				dialogWidth = 530;
				break;
			case "video":
				dialogClass = "m-dialog video-dialog";
				dialogWidth = 530;
				break;
			case "audio":
				dialogClass = "m-dialog audio-dialog";
				dialogWidth = 530;
				break;
			case "html":
				dialogClass = "m-dialog html-dialog";
				dialogWidth = 530;
				break;
			case "text":
				dialogWidth = 372;
				dialogClass = "editor-dialog";
				break;
			default:
				break;
		}	

		if (!this._propertyDialog) {
			this._propertyDialog = $("#property-dialog").dialog({
				autoOpen: !1,
				resizable: !1,
				minHeight: 40,
				maxHeight: 500,
				create: function(ev, ui) { //jquery.ui.1.8.1不进来。。。
					var c = $(this).closest(".ui-dialog"), e = $(".ui-dialog-titlebar", c);
					$(".ui-dialog-titlebar-close", e).html('<span class="bui-icon-dialogclose"></span>')
				},
				open: function(ev, ui) {
					b._views.propertyview.onAttach()
				}
			})
		}

		$(this._propertyDialog).dialog("option", "title", a.getName().toUpperCase()),
		$(this._propertyDialog).dialog("option", {
			"title": a.getName().toUpperCase(),
			"width": dialogWidth,
			"position": [$(window).width() - dialogWidth - 40, 70],
			"dialogClass": dialogClass
		}),
		$(this._propertyDialog).dialog("open")	
		
	},
	pushAction: function(a) {		
		var b = this._views.headerview;
		//避免在初始化控件时也入栈
		this.isLoading() || (this._redoStack = [], this._actionStack.push($.extend(a, {page: this._currentPage.getId()})), b.refreshToolbar(), this._internalActionCount++)
	},
	scriptAction: function(a, b) {
		if (!b.action) {
			console.error("Null action to script");
			return
		}
		
		var d = b.control.getControlType();
		
		//避免还原操作的控件对象不在当前激活page中
		d != "page" && b.page != this._currentPage.getId() && this.onControlClicked(b.page);
		
		switch (a) {
			case SETTINGS.ActionTypes.ADD:
				console.log("BUILDER: add action", b.parent.getId(), b.parent),
				d == "page" ? this.addPageControl(b.control) : b.parent ? this._addControl(b.control, b.parent, b.point) : this._addControl(b.control);
				break;
			case SETTINGS.ActionTypes.REMOVE:
				this._removeControl(b.control);
				break;
			case SETTINGS.ActionTypes.MOVE_BACK:
				this._moveControl(b.control, b.parent, b.newPosition, b.oldPosition);
				break;
			case SETTINGS.ActionTypes.MOVE_FORWARD:
				this._moveControl(b.control, b.parent, b.oldPosition, b.newPosition);
				break;
			case SETTINGS.ActionTypes.PROPERTY_BACK:
				this._changeProperty(b.control, b.property, b.oldValue);
				break;
			case SETTINGS.ActionTypes.PROPERTY_FORWARD:
				this._changeProperty(b.control, b.property, b.newValue);
				break;
			default:
				console.error("No script for action", b.action)
		}
	},
	undo: function() {
		//避免在preview状态下按了热键操作
		if(this.isPreviewMode()) return;
		var a = this._actionStack.pop();
		a && (console.log("BUILDER: UNDO ACTION"), this.scriptAction(a.reaction, a), this._redoStack.push(a)),
		this._views.headerview.refreshToolbar()
	},
	redo: function() {
		//避免在preview状态下按了热键操作
		if(this.isPreviewMode()) return;
		var a = this._redoStack.pop();
		a && (console.log("BUILDER: REDO ACTION"), this.scriptAction(a.action, a), this._actionStack.push(a)),
		this._views.headerview.refreshToolbar()
	},
	/**
	 * 设置设计器的大小
	 * a, 大小值，数组形式
	 */
	setDeviceSize: function(a) {
		this._currentOrientation == SETTINGS.DeviceOrientation.LANDSCAPE ? this._setDeviceSize([a[1], a[0]]) : this._setDeviceSize(a),
		this._currentDeviceSize = a
	},
	_setDeviceSize: function(a) {
		$("#phone .device .t, #phone .device .m, #phone .device .b").css({
			width: a[0] + 86 + "px"
		}),
		$("#phone .device .t .l-c").css({
			width: a[0] - 114 + "px"
		}),
		$("#phone .device .m .l, #phone .device .m .r").css({
			height: a[1] - 96 + "px"
		}),
		$("#phone .device .m .l-c, #phone .device .sized").css({
			width: a[0] + "px",
			height: a[1] + "px"
		}),
		$("#phone .device .b .l-c").css({
			width: a[0] - 114 + "px"
		}),
		this._device && this._device.repositionCurrentSelector()
	},
	/**
	 * 切换设计器方向（横、竖）
	 */
	toggleDeviceOrientation: function() {
		if (this._currentOrientation == SETTINGS.DeviceOrientation.LANDSCAPE) {
			this.setDeviceOrientation(SETTINGS.DeviceOrientation.PORTRAIT),
			this._setDeviceSize(this._currentDeviceSize)
		} else {
			this.setDeviceOrientation(SETTINGS.DeviceOrientation.LANDSCAPE),
			this._setDeviceSize([this._currentDeviceSize[1], this._currentDeviceSize[0]])
		}
	},
	setDeviceOrientation: function(a) {
		this._currentOrientation = a
	},
	getDocumentAsHtml: function() {
		var a = new ControlOutputVisitor,
			b = a.getAppHtml(this._document.root, this._document.root.pageName.getValue());
		return b
	},
	savePage: function(a, b, c) {
		var d = this, e = new ControlOutputVisitor, f = e.getOutputDict(a), g = a.getId(), h;

		//更新其title值
		f.properties.title = b;
		//替换其pageId值，避免多次分享同一个page时，导致其ID重复
		h = JSON.stringify(f).replace(new RegExp(a.getId(), "g"), Utils.IdGiver.giveRandom("page"));		
		Utils.request({
			url: d.getSitePath() + "addPublicPageTemplate.action",
			type: "post",
			async: false,
			data: {
				"basePageTemplate.token": Utils.getQueryParameter("token"),
				"basePageTemplate.pbpgtemp_name": b,
				"basePageTemplate.pbpgtemp_jsoncode": h,
				"basePageTemplate.lgnId": window.App.getLgnId(),
				"basePageTemplate.pbpgtemp_sourcecode": ""
			},
			success: function(d){
				var k = d.pubTemp;
				console.log(k)
				console.log("BUILDER: save page success"), $.isFunction(c) && c.call(this, k)
			}
		})
	},
	/**
	 * 保存
	 */
	saveApp: function(opt) {
		var a = this, 
			b = new ControlOutputVisitor, 
			c = this._document.root,
			framePageViewer = document.getElementById("pageViewer");
			
			$("#loader").show();
			$("#loader-back").show();	
		framePageViewer.contentWindow._renderPages(b.getAppFragmentHtml(c), function(html){
			var e = opt || {};
			if( $(html).find("input[type=submit]").length > 0 ) {
				html = $("<div/>").append( $('<form action=""/>').append(html) ).html()
			}
			Utils.request({
				url: a.getSitePath() + "saveBasePageTemp.action",
				type: "post",
				loader:false,
				data: {
					doc: JSON.stringify(b.getAppDocument(c)),
					html: html,
					lgnId:window.App.getLgnId()
				},
				loader: e.loader === undefined ? true : e.loader === true, 
				success: function(d){
					console.log("BUILDER: save success"), $.isFunction(e.success) && e.success()
						$("#loader").hide();
						$("#loader-back").hide();
			
				}
			})
		})
	},
	_getAppFragmentHtml: function(){
		var div = $("<div/>"),
			_ = BuilderDeviceGlue.getDeviceWindow().jQuery,
			// 如果存在submit按钮，在外层加入form
			body = _("input[type=submit]").length == 0 ? _("body").html() : ( $('<form action=""/>').append( _("body").html() ) );

		return div.append( body ),
			//去除jquery-mobile添加的data-role=page层及ui-loader层
			div.find("div[data-role=page]:first, div.ui-loader").remove(),
			//去除可能存在多余的高亮层
			div.find("div.highlight-selector, div.highlight").remove(),
			div.html()
	},
	loadApp: function() {
		var a = this;
		a.trigger("appLoading"),
		Utils.request({
			url: a.getSitePath() + "toEditPageTemp.action",
			data: {
				pageId: Utils.getQueryParameter("id")
			},
			success: function(b){
				a.openFromObject(b),
				a.trigger("appLoaded")
			}
		})
	},
	exportHtml: function() {
		var a = this;
		Utils.request({
			url: a.getSitePath() + "compressHtml.action",
			type: "post",
			data: {
				html: a.getDocumentAsHtml()
			},
			success: function(d){
				if(d.result == "success"){
					var b = window.onbeforeunload;
					window.onbeforeunload = undefined,
					window.location = a.getSitePath() + "downloadHtml.action",
					setTimeout(function() {
						window.onbeforeunload = b
					},
					5e3)
				}
			}
		})
	},
	/**
	 * 获取图片库资源
	 * a, 图片库类型
	 */
	getImageResouces: function(){
		var b = this, c = this._document, d = "image";
		//if(!c.resouces[d]){
			Utils.request({
				url: b.getSitePath() + "queryImageInfoList.action?token=" + Utils.getQueryParameter("token"),
				async: false,
				//loader: false,
				success: function(e){
					console.log("BUILDER: loaded image resouces"),
					c.resouces[d] = e.imgList
				}
			})
		//}
		return $.extend([], c.resouces[d])
	},
	putImageResouce: function(a){
		var c = this._document, e = "image";
		$.isArray(c.resouces[e]) && c.resouces[e].push(a)
	},
	
	/**
	 * 获取视频库资源
	 * a, 视频库类型
	 */
	getVideoResouces: function(a){
		var b = this, c = this._document, d = b.getLoadedApp().productId.getValue(), e = (a == "1" ? "video_pro_" + d : "video_pub");
		if(!c.resouces[e]){
			Utils.request({
				url: b.getSitePath() + "queryVideoInfoList.action",
				data: {
					videoType: a,
					productId: a == "1" ? d : "" //公共视频库传值为空
				},
				async: false,
				//loader: false,
				success: function(f){
					console.log("BUILDER: loaded video resouces", a, d),
					c.resouces[e] = f.videoList
				}
			})
		}
		return $.extend([], c.resouces[e])
	},
	putVideoResouce: function(a, b){
		var c = this._document, d = this.getLoadedApp().productId.getValue(), e = (a == "1" ? "video_pro_" + d : "video_pub");
		$.isArray(c.resouces[e]) && c.resouces[e].push($.extend({}, b))
	},
	
	/**
	 * 获取mp3库资源
	 * a, mp3库类型
	 */
	getAudioResouces: function(a){
		var b = this, c = this._document, d = b.getLoadedApp().productId.getValue(), e = (a == "1" ? "audio_pro_" + d : "audio_pub");
		if(!c.resouces[e]){
			Utils.request({
				url: b.getSitePath() + "queryAudioInfoList.action",
				data: {
					audioType: a,
					productId: a == "1" ? d : "" //公共视频库传值为空
				},
				async: false,
				//loader: false,
				success: function(f){
					console.log("BUILDER: loaded video resouces", a, d),
					c.resouces[e] = f.audioList
				}
			})
		}
		return $.extend([], c.resouces[e])
	},
	putAudioResouce: function(a, b){
		var c = this._document, d = this.getLoadedApp().productId.getValue(), e = (a == "1" ? "audio_pro_" + d : "audio_pub");
		$.isArray(c.resouces[e]) && c.resouces[e].push($.extend({}, b))
	},
	
	
	/**
	 * 获取APP全局变量DATA
	 */
	getAppVariables: function(){
		var a = this, b = this._document;
		if(!b.resouces["variables"]){
			Utils.request({
				url: a.getSitePath() + "queryGlobalBariable.action",
				async: false,
				//loader: false,
				success: function(d){
					console.log("BUILDER: loaded global variable", d),
					b.resouces["variables"] = a._buildTreeNodes(d)
				}
			})
		}
		return $.extend([], b.resouces["variables"])
	},
	_buildTreeNodes: function(a){
		var b = [], c = this;
		if(a && $.isArray(a.globalBariableList)){
			$.each(a.globalBariableList, function(i, n){
				//root nodes
				n.classifyname == "-1" && b.push(c._turnNodeData(a.globalBariableList, n))
			})
		}
		return b
	},
	_getChildNodes: function(a, b){
		var c = [], d = this;
		if(b.classify == "1"){			
			$.each(a, function(i, n){
				n.classifyname == b.variableid && c.push(d._turnNodeData(a, n))
			})
		}
		return c
	},	
	_turnNodeData: function(a, b){
		return {
			id: "" + b.variableid,
			text: b.variablename,
			value: b.variablevalue,
			hasChildren: b.classify == "1",
			isexpand: !0,
			complete: !0,
			ChildNodes: this._getChildNodes(a, b)
		}
	},
	/**
	 * 获取站点根路径
	 */
	getSitePath: function() {
		if(!this._sitePath){
			var a = window.document.location.pathname, b = a.substring(0, a.substr(1).indexOf('/') + 2);
			this._sitePath = (b == "/pagebuilder/" ? "/" : b);
		}
		return this._sitePath
	},
	// 隐藏拖动提示
	hiddenDropTip: function(){
		$("#phone-drop").hide();
	},	
	// 显示拖动提示
	showDropTip: function(){
		$("#phone-drop").show();
	},
	/**
	 * 获取数据表格控件的源集合
	 */
	getDataSourcesForDataTable: function(){
		var a = this, b = this._document;
		
		if(!b.resouces["tablesources"]){
			Utils.request({
				url: a.getSitePath() + "queryDataSourceViewList.action",
				async: false,
				//loader: false,
				success: function(d){
					var e = [], f;
					for (var i = 0; i < d.dataSourceViewList.length; i++) {
						f = d.dataSourceViewList[i];
						e.push({
							text: f.dataSourceNameCZ,
							value: f.dataSourceNameEN
						})
					};
					b.resouces["tablesources"] = e
				}
			})
		}
		return $.extend([], b.resouces["tablesources"])
	},
	getDefaultDataSourceForDataTable: function(){
		var a = this.getDataSourcesForDataTable();
		return a && a.length > 0 ? a[0].value : null
	},
	/**
	 * 获取数据表格的列集合
	 * @param source 数据源
	 */
	getColumnsForDataTable: function(source){
		var a = this, b = this._document, c = source || this.getDefaultDataSourceForDataTable();
		if(!b.resouces["tablecolumns"]){
			b.resouces["tablecolumns"] = {}
		}
		if(c && !b.resouces["tablecolumns"][c]){
			Utils.request({
				url: a.getSitePath() + "queryDataSourceColumnList.action",
				data: {
					dataSourceViewNo: c
				},
				async: false,
				//loader: false,
				success: function(d){
					var e = [], f;
					for (var i = 0; i < d.dataSourceViewColumnList.length; i++) {
						f = d.dataSourceViewColumnList[i];
						e.push({
							text: f.columnName,
							value: f.dbCoulumnName
						})
					};
					b.resouces["tablecolumns"][c] = e
				}
			})
		}
		return $.extend([], b.resouces["tablecolumns"][c])
	},
	getDefaultColumnForDataTable: function(source){
		var a = this.getColumnsForDataTable(source);
		//列集合为空时，这里返回默认空列，避免其调用地方出错
		return a && a.length > 0 ? a[0] : {text: "", value: ""}
	},
	getBackUrl: function(){
		return this._backUrl
	},
	getSaveUrl: function(){
		return this._saveUrl
	},
	getLgnId: function(){
		return this._LgnId;
	}
	
});

