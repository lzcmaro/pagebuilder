/**
 * widget 控件属性的视图部件
 *
 */
Widget = Backbone.View.extend({
	initialize: function(a, b) {
		this._template = a,
		this._data = {},
		b || (this._filter = new AcceptAllInputFilter)
	},
	setValue: function(a) { a && (this._data = a) },
	updateValue: function(a) { this.setValue(a) },
	render: function(a) {
		var b = "#template-widget-" + this._template,
		c = Handlebars.compile($(b).html()),
		d = c($.extend(this._data, {
			_property_title: a,
			_wid: this.cid
		}));
		$(this.el).html(d),
		this.delegateEvents()
	},
	onAttach: function() {}
});
_.extend(Widget, Backbone.Events);

NullWidget = Widget.extend({
	initialize: function() {
		Widget.prototype.initialize.call(this, "nullwidget", new AcceptAllInputFilter)
	}
}),
/**
 * 单行文本框
 */
SingleTextWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "singletext", a),
		this._delay = b || 500,
		this._data = {
			text: ""
		}
	},
	events: {
		"keyup input": "onKeyPress",
		"change input": "onValueChange", // 用于视频音频控件
		"keydown input": "onKeyDown"
	},
	setValue: function(a) {
		this._data.text = a,
		$("input[type=text]", this.el).val(a)
	},
	updateValue: function(a) {
		this._data.text = a
	},
	onKeyDown: function(a) {
		//避免按了ctrl+z等快键触发游览器默认行为，虽然输入框值被还原，但无法更新其它视图（如工具栏）
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	onValueChange: function(a, b){ // b 标识是否是手动触发change事件
		if(b) this.onKeyPress.call(this, a)
	},
	onKeyPress: function(a) {
		var b = this,
		c = $(a.currentTarget);
		this._delay ? (clearTimeout(this._delayTimeout), this._delayTimeout = setTimeout(function() {
			b.trigger("valueChanged", c.val())
		}, this._delay)) : this.trigger("valueChanged", c.val())
	}
}),
/**
 * 像素(checkbox)选择控件
 */
PixelSizeWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "pixelsize", a),
		this._data = b
	},
	events: {
		"keyup input": "onKeyPress",
		"keydown input": "onKeyDown",
		'change input[type="radio"]': "onRadioChange"
	},
	setValue: function(a) {
		this._data = a,
		$("input[type=text].val", this.el).val(a.value),
		$('input[type=radio][value="' + a.units + '"]', this.el).attr("checked", "checked")
	},
	updateValue: function(a) {
		this._data = a
	},
	onKeyDown: function(a) {
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	_valueChanged: function() {
		var a = $(this.el).find(".val").val(),
		b = $(this.el).find('input[type="radio"]:checked').val();
		this.trigger("valueChanged", {
			value: a,
			units: b
		})
	},
	onKeyPress: function(a) {
		this._valueChanged()
	},
	onRadioChange: function(a) {
		var b = $(a.currentTarget);
		this._valueChanged()
	}
}),
/**
 * 下拉选择框
 */
SelectWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "select", a),
		this._data = {
			options: b
		}
	},
	events: {
		"change select": "onValueChanged"
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget);
		this.trigger("valueChanged", b.val())
	},
	setValue: function(a) {
		for (var b in this._data.options) {
			var c = this._data.options[b];
			c.selected = !1,
			c.value == a && (c.selected = !0)
		}
	}
}),
/**
 * 主题选择
 */
ThemeSelectWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "themeselect", a),
		this._data = {
			themes: $.extend(!0, [], SETTINGS.THEMES)
		}
		//,b === !1 && this._data.themes[0].value == "" && this._data.themes.splice(0, 1) //删除默认主题选项
	},
	events: {
		"change select": "onValueChanged"
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget);
		this.trigger("valueChanged", b.val())
	},
	setValue: function(a) {
		for (var b in this._data.themes) {
			var c = this._data.themes[b];
			c.selected = !1,
			c.value == a && (c.selected = !0)
		}
	}
});

ThemeSelectorWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "themeselector", a),
		this._data = {
			themes: $.extend(!0, [], SETTINGS.THEMES)
		}
		this._data.themes.splice(0, 1) //删除默认主题选项
	},
	events: {
		"click a": "onThemeSelected"
	},
	onThemeSelected: function(a) {
		var d = $(a.currentTarget);
		d.hasClass("selected") || (d.siblings("a").removeClass("selected"), d.addClass("selected"), this.trigger("valueChanged", d.attr("val")))
	},
	setValue: function(a) {
		for (var b in this._data.themes) {
			var c = this._data.themes[b];
			c.selected = !1,
			c.value == a && (c.selected = !0)
		}
	}
});
/**
 * 2013.04.02 李小勇新增
 * 集合类视图部件的父类
 */
ListWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, a, b),
		//集合类的视图组件，其data的默认格式
		this._data = {
			items: []
		}
	},
	events: {
		"click div.add": "onItemAdded",
		"click a.remove": "onItemDeleted",
		"keyup input": "onItemChanged",
		"change select": "onItemChanged"
	},
	setValue: function(a) {
		this._data.items = a
	},
	/**
	 * 重写父类Widget的渲染方法，实现集合类型的UI视图，并支持排序等（使用jquery-ui accordion）
	 */
	render: function(a) {
		var b = "#template-widget-" + this._template,
		c = Handlebars.compile($(b).html()),
		d = c($.extend(this._data, {
			_property_title: a
		})),
		e = this;
		$(this.el).html(d),
		$(".fg-accordion.sortable", this.el).accordion({
			active: ":last",
			autoHeight: !1,
			animated: !1,
			collapsible: !0,
			clearStyle: !0,
			header: "> div > h3",
			icons: {
				header: "bui-icon bui-icon-plus",
				headerSelected: "bui-icon bui-icon-minus"
			}
		}).sortable({
			axis: "y",
			handle: "h3",
			tolerance: "pointer",
			start: function(a, b) {
				var c = b.item.index();
				b.item.data("contentDragStart", c)
			},
			change: function(a, b) {
				var c = b.item.index()
			},
			stop: function(a, b) {
				$(this).data("_stop", !0);
				var c = b.item.data("contentDragStart"),
				d = b.item.index();
				e.trigger("itemMoved", c, d)
			}
		}),
		$(".fg-collapsible.sortable h3").click(function(a) {
			var b = $(this).closest(".fg-collapsible.sortable");
			b.data("_stop") === !0 && (a.stopImmediatePropagation(), a.preventDefault(), b.data("_stop", !1))
		}),
		this.delegateEvents()
	},
	/**
	 * onItemAdded, onItemChanged调用，由子类实现，返回新增或改变ITEM时所需的JSON数据
	 * @param a 操作标识，add | change
	 * @param b 当操作为change时，传递的item对象
	 */
	getItemData: function(a, b){},
	onItemAdded: function(){
		this.trigger("itemAdded", this.getItemData("add"))
	},
	onItemChanged: function(a) {
		var b = $(a.currentTarget),
			c = b.closest(".fg-collapsible"),
			d = $(c).index(),
			e = this.getItemData("change", c),
			f = $("h3 span", c);
		console.log("Changing item", d),
		//改变ITEM的title文本，约定为其text值
		e.text && $("h3", c).html("").append(f).append(e.text),
		this.trigger("itemChanged", d, e)
	},
	onItemDeleted: function(a) {
		var b = $(a.currentTarget),
		c = b.closest(".fg-collapsible"),
		d = $(c).index();
		console.log("Deleting button", d),
		this.trigger("itemDeleted", d),
		c.remove()
	}
});
/**
 * 控件NavBar中的属性items的视图部件的渲染helper
 */
Handlebars.registerHelper("buttonlistitems_render", function(a, b) {
	var c = [];
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = new UrlOrPageSelectWidget;
		f.setValue(e.url),
		f.render();
		var g = $(f.el).html(),
		h = new IconSelectWidget(IconSelectWidget.ICON_ONLY);
		h.setValue(e.icon),
		h.render();
		var i = $(h.el).html(),
		j = new ThemeSelectWidget;
		j.setValue(e.theme),
		j.render();
		var k = $(j.el).html(),
		// ISACTIVE 表示是否激活，在settings.js中设置
		l = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISACTIVE));
		l.setValue(e.isActive == "true"),
		l.render();
		var m = $(l.el).html(),
		n = "#sub-template-widget-buttonlistitems",
		o = Handlebars.compile($(n).html()),
		p = o($.extend({
			iconSelect: i,
			pageSelect: g,
			themeSelect: k,
			isActiveSelect: m
		},
		e));
		c.push(p)
	}
	return c.join("")
});
/**
 * 控件NavBar中的属性items的视图部件
 */
ButtonListItemWidget = ListWidget.extend({
	initialize: function(a) {
		ListWidget.prototype.initialize.call(this, "buttonlistitems", a)
	},
	render: function(a){
		ListWidget.prototype.render.call(this, a);
		//给“链接到”下拉框绑定事件（该事件要比父类在events中指定的事件要先触发）
		this.$("select.pages").bind("change", function(e){
			var b = $(this);
			if (b.val() === "URL") {
				var c = prompt('请输入链接地址：(例如：http://www.google.com)                                               ');
				c ? (b.find("option:not(.page)").remove(), b.append('<option value="' + c + '" selected>' + c + '</option><option value="URL">URL...</option>')) : b.find("option:first").attr("selected", true)
			}
		})
	},
	getItemData: function(a, b){
		var d = a === "add", c = d ? window.App.getCurrentPage().getId() || "" : $("select.pages", b).val();
		
		//选取的为内部page链接，在前面加上#号
		if( /page[\d]+/.test(c) ){
			c = "#" + c
		}

		return {
			text: d ? "按钮" : $("input", b).val(),
			icon: d ? "arrow-u" : $("select.icons", b).val(),
			url: c,
			theme: d ? "" : $("select.themes", b).val(),
			isActive: d ? !1 : $(".isActive select", b).val()
		}
	}
}),
/**
 * 图标下拉选择框控件,ICONS表示图标类型,在settings.js中设置
 */
IconSelectWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "iconselect", b),
		this._data = {
			align: "left",
			icons: $.extend(!0, [], SETTINGS.ICONS)
		},
		a == IconSelectWidget.ICON_ONLY && (this._data.align = null),
		a == IconSelectWidget.ALIGN_ONLY && (this._data.icons = null)
	},
	events: {
		"change select": "onValueChanged",
		"click a": "onAlignChanged"
	},
	onAlignChanged: function(a) {
		var b = $(a.currentTarget),
		c = b.data("align"),
		d = $("select", this.el).val();
		return this._data.align = c,
		this.trigger("valueChanged", {
			icon: d,
			align: c
		}),
		!0
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget),
		c = $(b).val();
		this.trigger("valueChanged", {
			icon: c,
			align: this._data.align
		})
	},
	setValue: function(a) {
		for (var b in this._data.icons) {
			var c = this._data.icons[b];
			c.selected = !1;
			if (c.value === a.icon || c.value === a) c.selected = !0
		}
		if (a.align) {
			this._data.align = a.align;
			var d = $(".radio-set", this.el);
			d.length > 0 && ($(".radio", this.el).removeClass("selected"), $('.radio[data-align="' + a.align + '"]', this.el).addClass("selected"))
		}
	}
}, {
	ICON_ONLY: 1,
	ICON_ALIGN: 2,
	ALIGN_ONLY: 3
}),
/**
 * page下拉选择框控件
 */
PageSelectWidget = Widget.extend({
	render: function(a) {
		var b = window.App.getPages(), 
			//当前选取的page，截取可能存在的#符号
			selectedPage = this._selectedPage ? this._selectedPage.replace(/^#/, "") : "";

		this._data.pages = [],
		this._allowEmpty && this._data.pages.push({
			key: "",
			value: "",
			selected: !0
		});		

		for (var c = 0; c < b.length; c++) {
			var d = b[c];
			this._data.pages.push({
				key: d.title.getValue(),
				value: d.getId(),
				selected: d.getId() === selectedPage
			})
		}
		Widget.prototype.render.call(this, a)
	},
	initialize: function(a, b) {
		var c = this;
		Widget.prototype.initialize.call(this, "pageselect", a),
		this._allowEmpty = b,
		c._selectedPage = null
	},
	events: {
		"change select": "onValueChanged"
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget);
		this.trigger("valueChanged", b.val())
	},
	setValue: function(a) {
		this._selectedPage = a
	}
}),
/**
 * 转场效果控件
 * TRANSITIONS, 表示转场选项，在settings.js文件中设置
 */
TransitionSelectWidget = Widget.extend({
	initialize: function(a) {
		Widget.prototype.initialize.call(this, "transitionselect", a),
		this._data = {
			align: "left",
			transitions: $.extend(!0, [], SETTINGS.TRANSITIONS)
		}
	},
	events: {
		"change select": "onValueChanged"
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget),
		c = $(b).val();
		this.trigger("valueChanged", c)
	},
	setValue: function(a) {
		for (var b in this._data.transitions) {
			var c = this._data.transitions[b];
			c.selected = !1,
			c.value == a && (c.selected = !0)
		}
	}
});

/**
 * 控件ListView中的属性items的视图部件的渲染helper
 */
Handlebars.registerHelper("listitems_render", function(a, b) {
	var c = [];
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = new UrlOrPageSelectWidget;
		f.setValue(e.url),
		f.render();
		var g = $(f.el).html(),
		h = new TransitionSelectWidget;
		h.setValue(e.transition),
		h.render();
		var i = $(h.el).html(),
		j = new ThemeSelectWidget;
		j.setValue(e.theme),
		j.render();
		var k = $(j.el).html(),
		l = "#sub-template-widget-listitems",
		m = Handlebars.compile($(l).html()),
		n = m($.extend({
			pageSelect: g,
			transitionSelect: i,
			themeSelect: k
		},
		e));
		c.push(n)
	}
	return c.join("")
});
/**
 * 控件ListView中的属性items的视图部件
 */
var ListViewItemsWidget = ListWidget.extend({
	initialize: function(a) {
		ListWidget.prototype.initialize.call(this, "listitems", a)
	},
	events: {
		"click div.add-button": "onItemAdded",
		"click div.add-divider": "onDividerItemAdded",
		"click a.remove": "onItemDeleted",
		"keyup input": "onItemChanged",
		"change select": "onItemChanged"		
	},
	render: function(a){
		ListWidget.prototype.render.call(this, a);
		//给“链接到”下拉框绑定事件（该事件要比父类在events中指定的事件要先触发）
		this.$("select.pages").bind("change", function(e){
			var b = $(this);
			if (b.val() === "URL") {
				var c = prompt('请输入链接地址：(例如：http://www.google.com)                                               ');
				c ? (b.find("option:not(.page)").remove(), b.append('<option value="' + c + '" selected>' + c + '</option><option value="URL">URL...</option>')) : b.find("option:first").attr("selected", true)
			}
		})
	},
	getItemData: function(a, b){
		var d = a === "add", c = d ? window.App.getCurrentPage().getId() || "" : $("select.pages", b).val();
		
		//选取的为内部page链接，在前面加上#号
		if( /page[\d]+/.test(c) ){
			c = "#" + c
		}

		return {
			text: d ? "按钮" : $("input.text", b).val(),
			url: c,
			count: d ? null : $("input.count", b).val() || null,
			theme: d ? "" : $("select.themes", b).val(),
			transition: d ? "" : $("select.transitions", b).val(),
			isDivider: d ? !1 : b.data("isdivider") === !0
		}
	},
	onDividerItemAdded: function(a) {
		var b = $("input[type=text]", this.el).val(),
		c = $("select.themes", this.el).val();
		c == "" && (c = "b"),
		this.trigger("itemAdded", {
			isDivider: !0,
			text: "分栏",
			theme: c
		})
	}
});

/**
 * 控件collapsible中属性sections的视图部件的渲染helper
 */
Handlebars.registerHelper("collapsiblesections_render", function(a, b) {
	var c = [];
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS._ISCOLLAPSED));
		f.setValue(e.isCollapsed),
		f.render();
		var g = $(f.el).html(),
		h = "#sub-template-widget-collapsiblesections",
		i = Handlebars.compile($(h).html()),
		j = i($.extend({
			isCollapsedSelect: g
		},
		e));
		c.push(j)
	}
	return c.join("")
});
/**
 * 控件collapsible中属性sections的视图部件
 */
var AccordionSectionItemWidget = ListWidget.extend({
	initialize: function(a) {
		ListWidget.prototype.initialize.call(this, "collapsiblesections", a)
	},
	getItemData: function(a, b){
		var d = a === "add";
		return {
			text: d ? "标题" : $("input", b).val(),
			isCollapsed: d ? !1 : $(".is-collapsed select", b).val(),
			_controlId: d ? null : this._data.items[b.index()]._controlId
		}
	}
}),
/**
 * 控件TextBlock的TextEditor视图部件
 */
TextEditorWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "texteditor", a),
		this._data = {
			text: b
		}
	},
	setValue: function(a) {
		this._data.text = a,
		$("textarea", this.el).val(a)
	},
	updateValue: function(a) {
		this._data.text = a
	},
	onAttach: function() {
		var a = this;		
		//删除tinyMCE可能残留的菜单弹出层，避免冲突
		$(".mceListBoxMenu, .mce_forecolor, .mce_backcolor").remove();
		//在弹出窗里挂载富文件编辑器
		tinyMCE.init({
			theme: "advanced",
			mode: "exact",
			valid_elements: "*[*]",
			elements: this.cid,
			language: "zh-cn",
			theme_advanced_toolbar_location: "top",
			theme_advanced_resizing: !1,
			plugins: "table,inlinepopups",
			//plugins: "autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,contextmenu,paste,nonbreaking,xhtmlxtras,template",
			theme_advanced_buttons1: "bold,italic,underline,strikethrough,table,|,justifyleft,justifycenter,justifyright,|,bullist,numlist,|,outdent,indent,|,code",
			theme_advanced_buttons2: "fontselect,fontsizeselect,|,link,unlink,|,image,|,forecolor,backcolor",
			theme_advanced_buttons3: "",
			theme_advanced_toolbar_align: "left",
			theme_advanced_statusbar_location: "bottom",
			theme_advanced_source_editor_width: 600,
			theme_advanced_source_editor_height: 350,
			verify_html: !1,
			width: "350",
			height: "260",
			setup: function(b) {
				b.onClick.add(function(b, c) {					
					var d = b.getContent(), e = "在这里输入内容...";
					d = d.replace(/<[^>]+>/g, ""), //去除HTML标签
					e === $.trim(d) && b.setContent("")
				}),
				b.onKeyUp.add(function(b, c) {
					a.trigger("valueChanged", b.getContent())
				})
			},
			onchange_callback: function(b) {
				a.trigger("valueChanged", b.getContent())
			}
		});
		
		//加载全局变量树面板
		/*$("#treepan").treeview({
			theme: "bbit-tree-lines",
			classes: "var-tree",
			showcheck: true,
			data: window.App.getAppVariables(),
			onnodedblclick: function(b) {
				//双击叶节点时，把内容添加到编辑器中
				b.hasChildren || tinyMCE.execInstanceCommand(a.cid, "mceInsertContent", false, "<span style='color:blue;'>" + b.value + "</span>")
			}
		});*/
	}
}),
/**
 * URL/页面链接选择视图控件
 */
UrlOrPageSelectWidget = Widget.extend({
	render: function(a) {
		var b = window.App.getPages(),
		c = !1;
		this._data.pages = [];
		for (var d = 0; d < b.length; d++) {
			var e = b[d];
			e.getId() === this._selectedPage || "#" + e.getId() == this._selectedPage ? (c = !0, this._data.pages.push({
				key: e.title.getValue(),
				value: e.getId(),
				selected: !0
			})) : this._data.pages.push({
				key: e.title.getValue(),
				value: e.getId(),
				selected: !1
			})
		}
		Widget.prototype.render.call(this, a),
		$(this.el).find("option:not(.page)").remove(),
		!c && this._selectedPage && $(this.el).find("select").append('<option value="' + this._selectedPage + '" selected>' + this._selectedPage + "</option>"),
		$(this.el).find("select").append('<option value="URL">URL...</option>')
	},
	initialize: function(a) {
		var b = this;
		Widget.prototype.initialize.call(this, "pageselect", a),
		b._selectedPage = null
	},
	events: {
		"change select": "onValueChanged"
	},
	onValueChanged: function(a) {
		var b = $(a.currentTarget);
		if (b.val() === "URL") {
			var c = prompt('请输入链接地址：(例如：http://www.google.com)                                               ');
			c ? (this.trigger("valueChanged", c), b.find("option:not(.page)").remove(), b.append('<option value="' + c + '" selected>' + c + '</option><option value="URL">URL...</option>')) : b.get(0).selectedIndex = this._lastOptionIndex
		} else if(Utils.ValidUrl(b.val())){
			this.trigger("valueChanged", b.val())
		} else{
			this.trigger("valueChanged", "#" + b.val())
		}
	},
	setValue: function(a) {
		this._selectedPage = a
	}
});
/**
 * 
 */
Handlebars.registerHelper("image_render", function(a, b) {
	
	var c = new PixelSizeWidget; //宽度
	c.setValue(a.width),
	c.render();
	var d = new PixelSizeWidget;
	d.setValue(a.height),
	d.render();
	var e = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ALIGN));
	e.setValue(a.align),
	e.render();
	var f = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.DISPLAYMODE));
	f.setValue(a.displayMode),
	f.render();
	var g = new UrlOrPageSelectWidget(new AcceptAllInputFilter);
	g.setValue(a.link),
	g.render();
	
	var h = "#sub-template-widget-image",
		i = Handlebars.compile($(h).html()),
		j = i($.extend({
			url: a.url,
			widthSetting: "<div class='fe'>" + $(".fe", c.el).html() + "</div>",
			heightSetting: "<div class='fe'>" + $(".fe", d.el).html() + "</div>",
			alignSelect: $(e.el).html(),
			displaySelect: $(f.el).html(),
			linkSelect: $(g.el).html()
		},
		a));
	return j
	
});
/**
 * 图片视图控件
 */
ImageWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "image", a),
		this._data = {
			image: b
		}
	},
	events: {
		"keydown input[type=text]": "onKeyDown",
		"keyup input[type=text]": "onKeyPress",
		"click .image-width input[type=radio], .image-height input[type=radio]": "onUnitsChanged",
		"change .image-align select": "onAlignChanged",
		"change .image-display select": "onDisplayModeChanged",
		"change .image-link select": "onLinkChanged",
		"click .tabs-header li:not(.active)": "onTabsClick",
		"click .tabs-content li:not(.active)": "onImgItemClick",
		"click .tabs-content li a.remove": "onItemDelete"
	},
	setValue: function(a) {
		this._data.image = a
	},
	onKeyDown: function(a) {
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	onKeyPress: function(a) {
		this._changed()
	},
	onUnitsChanged: function(a) {
		this._changed()
	},
	onAlignChanged: function(a) {
		this._changed()
	},
	onDisplayModeChanged: function() {
		this._changed()
	},
	onLinkChanged: function(a) {
		var b = $(a.currentTarget), c = b.val();
		if (c == "URL") {
			var d = prompt('请输入链接地址：(例如：http://www.google.com)                                               ');
			d ? (b.find("option:not(.page)").remove(), b.append('<option value="' + d + '" selected>' + d + '</option><option value="URL">URL...</option>')) : b.find("option:first").attr("selected", true)
		}
		this._changed()	
	},
	_changed: function() {
		var a;
		this.trigger("valueChanged", {
			url: $(".image-url input[type=text]", this.el).val(),
			width: {
				value: $(".image-width input[type=text]", this.el).val(),
				units: $(".image-width input[type=radio]:checked", this.el).val()
			},
			height: {
				value: $(".image-height input[type=text]", this.el).val(),
				units: $(".image-height input[type=radio]:checked", this.el).val()
			},
			align: $(".image-align select", this.el).val(),
			displayMode: $(".image-display select", this.el).val(),
			link: (a = $(".image-link select", this.el).val(), a.indexOf("page") === 0 ? ("#" + a) : a)
		});
	},
	onTabsClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".tabs-content", b.el).hide(),
		$(".tabs-content:eq(" + c.index() + ")", b.el).show().find("li").removeClass("active"),
		b._loadImageResouces()
		
	},
	
	onItemDelete: function(a){
		var b = window.App, c = $(a.currentTarget),id = c.attr("data-id");
		Utils.confirm("您确定要删除该张图片？", function(){
			Utils.request({
				url: b.getSitePath() + "deleteFileById.action",
				data: {
					id: id
				},
				async: false,
				loader: false,
				success: function(d){
					$("li[id="+ id +"]",$(".tabs-content")).remove();
				}
			})
		});
		return false;
	},
	
	onImgItemClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".image-url input[type=text]", b.el).val(c.find("img").attr("src")), b._changed()
	},
	onAttach: function() {
		var a = this, 
			b = window.App.getSitePath(),
			c = null,
			d = new qq.FileUploader({
				element: $(".image-uploader", a.el).get(0),
				listElement: $(".image-upload-list", a.el).get(0),
				action: b + "imageUpload.action?token=" + Utils.getQueryParameter("token"),
				disableDefaultDropzone: true,
				autoUpload: true,
				inputName: "image",
				uploadButtonText: "上传图片",
				cancelButtonText: "取消",
				failUploadText: "上传失败",
				allowedExtensions: ["gif", "png", "jpeg", "jpg"],
				sizeLimit: 1024 * 1024 , //1M
				forceMultipart: true, //不使用XHR方式提交
				customErrorTips: function(item,result){
					var erorMsgObj = item.lastChild.lastChild;
					erorMsgObj.nodeValue += ", 原因:" + result.error;
				},
				onSubmit: function(){
					c  = $(".tabs-header li.active", a.el).index()
				},
				onComplete: function(e, f, g){
					if(g.success){
						var h = b + g.filepath.substr(1), i = $(".tabs-content:eq(" +  c + ") ul", a.el), j = i.parent();											
						window.App.putImageResouce({relativeUrl: g.filepath,id:g.id}),
						i.append("<li id="+ g.id +"><img src='" + h + "' /><a href='' title='删除' data-id="+ g.id +" class='remove'></a></li>"),
						j.scrollTop(j.offset().top),
						$("li:last", i).trigger("click")						
					}
					setTimeout(function(){
						$(".image-upload-list", a.el).html("")
					}, 2500)
				},
				onError: function(d, e, f){
					
				}
			});
		
		//加载图片库
		a._loadImageResouces()
		
	},
	_loadImageResouces: function(){
		console.log("ImageWidget: loading image resouces.");
		var a = this, b = $(".tabs-header li.active", a.el), c = b.index();
		if(!b.data("init")){
			var d = window.App.getImageResouces(), e = "";
			$.each(d, function(i, n){
				e += "<li id="+ n.id +"><img src='" + window.App.getSitePath() + n.relativeUrl.substr(1) + "' /><a href='' data-id="+ n.id +" title='删除' class='remove'></a></li>"
			}),
			$(".tabs-content:eq(" + c + ") ul", a.el).html(e),
			b.data("init", !0)
		}
	}
});


Handlebars.registerHelper("video_render", function(a, b) {
	var c = new PixelSizeWidget; //宽度
	c.setValue(a.width),
	c.render();
	var d = new PixelSizeWidget;
	d.setValue(a.height),
	d.render();
	var e = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ALIGN));
	e.setValue(a.align),
	e.render();
	var f = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.DISPLAYMODE));
	f.setValue(a.displayMode),
	f.render();
	var g = "#sub-template-widget-video",
		h = Handlebars.compile($(g).html()),
		i = h($.extend({
			url: a.url,
			widthSetting: "<div class='fe'>" + $(".fe", c.el).html() + "</div>",
			heightSetting: "<div class='fe'>" + $(".fe", d.el).html() + "</div>",
			alignSelect: $(e.el).html(),
			displaySelect: $(f.el).html()
		},
		a));
	return i
	
});
/**
 * 视频视图控件
 */
VideoWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "video", a),
		this._data = {
			video: b
		}
	},
	events: {
		"keydown input[type=text]": "onKeyDown",
		"keyup input[type=text]": "onKeyPress",
		"click .video-width input[type=radio], .video-height input[type=radio]": "onUnitsChanged",
		"change .video-align select": "onAlignChanged",
		"change .video-display select": "onDisplayModeChanged",
		"click .tabs-header li:not(.active)": "onTabsClick",
		"click .tabs-content li:not(.active)": "onVideoItemClick"
	},
	setValue: function(a) {
		this._data.video = a
	},
	onKeyDown: function(a) {
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	onKeyPress: function(a) {
		this._changed()
	},
	onUnitsChanged: function(a) {
		this._changed()
	},
	onAlignChanged: function(a) {
		this._changed()
	},
	onDisplayModeChanged: function() {
		this._changed()
	},
	_changed: function() {
		this.trigger("valueChanged", {
			thumbnail: $("li.active img", this.el).attr("src"),
			fileSize: $("li.active img", this.el).attr("fileSize"),
			url: $(".video-url input[type=text]", this.el).val(),
			width: {
				value: $(".video-width input[type=text]", this.el).val(),
				units: $(".video-width input[type=radio]:checked", this.el).val()
			},
			height: {
				value: $(".video-height input[type=text]", this.el).val(),
				units: $(".video-height input[type=radio]:checked", this.el).val()
			},
			align: $(".video-align select", this.el).val(),
			displayMode: $(".video-display select", this.el).val()
		})
	},
	onTabsClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".tabs-content", b.el).hide(),
		$(".tabs-content:eq(" + c.index() + ")", b.el).show().find("li").removeClass("active"),
		b._loadVideoResouces()
		
	},
	onVideoItemClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".video-url input[type=text]", b.el).val(c.find("img").attr("videoPath")),$(".fe input.ui-input-text").val(c.find("img").attr("title")).trigger("change", !0), b._changed()
	},
	onAttach: function() {
		var a = this, 
			b = window.App.getSitePath(),
			c = null,
			d = new qq.FileUploader({
				element: $(".video-uploader", a.el).get(0),
				listElement: $(".video-upload-list", a.el).get(0),
				action: b + "videoUpload.action",
				disableDefaultDropzone: true,
				autoUpload: true,
				inputName: "video",
				uploadButtonText: "上传视频",
				cancelButtonText: "取消",
				failUploadText: "上传失败",
				allowedExtensions: ["mp4"],
				sizeLimit: 1024 * 50000 , //50MB
				forceMultipart: true, //不使用XHR方式提交
				customErrorTips: function(item,result){
					var erorMsgObj = item.lastChild.lastChild;
					erorMsgObj.nodeValue += ", 原因:" + result.error;

				},
				onSubmit: function(){
					c  = parseInt($(".tabs-header li.active", a.el).index(), 10),
					d.setParams({
						productId: window.App.getLoadedApp().productId.getValue(),
						videoType: c + 1
					})
				},
				
				onComplete: function(e, f, g){
					if(g.success){
						var h = b + g.filepath.substr(1), u = b + g.suolueImgUrl.substr(1), n = g.fileName,s = g.fileSize, i = $(".tabs-content:eq(" +  c + ") ul", a.el), j = i.parent();											
						window.App.putVideoResouce(c + 1, {relativeUrl: g.filepath,suolueImgUrl: g.suolueImgUrl,fileSize:g.fileSize,videoName:g.fileName});
						setTimeout(function(){
							i.append("<li><img src='" + u + "' title='"+ n +"' fileSize='" + s + "' fileName='"+ n +"' videoPath='"+ h +"' /></li>");
							$("li:last", i).trigger("click");
						},3000);
						j.scrollTop(j.offset().top);						
					}
					setTimeout(function(){
						$(".video-upload-list", a.el).html("")
					}, 2500)
				},
				onError: function(d, e, f){
					
				}
			});
		
		//加载视频库
		a._loadVideoResouces()
		
	},
	_loadVideoResouces: function(){
		console.log("VideoWidget: loading video resouces.");
		var a = this, b = $(".tabs-header li.active", a.el), c = parseInt(b.index(), 10);
		if(!b.data("init")){
			var d = window.App.getVideoResouces(c + 1), e = "";
			$.each(d, function(i, n){
				e += "<li><img src='" + window.App.getSitePath() + n.suolueImgUrl.substr(1) + "' title='" + n.videoName + "' fileSize='" + n.fileSize + "' fileName='" + n.videoName + "' videoPath='"+ window.App.getSitePath() + n.relativeUrl.substr(1) +"' /></li>"
			}),
			$(".tabs-content:eq(" + c + ") ul", a.el).html("").append(e),
			b.data("init", !0)
		}
	}
});


Handlebars.registerHelper("audio_render", function(a, b) {
	
	var c = new PixelSizeWidget; //宽度
	c.setValue(a.width),
	c.render();
	var d = new PixelSizeWidget;
	d.setValue(a.height),
	d.render();
	var e = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ALIGN));
	e.setValue(a.align),
	e.render();
	var f = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.DISPLAYMODE));
	f.setValue(a.displayMode),
	f.render();
	
	var g = "#sub-template-widget-audio",
		h = Handlebars.compile($(g).html()),
		i = h($.extend({
			url: a.url,
			widthSetting: "<div class='fe'>" + $(".fe", c.el).html() + "</div>",
			heightSetting: "<div class='fe'>" + $(".fe", d.el).html() + "</div>",
			alignSelect: $(e.el).html(),
			displaySelect: $(f.el).html()
		},
		a));
	return i
	
});
/**
 * 音频视图控件
 */
AudioWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "audio", a),
		this._data = {
			audio: b
		}
	},
	events: {
		"keydown input[type=text]": "onKeyDown",
		"keyup input[type=text]": "onKeyPress",
		"click .audio-width input[type=radio], .audio-height input[type=radio]": "onUnitsChanged",
		"change .audio-align select": "onAlignChanged",
		"change .audio-display select": "onDisplayModeChanged",
		"click .tabs-header li:not(.active)": "onTabsClick",
		"click .tabs-content li:not(.active)": "onAudioItemClick"
	},
	setValue: function(a) {
		this._data.audio = a
	},
	onKeyDown: function(a) {
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	onKeyPress: function(a) {
		this._changed()
	},
	onUnitsChanged: function(a) {
		this._changed()
	},
	onAlignChanged: function(a) {
		this._changed()
	},
	onDisplayModeChanged: function() {
		this._changed()
	},
	_changed: function() {
		this.trigger("valueChanged", {
			url: $(".audio-url input[type=text]", this.el).val(),
			fileSize: $("li.active img", this.el).attr("fileSize"),
			width: {
				value: $(".audio-width input[type=text]", this.el).val(),
				units: $(".audio-width input[type=radio]:checked", this.el).val()
			},
			height: {
				value: $(".audio-height input[type=text]", this.el).val(),
				units: $(".audio-height input[type=radio]:checked", this.el).val()
			},
			align: $(".audio-align select", this.el).val(),
			displayMode: $(".audio-display select", this.el).val()
		})
	},
	onTabsClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".tabs-content", b.el).hide(),
		$(".tabs-content:eq(" + c.index() + ")", b.el).show().find("li").removeClass("active"),
		b._loadAudioResouces()
		
	},
	onAudioItemClick: function(a) {
		var b = this, c = $(a.currentTarget);
		c.siblings().removeClass("active"),
		c.addClass("active"),
		$(".audio-url input[type=text]", b.el).val(c.find("img").attr("audioPath")), $(".fe input.ui-input-text").val(c.find("img").attr("title")).trigger("change", !0), b._changed()
	},
	onAttach: function() {
		var a = this, 
			b = window.App.getSitePath(),
			c = null,
			d = new qq.FileUploader({
				element: $(".audio-uploader", a.el).get(0),
				listElement: $(".audio-upload-list", a.el).get(0),
				action: b + "audioUpload.action",
				disableDefaultDropzone: true,
				autoUpload: true,
				inputName: "audio",
				uploadButtonText: "上传",
				cancelButtonText: "取消",
				failUploadText: "上传失败",
				allowedExtensions: ["mp3"],
				sizeLimit: 1024 * 500000 , //50m
				forceMultipart: true, //不使用XHR方式提交
				customErrorTips: function(item,result){
					var erorMsgObj = item.lastChild.lastChild;
					erorMsgObj.nodeValue += ", 原因:" + result.error;

				},
				onSubmit: function(){
					c  = parseInt($(".tabs-header li.active", a.el).index(), 10),
					d.setParams({
						productId: window.App.getLoadedApp().productId.getValue(),
						audioType: c + 1
					})
				},
				onComplete: function(e, f, g){
					if(g.success){
						var h = b + g.filepath.substr(1), n = g.fileName, s = g.fileSize, i = $(".tabs-content:eq(" +  c + ") ul", a.el), j = i.parent();											
						window.App.putAudioResouce(c + 1, {relativeUrl: g.filepath,fileSize:g.fileSize,audioName:g.fileName}),
						i.append("<li><img src='images/jqm/audio_.png' title='"+ n +"' fileSize='"+ s +"' fileName='"+ n +"' audiopath='"+ h +"' /></li>"),
						j.scrollTop(j.offset().top),
						$("li:last", i).trigger("click")						
					}
					setTimeout(function(){
						$(".audio-upload-list", a.el).html("")
					}, 2500)
				},
				onError: function(d, e, f){
					
				}
			});
		
		//加载mp3库
		a._loadAudioResouces()
		
	},
	_loadAudioResouces: function(){
		console.log("VideoWidget: loading audio resouces.");
		var a = this, b = $(".tabs-header li.active", a.el), c = parseInt(b.index(), 10);
		if(!b.data("init")){
			var d = window.App.getAudioResouces(c + 1), e = "";
			$.each(d, function(i, n){
				e += "<li><img src='images/jqm/audio_.png' title='"+ n.audioName +"' fileSize='" + n.fileSize + "' fileName='" + n.audioName + "' audioPath='" + window.App.getSitePath() + n.relativeUrl.substr(1) +"' /></li>"
			}),
			$(".tabs-content:eq(" + c + ") ul", a.el).html("").append(e),
			b.data("init", !0)
		}
	}
});

Handlebars.registerHelper("radioitems_render",function(a, b) {
	var c = [];
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = "#sub-template-widget-radioitems",
		g = Handlebars.compile($(f).html()),
		h = g($.extend({}, e));
		c.push(h)
	}
	return c.join("")
});

/**
 * 单选按钮视图控件
 */
var RadioItemsWidget = ListWidget.extend({
	initialize: function(a, b) {
		ListWidget.prototype.initialize.call(this, "radioitems", a),
		this._data = {
			items: []
		}
	},
	getItemData: function(a, b){
		var d = a === "add";
		return {
			text: d ? "选项" : $("input.text", b).val(),
			//value值不在页面上显示，取原来的
			value: d ? null : this._data.items[b.index()].value, //$("input.value", b).val(),
			_controlId: d ? null : this._data.items[b.index()]._controlId
		}
	}
});


// Handlebars.registerHelper("checkboxitems_render", function(a, b) {
// 	var c = [];
// 	for (var d = 0; d < a.length; d++) {
// 		var e = a[d],
// 		f = "#sub-template-widget-checkboxitems",
// 		g = Handlebars.compile($(f).html()),
// 		h = g($.extend({},
// 		e));
// 		c.push(h)
// 	}
// 	return c.join("")
// });


// /**
//  * 复选框Items Widget控件
//  */
// var CheckboxItemsWidget = ListWidget.extend({
// 	initialize: function(a) {
// 		ListWidget.prototype.initialize.call(this, "checkboxitems", a)
// 	},
// 	getItemData: function(a, b){
// 		var d = a === "add";
// 		return {
// 			text: d ? "选项" : $("input.text", b).val(),
// 			value: d ? "" : $("input.value", b).val(),
// 			_controlId: d ? null : this._data.items[b.index()]._controlId
// 		}
// 	}
// });


Handlebars.registerHelper("mapmarkers_render", function(a, b) {
	var c = [];
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = "#sub-template-widget-mapmarkers",
		g = Handlebars.compile($(f).html()),
		h = g($.extend({},
		e));
		c.push(h)
	}
	return c.join("")
});

/**
 * 地图标记视图控件
 */
 
var MapMarkerWidget = ListWidget.extend({
	initialize: function(a) {
		ListWidget.prototype.initialize.call(this, "mapmarker", a)
	},
	getItemData: function(a, b){
		var d = a === "add";
		return {
			text: $("input.location", b).val() || "",
			location: $("input.location", b).val() || ""
		}
	},
	onItemChanged: function(a){
		var b = this;
		clearTimeout(this._changeTimeout),
		this._changeTimeout = setTimeout(function() {
			ListWidget.prototype.onItemChanged.call(b, a)
		},
		1e3)
	}
});

Handlebars.registerHelper("tablecolumns_render", function(a, b) {
	var c = [], 
		//获取当前选择的表格数据源
		datasource = $("select:first", window.App.getPropertyView().el).val(),
		columns = window.App.getColumnsForDataTable(datasource);
	for (var d = 0; d < a.length; d++) {
		var e = a[d],
		f = new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], columns));
		f.setValue(e.columnValue),
		f.render();

		var n = "#sub-template-widget-tablecolumns",
		o = Handlebars.compile($(n).html()),
		p = o($.extend({
			columnSelect: $(f.el).html()
		},
		e));
		c.push(p)
	}
	return c.join("")
});

/**
 * 表格表
 */
var TableColumnsWidget = ListWidget.extend({
	initialize: function(a) {
		ListWidget.prototype.initialize.call(this, "tablecolumns", a)
	},
	getItemData: function(a, b) {
		var d = a === "add", 
			e = $("#userview-property select:first").val(), //下拉框“数据源”的值
			f = window.App.getDefaultColumnForDataTable(e),
			g = $("select > option:selected", b);
		return {
			text: "列 - " + (d ? f.text : g.text()),
			columnValue: d ? f.value : g.attr("value"),			
			columnText: d ? f.text : g.text(),
			priority: 1 //指定相同的priority属性，使其表格列默认都显示
		}
	}
}),

/**
 * 文字样式
 */
FontStyleWidget = Widget.extend({
	initialize: function(a){
		Widget.prototype.initialize.call(this, "fontstyle", a)
		// this._data = {
		// 	fontStyle: "normal",
  //           fontWeight: "normal",
  //           fontColor: "#2489CE",
  //           textDecoration: "underline"
		// }
	},
	events: {
		"click a.font-weight, a.font-style, a.text-decoration": "onFontStyleClicked",
		"mouseenter a.font-color": "onFontColorMouseenter",
		"mouseleave a.font-color": "onFontColorMouseleave"
	},
	onFontStyleClicked: function(e){
		var a = $(e.currentTarget);
		a.toggleClass("selected"),
		this._valueChanged()
	},
	onFontColorMouseenter: function(e){
		var a = $(e.currentTarget), 
			b = $("#font-color-menu"), 
			c = SETTINGS.FONTCOLOR, 
			d = c.length,
			e = '<a href="javascript:;" title="$color" style="background-color: $color"></a>',
			f = '',
			g = a.offset(),
			h = this;

		//创建颜色选择菜单并绑定相关事件
		if(b.length < 1){
			b = $('<div id="font-color-menu" class="font-color-menu" />').appendTo( $("body") ),

			b.delegate("a", "click", function(e){
				var a = $(e.currentTarget), b = a.attr("title"), c = $(this).parent(), d = c.data("widget");				
				c.hide(),
				d.$("a.font-color .color-preview").attr("val", b).css("background-color", b),
				d._valueChanged()
			})
			.bind("mouseleave", function(){
				$(this).hide()
			});

			for (var i = 0; i < d; i++) {
				f += e.replace(/\$color/g, c[i])
			}

			b.append(f)
		}
		
		//重新定义颜色选择菜单位置，并缓存当前widget对象
		b.css({
			top: g.top + 22,
			left: g.left
		}).data("widget", this).show()
	},
	onFontColorMouseleave: function(e){
		var a = $("#font-color-menu");
		if( !Utils.containsPoint(e, a) ) a.hide()
	},
	_valueChanged: function(){
		var a = this.$("a.font-weight"),
			b = this.$("a.font-style"),
			c = this.$("a.font-color"),
			d = this.$("a.text-decoration");

		this.trigger("valueChanged", {
			fontWeight: a.hasClass("selected") ? "bold" : "normal",
			fontStyle: b.hasClass("selected") ? "italic" : "normal",
			fontColor: $(".color-preview", c).attr("val"),
			textDecoration: d.hasClass("selected") ? "underline" : "none"
		})
	}
}),

/**
 * 边距
 */
MarginSettingsWidget = Widget.extend({
	initialize: function(a, b) {
		Widget.prototype.initialize.call(this, "marginsettings", a),
		this._delay = b || 500
	},
	events: {
		"keyup input": "onKeyPress",
		"keydown input": "onKeyDown"
	},
	onKeyPress: function(a){
		var b = this;

		this._delay ? (

			clearTimeout(this._delayTimeout), 
			this._delayTimeout = setTimeout(function() {
				b.trigger("valueChanged", buildData())
			}, this._delay)

		) : this.trigger("valueChanged", buildData())

		function buildData(){			
			return {
				top: b.$("input[name=top]").val(),
				right: b.$("input[name=right]").val(),
				bottom: b.$("input[name=bottom]").val(),
				left: b.$("input[name=left]").val(),
				inline: b._data.inline
			}
		}
	},
	onKeyDown: function(a) {
		//避免按了ctrl+z等快键触发游览器默认行为，虽然输入框值被还原，但无法更新其它视图（如工具栏）
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	}
}),

/**
 * HTML源码
 */
HtmlSourceWidget = Widget.extend({
	initialize: function(a, b){
		Widget.prototype.initialize.call(this, "htmlsource", a),
		this._delay = b || 500
	},
	events: {
		"keyup textarea": "onKeyPress",
		"keydown textarea": "onKeyDown"
	},
	onKeyPress: function(){
		var b = this;

		this._delay ? (

			clearTimeout(this._delayTimeout), 
			this._delayTimeout = setTimeout(function() {
				b.trigger("valueChanged", b.$("textarea").val())
			}, this._delay)

		) : this.trigger("valueChanged", b.$("textarea").val())
	},
	onKeyDown: function(a){
		//避免按了ctrl+z等快键触发游览器默认行为，虽然输入框值被还原，但无法更新其它视图（如工具栏）
		return (a.ctrlKey || a.metaKey) && a.which == 90 ? (window.App.undo(), !1) : (a.ctrlKey || a.metaKey) && a.which == 89 ? (window.App.redo(), !1) : !0
	},
	setValue: function(a){
		this._data.htmlsource = this._decode(a)
	},
	_encode: function(str){
		var s = "";   
		if (!str || str.length === 0) return "";   
		s = str.replace(/&/g, "&gt;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/ /g, "&nbsp;")
			.replace(/\'/g, "&#39;")
			.replace(/\"/g, "&quot;")
			.replace(/\n/g, "<br>");   
		return s;
	},
	_decode: function(str){
		var s = "";   
		if (!str || str.length === 0) return "";   
		s = str.replace(/&gt;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&nbsp;/g, " ")
			.replace(/&#39;/g, "\'")
			.replace(/&quot;/g, "\"")
			.replace(/<br>/g, "\n");   
		return s;
	}
});
