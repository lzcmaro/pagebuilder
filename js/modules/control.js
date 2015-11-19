/**
 *	control 控件父类
 */
Control = Backbone.View.extend({
	/**
	 * a, controlType
	 * b, _template
	 * c, 表示是否需要添加别名
	 */
    initialize: function (a, b, c) {		
        this._id = null,		
        this._name = SETTINGS.CONTROLNAMES[a], //控件名称，属性窗口标题显示值
		this.controlType = a,
		this._template = b,		
        this.children = [],
        this.childrenLookup = {},
        this.namedChildren = {},
        this.appendSelector = ":first",
        this._propertiesMap = {},
        this._appendMode = SETTINGS.ControlAppendMode.CONTENT_APPEND,
        this._alreadyAfterBound = !1,
        this._layout = new BoxLayout(this),
        this._isContainer = !1,
        this._supportsSorting = !1,
        this._supportsChildRendering = !0,
        this._canDelete = !0,
        this._sortableItemsSelector = "> [data-cid]",
        this._dropShim = '<div class="shim"></div>', //控件在拖拽到设备器中时，显示的垫片层
		this._dropShimSelector = ".shim",
		this._initDefaultProperties(c) //初始化控件的默认属性
    },
	/**
	 * 渲染
	 * a, 渲染的目的地
	 */
    render: function (a) {
        console.log("CONTROL: rendering ", this.getId());
        var c = this._getRenderData(),
            d = "#template-control-" + this._template,
            e = Handlebars.compile($(d).html()),
            f = e(c),
            g = a.createElement("div"),
            h,
            i;
        $(g).html(f),
        g.children.length > 0 && (
			h = $(g).children(),
			i = $(h.get(0)).attr("data-cid", this._id).addClass("cfwx-control"),
			//this.getParent() && this.getParent().supportsSorting() && $(i).addClass("moveable"), 
			this._isContainer && i.addClass("cfwx-container"),
			this.getControlType() == "page" && this._deviceRenderedEl ? this._deviceRenderedEl.empty() : this._deviceRenderedEl = h,
			this._layout.render(a),
			this._layout.el.children.length > 0 && this.positionLayoutElement(this._deviceRenderedEl, this._layout.el),
			this.trigger("controlRendered")
        ),
        this.el = g
    },
    getId: function () {
        return this._id
    },
    setId: function (a) {
        this._id = a
    },
    getName: function () {
        return this._name
    },
	getChild: function(a) {
		return a >= this.children.length || a < 0 ? null: this.children[a]
	},
    setParent: function (a) {
        this.parentControl = a
    },
    getParent: function () {
        return this.parentControl
    },
    setAppendMode: function (a) {
        this._appendMode = a
    },
    getAppendMode: function () {
        return this._appendMode
    },
    isContainer: function () {
        return this._isContainer
    },
    setIsContainer: function (a) {
        this._isContainer = a
    },
    supportsSorting: function () {
        return this._supportsSorting
    },
    setSupportsSorting: function (a) {
        this._supportsSorting = a
    },
	getLayout: function() {
		return this._layout
	},
	setLayout: function(a) {
		this._layout = a
	},
    setSortableItemsSelector: function (a) {
        this._sortableItemsSelector = a
    },
    getSortableItemsSelector: function () {
        return this._sortableItemsSelector
    },
	//获取Control的类型
    getControlType: function () {
        return this.controlType
    },
    //获取排序（由它的pos进行排序）后属性集合
    getPropertiesSorted: function () {
        return this._sortProperties()
    },
	//判断当前控件是否可作为有效的节点（页面导航窗显示的元素节点）
	isValidNode: function () {
		var a = this, b = this.controlType, c = (this.parentControl ? this.parentControl.controlType : "");
		return (b == "heading" ? !(c == "pageheader" || c == "pagefooter") : !0) && !{
				pagecontent: 1,
				collapsiblecontent: 1,
				radio: 1,
				checkbox: 1,
				gridblock: 1
			}.hasOwnProperty(b)
	},
    //获取渲染的数据（用于填充模版）
    _getRenderData: function () {
        var a = {
            __control: this,
            __children: this.children,
            __namedChildren: this.namedChildren
        };
        return $.extend(a, this._propertiesMap),
        a
    },
	/**
	 * 初始化控件的默认属性
	 * a, 标识是否添加title属性
	 */
    _initDefaultProperties: function (a) {
		//ControlView.render()时将使用到了Control.initialize()，这时App.js尚未加载
		var titleText = window.Utils ? this._name + Utils.IdGiver.give(this.controlType) : this._name;
		//控件title，页面列表中显示（方便用户起别名）
        a || this.isValidNode() && (
            this.title = new ScalarProperty("控件名称", new SingleTextWidget(new AcceptAllInputFilter), titleText), 
            this.addProperty("title", this.title, {pos: -2}),
            this.margin = new ScalarProperty("边距", new MarginSettingsWidget(null), {
                top: "",
                right: "",
                bottom: "",
                left: "",
                inline: false
            }),
            this.addProperty("margin", this.margin, {pos: -1})
        )
	},
    addProperty: function (a, b, c) {
        this._propertiesMap[a] = {},
        $.extend(this._propertiesMap[a], {
            property: b
        }, c);
        var d = this;
        //绑定Property的changed事件（由它的widget触发）
        b.bind("propertyChanged", function (a, b, c, e) {
            d.onPropertyChanged(a, b, c, e)
        })
    },
    getProperties: function () {
        return this._propertiesMap
    },
	getSerializedProperties: function() {
		var a = {};
		for (var b in this._propertiesMap) {
			var c = this._propertiesMap[b].property;
			a[b] = c.getValue()
		}
		return a
	},
    initFromSerialized: function (a) {
        this.setId(a.id),
        this.initFromSerializedProperties(a.properties)
    },
    //初始化控件的属性集合
    initFromSerializedProperties: function (a) {
        if (!a) return;
        for (var b in a) {
            var c = this._propertiesMap[b];
            c && c.property.setValue(a[b])
        }
    },
    //处理绑定新增控件events后的事情，如向该控件添加子元素等
    onAfterBind: function () {},
    setAlreadyAfterBound: function (a) {
        this._alreadyAfterBound = a
    },
    hasAlreadyAfterBound: function () {
        return this._alreadyAfterBound
    },
	_getRandomNumber: function(){
		return parseInt(Math.random() * 1000000 + 1, 10)
	},
	//初始化新增的子元素控件，设置它的id值
    _initChildControl: function (a) {
        if (!a.getId()) {
        	//var b = IdGiver.give(a.getControlType());
            a.setId(a.controlType + this._getRandomNumber()),
            console.log("CONTROL: new %s control added with id %s", a.getControlType(), a.getId())
        } else console.log("CONTROL: added existing child with id ", a.getId());
        return a.getId() === this.getId() ? (console.error("CONTROL: attempt to add child to itself"), !1) : !0
    },
    addChildAtPoint: function (a, b) {
        this.addChild(a)
    },
    addChild: function (a) {
		console.log("CONTROL: addChild", a, this);
        if (!this._initChildControl(a)) return;
        a.parentControl = this,
        this.children.push(a),
        this.childrenLookup[a.getId()] = a,
        this.trigger("childAdded", a) //见Builder._bindAddControlEvents()
    },
    //插入子控件，与addChild不大相同 
    insertChild: function (a, b) {
		console.log("CONTROL: insertChild", a, b);
        if (!this._initChildControl(a)) return;
        a.parentControl = this,
        this.children.splice(b, 0, a), //插入操作: b,起始位置;a,要插入的元素
        this.childrenLookup[a.getId()] = a,
        this.trigger("childAdded", a, b)
    },
    removeChild: function (a) {
        var b = -1,
            c = null;
        for (var d = 0; d < this.children.length; d++) {
            var e = this.children[d];
            if (e.getId() === a.getId()) {
                e.parentControl = null,
                c = e,
                b = d;
                break
            }
        }
        return b < 0 ? (console.error("CONTROL: couldn't find child to remove!"), c) : (console.log("CONTROL: Removed child with id: " + a.getId()), this.children.splice(b, 1), delete this.childrenLookup[a.getId()], this.trigger("childRemoved", a), c)
    },
	/**
	 * 根据索引删除子控件
	 * a, 索引值
	 */
	removeControlAtIndex: function(a) {
		if (a > this.children.length || a < 0) return;
		var b = this.children[a];
		return b.parentControl = null,
		this.children.splice(a, 1),
		delete this.childrenLookup[b.getId()],
		this.trigger("childRemoved", b),
		b
	},
    moveChild: function (a, b) {
        var c = -1;
        for (var d = 0; d < this.children.length; d++) {
            var e = this.children[d];
            if (e.getId() === a.getId()) {
                c = d;
                break
            }
        }
        return c < 0 ? -1 : (this.children.splice(d, 1), this.children.splice(b, 0, a), b)
    },
    getChildren: function () {
        return this.children
    },
    //通过id获取子元素
    getChildWithId: function (a) {
        for (var b = 0; b < this.children.length; b++) {
            var c = this.children[b];
            if (c.getId() === a) return c
        }
        return null
    },
    //获取control在device渲染的element
    getDeviceRenderedEl: function () {
        return this._deviceRenderedEl
    },
    setDeviceRenderedEl: function (a) {
        this._deviceRenderedEl = a
    },
    positionLayoutElement: function (a, b) {
        a.append($(b).contents())
    },
    _sortProperties: function () {
        var a = [];
        for (var b in this._propertiesMap) a.push($.extend({
            propertyName: b
        }, this._propertiesMap[b]));
        var c = a.sort(function (a, b) {
            if (a.pos > b.pos) return 1;
            if (a.pos === b.pos) return 0;
            if (a.pos < b.pos) return -1
        });
        return c
    },
    onDragOver: function (a, b) {},
    onDragPosition: function (a) {
        this.parent && this.parent.onDragPosition(a)
    },
    onDragDrop: function (a) {},
    onDragOut: function () {
        var a = this.getDeviceRenderedEl().get(0);
        $(this._dropShimSelector, a).remove()
    },
    onDropFinished: function () {
        $(this._dropShimSelector, this.getDeviceRenderedEl()).remove()
    },
    /**
     * 判断当前坐标是否在element（控件在Device中渲染后）内
     * a, 坐标对象
     */
    containsPoint: function (a) {
        var b = $(this.getDeviceRenderedEl()),
            c = b.offset(),
            d = b.outerWidth(),
            e = b.outerHeight(),
            f = this.getCalculatedMargin();
        if (f[3] < 0 && f[1] < 0) {
            if (a.x > c.left + d + -f[1] || a.x < c.left + f[3] || a.y > c.top + e || a.y < c.top) return !1
        } else if (a.x > c.left + d || a.x < c.left || a.y > c.top + e || a.y < c.top) return !1;
        return !0
    },
    /**
     * 判断当前坐标是否在element（控件在Device中渲染后）中间位置
     * a, 坐标对象
     */
    isPointAfterMidway: function (a) {
        var b = $(this.getDeviceRenderedEl()),
            c = b.offset(),
            d = b.outerWidth(),
            e = b.outerHeight();
        return a.y >= c.top + e / 2 && a.y <= c.top + e
    },
    //获取control计算后的width值
    getCalculatedWidth: function () {
        var a = this._deviceRenderedEl;
        return a ? $(a).outerWidth() : 0
    },
    //获取control计算后的margin值
    getCalculatedMargin: function () {
        var a = this._deviceRenderedEl;
        if (a) {
            var b = parseInt($(a).css("marginLeft"), 10),
                c = parseInt($(a).css("paddingLeft"), 10),
                d = parseInt($(a).css("marginTop"), 10),
                e = parseInt($(a).css("paddingTop"), 10),
                f = parseInt($(a).css("marginRight"), 10),
                g = parseInt($(a).css("paddingRight"), 10),
                h = parseInt($(a).css("marginBottom"), 10),
                i = parseInt($(a).css("paddingBottom"), 10);
            return [d + e, f + g, h + i, b + c]
        }
        return [0, 0, 0, 0]
    },
    //标识当前控件是否接受子控件，子类可重写它来实现具体的情况，见PageContentControl
    acceptControl: function (a) {
        return !0
    },
    /**
     * 属性值发生变更
     * a, 属性对象
     * b, 属性原来的值
     * c, 属性变更后的值
     * d, 当属性类型为ArrayProperty时，可能它为true。用来标识是否需重新渲染PropertyView
     */
    onPropertyChanged: function (a, b, c, d) {
        console.log("CONTROL: property changed: ", this.getId(), a.getName(), b, c, d);
        this.trigger("propertyChanged", a, b, c),
        this.trigger("controlUpdated", this, d)
    },
    /**
     * 根据当前control.id获取它存在device的对象（不直接写在device.js是为了可重写该方法，以实现不同的control返回不同的对象映射）
     * a,传递过来的jQuery（Device.html引入的）对象
     */
    getDeviceExistingControl: function (a) {
        return a('[data-cid="' + this._id + '"]')
    },
    /**
     * 克隆控件
     * a, 标识是否克隆控件ID
     */
    cloneControl: function (a) {
        console.log("CONTROL: clone control", this);
        var b = ControlFactory.newControl(this.controlType);
        a && b.setId(this.getId());
        var c = b.getProperties();
        for (var d in this._propertiesMap) {
            var e = this._propertiesMap[d].property,
                f = c[d];
            if (!f) {
                console.error("Cloning control no property with name", d);
                continue
            }
            $.isArray(e.getValue()) ? f.property.setValue($.extend(!0, [], e.getValue())) : typeof e.getValue() == "object" ? f.property.setValue($.extend(!0, {},
            e.getValue())) : f.property.setValue(e.getValue())
        }
        for (var g = 0; g < this.children.length; g++) {
            var h = this.children[g],
                i = h.cloneControl(a);
            //i.setId(i.controlType + IdGiver.give(i.getControlType())),
			i.setId(i.controlType + this._getRandomNumber()),
            i.parentControl = b,
            b.children.push(i),
            b.childrenLookup[i.getId()] = i
        }
        return b
    },
	/**
	 * 暂时渲染到目的地（用于生成HTML）
	 */
	quickRenderTo: function(a) {
		if (! (this instanceof AppControl)) return;
		var b = document.createElement("div");
		this._layout.renderTo(b),
		$(a).append($(b).contents())
	},
	renderTo: function(a) {
		var b = this._getRenderData(),
		c = "#template-control-" + this._template,
		d = Handlebars.compile($(c).html()),
		e = d(b);
		$(a).html(e);
		var f = document.createElement("div");
		this._layout.renderTo(f),
		$(":first", a).append($(f).contents())
	}
}),
AppControl = Control.extend({
    initialize: function () {
		Control.prototype.initialize.call(this, "app", "app"),
		//对应后台返回的JSON字段
		//this.pageID = new ScalarProperty("模板ID", new NullWidget(), ""),
		this.name = new ScalarProperty("模板名称", new NullWidget(), ""),
		this.remark = new ScalarProperty("备注", new NullWidget(), ""),
        //this.templateType = new ScalarProperty("模板类型", new NullWidget(), ""),
        this.businessFlag = new ScalarProperty("业务标识", new NullWidget(), ""),
        this.businessName = new ScalarProperty("业务名称", new NullWidget(), ""),
		
		//this.addProperty("pageID", this.pageID, {pos: 1}),
		this.addProperty("name", this.name, {pos: 1}),
		this.addProperty("remark", this.remark, {pos: 1}),
        //this.addProperty("templateType", this.templateType, {pos: 1}),
        this.addProperty("businessFlag", this.businessFlag, {pos: 1}),
        this.addProperty("businessName", this.businessName, {pos: 1})
    }
}),

/* PageControl */
PageControl = Control.extend({
    initialize: function () {
        var that = this;

        Control.prototype.initialize.call(this, "page", "page"),
        this.margin._widget = new NullWidget(),
		this.title.setName("页面名称"),
        this.setIsContainer(!0),
        this.setSupportsSorting(!1),
        this.nodes = [],
        this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter, !1), ""),
        
        //因PageContentControl不可见，其padding属性在这里设置
        this.contentPadding = new ScalarProperty("内边距", new MarginSettingsWidget(), {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        }),

        this.addProperty("theme", this.theme, {pos: 1}),
        this.addProperty("contentPadding", this.contentPadding, {pos: 2})
    },
    addChildAtPoint: function (a, b) {
        a.getControlType() === "pageheader" ? this.insertChild(a, 0) : a.getControlType() == "pagefooter" || a.getControlType() == "tabbar" ? this.addChild(a) : Control.prototype.addChildAtPoint.call(this, a, b)
    },
    addNode: function (a) {
        //a.isValidNode() && (console.log("CONTROL: add node", this.getId(), a.getId()), this.nodes.push(a));
    	a.isValidNode() && this.nodes.push(a);
        for (var i = 0; i < a.children.length; i++) {
            this.addNode(a.children[i])
        }
    },
    removeNode: function (a) {
        for (var i = 0; i < this.nodes.length; i++) {
            var e = this.nodes[i];
            if (e.getId() === a.getId()) {
                e.parentControl = null,
                this.nodes.splice(i, 1);
                break
            }
        }
    },
    //初始化page控件的树节点（页面航导树中显示的节点）
    initTreeNodes: function () {
    	console.log("CONTROL: init page nodes", this.getId());
        this.nodes = [];
        for (var i = 0; i < this.children.length; i++) {
            this.addNode(this.children[i])
        }
    }
}),

/* PageContentControl */
PageContentControl = Control.extend({
    initialize: function () {
        Control.prototype.initialize.call(this, "pagecontent", "pagecontent"),
        this.setIsContainer(!0),
        this.setSupportsSorting(!0)
    },
    acceptControl: function (a) {
        return a.getControlType() != "pageheader" && a.getControlType() != "pagefooter" && a.getControlType() != "tabbar"
    },
    onDragOut: function () {
        var a = this.getDeviceRenderedEl().get(0);
        $(this._dropShimSelector, a).remove()
    },	
    /**
     * 鼠标拖拽元素到当前控件时的处理事件
     * a, 坐标对象
     * b, 当前拖拽的控件类型
     */
    onDragOver: function (a, b) {
        var c = ControlFactory.getControlForType(b);
        if (!c) return;
        var d = c.defaultSize,
            e = this.getDeviceRenderedEl().get(0);
        $(this._dropShimSelector, e).remove();
        var f = e.children,
            g = null,
            h = $(this._dropShim);
        c && d && h.css({
            width: d[0],
            height: d[1]
        });
        if (f.length <= 0) {
            $(e).append(h);
            return
        }
        for (var i = 0; i < e.children.length; i++) {
            var c = e.children[i],
                j = c.offsetLeft,
                k = c.offsetTop;
            if (!(i + 1 < e.children.length)) {
                if (k < a.y) {
                    $(h).insertAfter(c);
                    return
                }
                $(h).insertBefore(c);
                return
            }
            var l = e.children[i + 1];
            if (a.y > k && a.y < l.offsetTop) {
                $(h).insertAfter(c);
                return
            }
            if (a.y < k) {
                $(h).insertBefore(c);
                return
            }
        }
    },
    onDragPosition: function (a) {
		//console.log(a);
        var b = $("> .cfwx-control", this.getDeviceRenderedEl());
        $(this._dropShimSelector, b).remove();
        var c = b.children(),
            d = null;
        if (c.length <= 0 || a + 1 >= c.length || a == 0) {
            $(b).append(this._dropShim);
            return
        }
        var e = c[a + 1];
        $(this._dropShim).insertAfter(e)
    },
    addChildAtPoint: function (a, b) {
        if (this.children.length < 1 || !b) {
            Control.prototype.addChildAtPoint.call(this, a, b);
            return
        }
        for (var c = 0; c < this.children.length; c++) {
            var d = this.children[c],
                e = d.getDeviceRenderedEl().get(0);
            if (e.offsetTop > b.y) {
                this.insertChild(a, c);
                return
            }
        }
        Control.prototype.addChildAtPoint.call(this, a, b)
    },
    getIndexAtPoint: function (a) {
        if (this.children.length < 1 || !a) return 0;
        for (var b = 0; b < this.children.length; b++) {
            var c = this.children[b],
                d = c.getDeviceRenderedEl().get(0);
            if (d.offsetTop < a.y) return b
        }
        return 0
    }
}),

/* PageHeaderControl */
PageHeaderControl = Control.extend({
	/**
	 * 初始化方法，这里加上两个参数，对应着父类的参数，方便PageFooter等同样的类继承
	 */
    initialize: function (a, b) {
        Control.prototype.initialize.call(this, a || "pageheader", b || "pageheader");
        var a = this;
        this.margin._widget = new NullWidget(),
        // this.setAppendMode(SETTINGS.ControlAppendMode.PAGE_APPEND),
        this.setIsContainer(!0),
        this.setSupportsSorting(!0),
        this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), "a"),
		//ISFIXED表示是否固定模式, 属性在settings.js值设置
        this.isFixed = new ScalarProperty("固定位置", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISFIXED)), ""),

        this.noHeading = new ScalarProperty("No Heading", new NullWidget, "false"), //使用Heading
        this.addProperty("theme", this.theme, {
            pos: 1
        }),
        this.addProperty("isFixed", this.isFixed, {
            pos: 2
        }),
        this.addProperty("noHeading", this.noHeading, {
            pos: 3
        }),
        this.bind("childRemoved", function (b) {
            a.noHeading.setValue(a.children.length ? "false" : "true"),
            a.trigger("controlUpdated", a, !1)
        }),
        this.bind("childAdded", function (b) {          
            a.noHeading.setValue("false"),
            a.trigger("controlUpdated", a, !1)
        })
    },
    /**
     * 鼠标拖拽元素到当前控件时的处理事件
     * a, 坐标对象
     * b, 当前拖拽的控件类型
     */
    onDragOver: function (a, b) {
        var c = ControlFactory.getControlForType(b);
        if (!c) return;
        var d = c.defaultSize,
            e = this._deviceRenderedEl.get(0);
        $(this._dropShimSelector, e).remove();
        var f = e.children,
            g = null,
            h = this._deviceRenderedEl.width(),
            i = this._deviceRenderedEl.height(),
            j = $(this._dropShim);
        c && d && (b === "button" ? j.css({
            width: 63,
            height: 28
        }) : j.css({
            width: d[0],
            height: d[1]
        })),
        //如果为button控件，为其添加ui-btn-left或ui-btn-right样式
        b === "button" && a.y < i - 5 && (a.x < h / 2 ? (console.log("CONTROL: drag to left of header"), j.removeClass("ui-btn-right").addClass("ui-btn ui-btn-left")) : (console.log("CONTROL: drag to right of header"), j.removeClass("ui-btn-left").addClass("ui-btn ui-btn-right")));
        if (f.length <= 0) {
            $(e).append(j);
            return
        }
        for (var k = 0; k < e.children.length; k++) {
            var c = e.children[k],
                l = c.offsetLeft,
                m = c.offsetTop;
            if (!(k + 1 < e.children.length)) {
                if (m < a.y) {
                    $(j).insertAfter(c);
                    return
                }
                $(j).insertBefore(c);
                return
            }
            var n = e.children[k + 1];
            if (a.y > m && a.y < n.offsetTop) {
                $(j).insertAfter(c);
                return
            }
            if (a.y < m) {
                $(j).insertBefore(c);
                return
            }
        }
    },
    /**
     * 在当前坐标位置插入子控件
     * a, 需要插入的控件
     * b, 坐标对象
     */
    addChildAtPoint: function (a, b) {
        if (this._deviceRenderedEl && b) {
            var c = this._deviceRenderedEl.width(),
                d = this._deviceRenderedEl.height();
            //普通按钮，添加extraClasses
            a.controlType == "button" && b.y < d - 5 && (b.x < c / 2 ? a.extraClasses.setValue("ui-btn-left") : a.extraClasses.setValue("ui-btn-right"))
        }       
        if (this.children.length < 1 || !b) {
            Control.prototype.addChildAtPoint.call(this, a, b);
            return
        }
        for (var e = 0; e < this.children.length; e++) {
            var f = this.children[e],
                g = f.getDeviceRenderedEl().get(0);
            if (g.offsetTop > b.y) {
                this.insertChild(a, e);
                return
            }
        }
        Control.prototype.addChildAtPoint.call(this, a, b)
    },
    /**
     * 获取当前坐标所处位置的控件的索引值
     * a, 坐标对象
     */
    getIndexAtPoint: function (a) {
        if (this.children.length < 1 || !a) return 0;
        for (var b = 0; b < this.children.length; b++) {
            var c = this.children[b],
                d = c.getDeviceRenderedEl().get(0);
            if (d.offsetTop < a.y) return b
        }
        return 0
    },
    /**
     * 绑定控件事件后触发的处理事件
     */
    onAfterBind: function () {
        var a = new HeadingControl(!0); // !0 标识不需要加title 别名
        a.text.setValue("页头"),
        a.size.setValue(3),
        this.addChild(a)
    }
}, {
    defaultSize: ["100%", 39]
}),

/**
 * PageFooter(页面底部)控制器
 */
PageFooterControl = PageHeaderControl.extend({
    initialize: function () {
        PageHeaderControl.prototype.initialize.call(this, "pagefooter", "pagefooter"),
        this.isFixed.setValue("fixed")
    },
    onAfterBind: function () {
        var a = new HeadingControl(!0);
        a.text.setValue("页脚"),
        a.size.setValue(3),
        this.addChild(a)
    }
}, {
    defaultSize: ["100%", 39]
}),

/* HeadingControl */

HeadingControl = Control.extend({
	
    initialize: function (d) {
        var a = this;
        Control.prototype.initialize.call(this, "heading", "heading", d);
        var b = 2,
            c = "标题";

        this.text = new ScalarProperty("文本", new SingleTextWidget(new AcceptAllInputFilter), c);
        //2013.02.06修改，PageHeaderControl、PageFooterControl中的Heading不给予设置字体大小。这里不能删除size属性，因为HTML模板用的是<h1>标签
        this.size = new ScalarProperty("尺寸", d ? new NullWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.SIZE)) : new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.SIZE)), b),
        this.addProperty("text", this.text, {
            pos: 0
        }),
        this.addProperty("size", this.size, {
            pos: 1
        })
        
    }
}, {
    defaultSize: ["100%", 24]
}),

/**
 * NavBar(导航)控制器
 */
NavBarControl = Control.extend({
    initialize: function () {
        Control.prototype.initialize.call(this, "navbar", "navbar");
        var c = [{
            text: "按钮",
            url: window.App ? "#" + window.App.getCurrentPage().getId() : "",
            icon: "arrow-u", // 默认加上左箭头
            theme: "",
            isActive: !1
        }];
        this.iconPos = new ScalarProperty("图标位置", new IconSelectWidget(IconSelectWidget.ALIGN_ONLY), {
            align: "top"
        }),
        this.items = new ArrayProperty("元素集合", new ButtonListItemWidget(new AcceptAllInputFilter), c),
        this.addProperty("iconPos", this.iconPos, {
            pos: 1
        }),
        this.addProperty("items", this.items, {
            pos: 2
        })
    }
}, {
    defaultSize: ["100%", 36]
}),

/**
 * ListView(列表视图)控制器
 */
ListViewControl = Control.extend({
    initialize: function () {
        var a = this;
        Control.prototype.initialize.call(this, "listview", "listview"),
        this.dividerTheme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), "b"),
		//ISREADONLY表示是否只读,属性在settings.js中设置
        //this.isReadOnly = new ScalarProperty("只读", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISREADONLY)), "false"),
		//DISPLAYINSET表示是否以插入的方式显示,属性在settings.js中设置
        this.displayInset = new ScalarProperty("嵌入", new NullWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.DISPLAYINSET)), "true"),
        this.items = new ArrayProperty("元素集合", new ListViewItemsWidget(new AcceptAllInputFilter), []),
        this.addProperty("dividerTheme", this.dividerTheme, {
            pos: 1
        }),
        // this.addProperty("isReadOnly", this.isReadOnly, {
        //     pos: 2
        // }),
        this.addProperty("displayInset", this.displayInset, {
            pos: 2
        }),
        this.addProperty("items", this.items, {
            pos: 3
        }),
        this.items.setValue([{
            text: "分栏",
            isDivider: !0
        }, {
            text: "按钮",
            isDivider: !1,
            transition: "slide",
            theme: "c",
            url: window.App ? "#" + window.App.getCurrentPage().getId() : ""
        }])
    }
}, {
    defaultSize: ["100%", 74]
}),

/**
 * Collapsible(可折叠的)控制器
 */
CollapsibleSetControl = Control.extend({
    initialize: function () {
        var a = this;
        Control.prototype.initialize.call(this, "collapsible", "collapsible"),
        this.setIsContainer(!0),
        this.setSupportsSorting(!1),
        this.setSortableItemsSelector("> .ui-collapsible-content > [data-cid], > .ui-collapsible > .ui-collapsible-content > [data-cid]");

		this.headerTheme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), ""),
        this.contentTheme = new ScalarProperty("内容主题", new ThemeSelectorWidget(new AcceptAllInputFilter), ""),
        this.sections = new ArrayProperty("元素集合", new AccordionSectionItemWidget(new AcceptAllInputFilter), []),
        this.addProperty("sections", this.sections, {
            pos: 2
        }),
        this.addProperty("headerTheme", this.headerTheme, {
            pos: 0
        }),
        this.addProperty("contentTheme", this.contentTheme, {
            pos: 1
        }),
        this.sections.bind("itemAdded",function (b) {
            var c = new CollapsibleContentControl;
            c.headerText.setValue(b.text),
            c.isCollapsed.setValue(b.isCollapsed),
            a.addChild(c),
            b._controlId = c.getId()
        }),
        this.sections.bind("itemChanged",function (b, c) {
            var d = b._controlId,
                e = a.getChildWithId(d);
            console.log("CONTROL: changed collapsible with id", d);
            if (!e) return;
            e.headerText.setValue(b.text),
            e.isCollapsed.setValue(b.isCollapsed)
        }),
        this.sections.bind("itemDeleted",function (b) {
            var c = b._controlId,
                d = a.getChildWithId(c);
            console.log("CONTROL: changed collapsible with id", c);
            if (!d) return;
            a.removeChild(d)
        }),
        this.sections.bind("itemMoved",function (b, c) {
            var d = a.getChild(c);
            d && a.moveChild(d, b)
        }),
        this.sections.setValue([{
            text: "标题",
            isCollapsed: !1
        }])
    },
    onAfterBind: function () {
        var a = new CollapsibleContentControl;
        //a.headerText.setValue("标题"),
        //a.isCollapsed.setValue(!1),
        this.addChild(a),
        this.sections.getWidget()._data.items[0]._controlId = a.getId()
    },
    getCalculatedWidth: function () {
        var a = $("h3:first").outerWidth(!0);
        return a
    },
	// 获取/计算margin值
    getCalculatedMargin: function () {
        var a = $("h3:first", this._deviceRenderedEl);
        if (a) {
            var b = parseInt($(a).css("marginLeft")),
                c = parseInt($(a).css("marginTop")),
                d = parseInt($(a).css("marginRight")),
                e = parseInt($(a).css("marginBottom"));
            return [c, d, e, b]
        }
        return [0, 0, 0, 0]
    },
    cloneControl: function (a) {
        console.log("CONTROL: clone control", this);
        var b = ControlFactory.newControl(this.controlType);
        a && b.setId(this.getId());
        var c = b.getProperties();
        for (var d in this._propertiesMap) {
            var e = this._propertiesMap[d].property,
                f = c[d];
            if (!f) {
                console.error("Cloning control no property with name", d);
                continue
            }
            $.isArray(e.getValue()) ? f.property.setValue($.extend(!0, [], e.getValue())) : typeof e.getValue() == "object" ? f.property.setValue($.extend(!0, {},
            e.getValue())) : f.property.setValue(e.getValue())
        }
        for (var g = 0; g < this.children.length; g++) {
            var h = this.children[g],
                i = h.cloneControl(a);
            //i.setId(i.controlType + IdGiver.give(i.getControlType())),
            i.setId(i.controlType + this._getRandomNumber()),
            i.parentControl = b,
            b.children.push(i),
            b.childrenLookup[i.getId()] = i,
            //修改属性sections中的_controlId值
            b.sections.getWidget()._data.items[g]._controlId = i.getId()
        }
        return b
    },
    onDragOver: function (a, b) {},
    addChildAtPoint: function (a, b) {
        if (this.sections.size() < 2 || !b) {
            if (this.children.length < 1 || !b) {
                Control.prototype.addChildAtPoint.call(this, a, b);
                return
            }
            for (var c = 0; c < this.children.length; c++) {
                var d = this.children[c],
                    e = d.getDeviceRenderedEl().get(0);
                if (e.offsetTop > b.y) {
                    this.insertChild(a, c);
                    return
                }
            }
        }
        Control.prototype.addChildAtPoint.call(this, a, b)
    },
    getIndexAtPoint: function (a) {
        if (this.children.length < 1 || !a) return 0;
        for (var b = 0; b < this.children.length; b++) {
            var c = this.children[b],
                d = c.getDeviceRenderedEl().get(0);
            if (d.offsetTop < a.y) return b
        }
        return 0
    }
}, {
    defaultSize: ["100%", 60]
}),

/**
 * Collapsible(可折叠的)内容控制器
 */
CollapsibleContentControl = Control.extend({
    initialize: function () {
        Control.prototype.initialize.call(this, "collapsiblecontent", "collapsiblecontent"),
        this.setIsContainer(!0),
        this.setSupportsSorting(!0),
        this.setSortableItemsSelector("> .ui-collapsible-content > [data-cid]"),
        this.headerText = new ScalarProperty("Header Text", new NullWidget, "标题"),
        this.isCollapsed = new ScalarProperty("Is Collapsed", new NullWidget, !1),
        this.addProperty("headerText", this.headerText, {
            pos: 0
        }),
        this.addProperty("isCollapsed", this.isCollapsed, {
            pos: 1
        })
    },
	
    /**
     * 鼠标拖拽元素到当前控件时的处理事件
     * a, 坐标对象
     * b, 当前拖拽的控件类型
     */
    onDragOver: function (a, b) {
        var c = ControlFactory.getControlForType(b);
        if (!c) return;
        var d = c.defaultSize,
            e = $(this.getDeviceRenderedEl()).children().get(1);
        $(this._dropShimSelector, e).remove();
        var f = e.children,
            g = null,
            h = $(this._dropShim);
        c && d && h.css({
            width: d[0],
            height: d[1]
        });
        if (f.length <= 0) {
            $(e).append(h);
            return
        }
        for (var i = 0; i < e.children.length; i++) {
            var c = e.children[i],
                j = c.offsetLeft,
                k = c.offsetTop;
            if (!(i + 1 < e.children.length)) {
                if (k < a.y) {
                    $(h).insertAfter(c);
                    return
                }
                $(h).insertBefore(c);
                return
            }
            var l = e.children[i + 1];
            if (a.y > k && a.y < l.offsetTop) {
                $(h).insertAfter(c);
                return
            }
            if (a.y < k) {
                $(h).insertBefore(c);
                return
            }
        }!(a.x < w / 2)
    },
    /**
     * 在当前坐标位置插入子控件
     * a, 需要插入的控件
     * b, 坐标对象
     */
    addChildAtPoint: function (a, b) {
        if (this.children.length < 1 || !b) {
            Control.prototype.addChildAtPoint.call(this, a, b);
            return
        }
        for (var c = 0; c < this.children.length; c++) {
            var d = this.children[c],
                e = d.getDeviceRenderedEl().get(0);
            if (e.offsetTop > b.y) {
                this.insertChild(a, c);
                return
            }
        }
        Control.prototype.addChildAtPoint.call(this, a, b)
    }
}),

/* 文本域 */
TextBlockControl = Control.extend({
	initialize: function() {
		var a = this, b = "<b>在这里输入内容...</b>";
		Control.prototype.initialize.call(this, "text", "textblock");
        this.margin._widget = new NullWidget(),
		this.text = new ScalarProperty("Text", new TextEditorWidget(new AcceptAllInputFilter), b),
		this.addProperty("text", this.text, { pos: 1 })
	}
}, {
	defaultSize: ["100%", 24]
}),
/**
 * 注册渲染表格的种类
 * a 表示2列
 * b 表示3列
 * c 表示4列
 * d 表示5列
 */
Handlebars.registerHelper("gridclass", function(a, b) {
	var c = {
		2 : "a",
		3 : "b",
		4 : "c",
		5 : "d"
	};
	return c[a]
}),
/**
 * 表格控制器
 */
GridControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "grid", "grid"),
		this.setLayout(new GridLayout(this)),
		this.setIsContainer(!0),
		this.setSupportsSorting(!1),
		// COLUMNS 表示列数,属性在settings.js中设置
		this.columns = new ScalarProperty("列", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.COLUMNS)), "2"),
		// ROWS 表示行数,属性在settings.js中设置
		this.rows = new ScalarProperty("行", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ROWS)), "1"),
		this.addProperty("columns", this.columns, {
			pos: 0
		}),
		this.addProperty("rows", this.rows, {
			pos: 1
		});
		var a = this;
		this.bind("propertyChanged", function(b, c, d) {
			var e = parseInt(a.rows.getValue()),
			f = parseInt(a.columns.getValue());
			a._resize(e, f)
		})
	},
	onAfterBind: function() {
		var a = new GridBlockControl;
		this.addChild(a);
		var b = new GridBlockControl;
		this.addChild(b),
		this._gridList = [[a, b]],
		this._resize(parseInt(this.rows.getValue()), parseInt(this.columns.getValue()))
	},
	_resize: function(a, b) {
		var c, d;
		for (c = 0; c < a * b; c++) d = this.getChild(c),
		d || (d = new GridBlockControl, this.insertChild(d, c));
		while (this.children.length > a * b) this.removeControlAtIndex(a * b)
	},
	getGrid: function() {
		return this._gridList
	}
},{
	defaultSize: ["100%", 60]
}),

/**
 * 表格单元格控制器
 */
GridBlockControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "gridblock", "gridblock"),
		this.setIsContainer(!0),
		this.setSupportsSorting(!0),
		this.columnIndex = new ScalarProperty("Index", new SingleTextWidget(new AcceptUrlInputFilter), "a"),
		this.addProperty("columnIndex", this.columnIndex, {
			pos: 0
		})
	},
    /**
     * 鼠标拖拽元素到当前控件时的处理事件
     * a, 坐标对象
     * b, 当前拖拽的控件类型
     */
	onDragOver: function(a, b) {
		var c = ControlFactory.getControlForType(b);
		if (!c) return;
		var d = c.defaultSize,
		e = $(this.getDeviceRenderedEl()).get(0);
		$(this._dropShimSelector, e).remove();
		var f = e.children,
		g = null,
		h = $(this._dropShim);
		c && d && h.css({
			width: d[0],
			height: d[1]
		});
		if (f.length <= 0) {
			$(e).append(h);
			return
		}
		for (var i = 0; i < e.children.length; i++) {
			var c = e.children[i],
			j = c.offsetLeft,
			k = c.offsetTop;
			if (! (i + 1 < e.children.length)) {
				if (k < a.y) {
					$(h).insertAfter(c);
					return
				}
				$(h).insertBefore(c);
				return
			}
			var l = e.children[i + 1];
			if (a.y > k && a.y < l.offsetTop) {
				$(h).insertAfter(c);
				return
			}
			if (a.y < k) {
				$(h).insertBefore(c);
				return
			}
		} ! (a.x < w / 2)
	},
	addChildAtPoint: function(a, b) {
		if (this.children.length < 1 || !b) {
			Control.prototype.addChildAtPoint.call(this, a, b);
			return
		}
		for (var c = 0; c < this.children.length; c++) {
			var d = this.children[c],
			e = d.getDeviceRenderedEl().get(0);
			if (e.offsetTop > b.y) {
				this.insertChild(a, c);
				return
			}
		}
		Control.prototype.addChildAtPoint.call(this, a, b)
	}
},{
	defaultSize: [60, 60]
}),

/*
 *link(链接)控制器
 *
*/
LinkControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "link", "link");
		var b = "文字链接",
		c = "fade";
		this.text = new ScalarProperty("文本", new SingleTextWidget(new AcceptAllInputFilter), b),
		this.url = new ScalarProperty("链接到", new UrlOrPageSelectWidget(new AcceptAllInputFilter), ""),
		// this.transition = new ScalarProperty("过渡效果", new TransitionSelectWidget(new AcceptAllInputFilter), c),
		// OPENNEWWINDOW 表示新窗口打开,属性在settings.js中设置
		this.openNewWindow = new ScalarProperty("新窗口打开", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.OPENNEWWINDOW)), "false"),
		
        this.fontFamily = new ScalarProperty("字体", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.FONTFAMILY))),
        this.fontSize = new ScalarProperty("字体大小", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.FONTSIZE)), "medium"),
        this.fontStyle = new ScalarProperty("字体样式", new FontStyleWidget(new AcceptAllInputFilter), {
            fontStyle: "normal",
            fontWeight: "normal",
            fontColor: "#2489CE",
            textDecoration: "underline"
        }),


        this.url.setValue(window.App ? "#" + window.App.getCurrentPage().getId() : ""),

        this.addProperty("text", this.text, {
			pos: 0
		}),
		this.addProperty("url", this.url, {
			pos: 1
		}),
		this.addProperty("openNewWindow", this.openNewWindow, {
			pos: 2
		}),
		// this.addProperty("transition", this.transition, {
		// 	pos: 3
		// }),
        this.addProperty("fontFamily", this.fontFamily, {
            pos: 4
        }),
        this.addProperty("fontSize", this.fontSize, {
            pos: 5
        }),
        this.addProperty("fontStyle", this.fontStyle, {
            pos: 6
        })

	}
},{
	defaultSize: ["100%", 24]
}),

/*
 *button(普通按钮)控制器
 *
*/
ButtonControl = Control.extend({
	initialize: function() {
		Control.prototype.initialize.call(this, "button", "button");
		var a = this,		
		b = "按钮",
		c = "false",
		d = window.App ? "#" + window.App.getCurrentPage().getId() : "",
        g = "",
		h = {
			icon: "",
			align: "left"
		},
		i = "fade";	
		this.text = new ScalarProperty("文本", new SingleTextWidget(new AcceptAllInputFilter), b),
		// ISINLINE 表示行内显示,属性在settings.js中设置
		this.isInline = new ScalarProperty("行内显示", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISINLINE)), c),
		this.icon = new ScalarProperty("图标", new IconSelectWidget(IconSelectWidget.ICON_ALIGN, new AcceptAllInputFilter), h),
		this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), g),
		this.url = new ScalarProperty("链接到", new UrlOrPageSelectWidget(new AcceptAllInputFilter), d),
		// ISREVERSETRANSITION 表示是否反向过渡,属性在settings.js中设置
		//this.isReverseTransition = new ScalarProperty("反向过渡", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISREVERSETRANSITION)), "false"),
		// ISBACKBUTTON 表示返回按钮,属性在settings.js中设置
		// this.isBackButton = new ScalarProperty("返回", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISBACKBUTTON)), "false"),
		// this.transition = new ScalarProperty("过渡效果", new TransitionSelectWidget(new AcceptAllInputFilter), i),
		//拖放到pageheader时，按钮显示为inline-block，但默认为ui-btn-left样式，这里接受参数设置，以便放到pageheader左或右侧
        this.extraClasses = new ScalarProperty("Extra Classes", new NullWidget, ""),
        this.addProperty("text", this.text, {
			pos: 0
		}),
		this.addProperty("url", this.url, {
			pos: 1
		}),
		// this.addProperty("transition", this.transition, {
		// 	pos: 2
		// }),
		this.addProperty("icon", this.icon, {
			pos: 3
		}),
		this.addProperty("theme", this.theme, {
			pos: 4
		}),
		this.addProperty("isInline", this.isInline, {
			pos: 5
		})
		// this.addProperty("isReverseTransition", this.isReverseTransition, {
		// 	pos: 6
		// }),
		// this.addProperty("isBackButton", this.isBackButton, {
		// 	pos: 7
		// })
        this.addProperty("extraClasses", this.extraClasses, {
            pos: 8
        })
	}
},{
	defaultSize: ["100%", 40]
}),

/**
 * 图片控制器
 */
ImageControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "image", "image");
        // this.margin.setValue({
        //     top: "",
        //     right: "",
        //     bottom: "",
        //     left: "",
        //     inline: true
        // }),
        this.margin._widget = new NullWidget(),
		this.image = new ScalarProperty("图片属性", new ImageWidget(new AcceptUrlInputFilter), {
			url: "",
			width: {
				value: 100,
				units: "%"
			},
			height: {
				value: 100,
				units: "px"
			},
			align: "left",
			displayMode: "block",
            link: window.App ? "#" + window.App.getCurrentPage().getId() : ""
		}),
		this.addProperty("image", this.image, {
			pos: 1
		})
	}
},{
	defaultSize: ["100%", 100]
}),

/**
 * 视频控制器
 */
VideoControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "video", "video");
        this.margin._widget = new NullWidget(),
		this.video = new ScalarProperty("视频属性", new VideoWidget(new AcceptUrlInputFilter), {
			url: "",
			width: {
				value: 100,
				units: "%"
			},
			height: {
				value: 150,
				units: "px"
			},
			align: "left",
			displayMode: "block"
		}),
		this.isIE8 = new ScalarProperty("isIE8", new NullWidget(), ($.browser.msie && $.browser.version < 9 ? !0 : !1)),
		this._random = new ScalarProperty("_random", new NullWidget(), 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { //生成唯一标识码
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		})),
		this.addProperty("video", this.video, {
			pos: -1
		}),
		this.addProperty("isIE8", this.isIE8, {
			pos: 2
		}),
		this.addProperty("_random", this._random, {
			pos: 2
		})
	},
	/*重写视频*/
	renderTo: function(a) {
		var b = this._getRenderData(),
		c = "#template-control-" + this._template +"-final",
		d = Handlebars.compile($(c).html()),
		e = d(b);
		$(a).html(e);
		var f = document.createElement("div");
		this._layout.renderTo(f),
		$(":first", a).append($(f).contents())
	}
},{
	defaultSize: ["100%", 150]
}),

/**
 * 音频控制器
 */
AudioControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "audio", "audio");
        this.margin._widget = new NullWidget(),
		this.audio = new ScalarProperty("音频属性", new AudioWidget(new AcceptUrlInputFilter), {
			url: "",
			width: {
				value: 100,
				units: "%"
			},
			height: {
				value: 28,
				units: "px"
			},
			align: "left",
			displayMode: "block"
		}),
		this.isIE8 = new ScalarProperty("isIE8", new NullWidget(), ($.browser.msie && $.browser.version < 9 ? !0 : !1)),
		this.addProperty("audio", this.audio, {
			pos: 1
		}),
		this.addProperty("isIE8", this.isIE8, {
			pos: 2
		})
	},
	
	/*重写音频*/
	renderTo: function(a) {
		var b = this._getRenderData(),
		c = "#template-control-" + this._template +"-final",
		d = Handlebars.compile($(c).html()),
		e = d(b);
		$(a).html(e);
		var f = document.createElement("div");
		this._layout.renderTo(f),
		$(":first", a).append($(f).contents())
	}
},{
	defaultSize: ["100%", 28]
}),

/**
 * 表单控制器
 */
FormControlTemplate = Control.extend({
	initialize: function(a, b) {
		Control.prototype.initialize.call(this, a || "", b || ""),
		// ISMINI 表示是否小巧模式
		this.isMini = new ScalarProperty("小巧模式", new NullWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISMINI)), "false"),
		this.addProperty("isMini", this.isMini, {
			pos: 1
		})
	},
    getRandomValue: function(a){
        return a || "val_" + this._getRandomNumber()
    }
}),

/**
 * 提交按钮控制器
 */
SubmitButtonControl = FormControlTemplate.extend({
	initialize: function() {
		var a = this;
		FormControlTemplate.prototype.initialize.call(this, "submitbutton", "submitbutton");
		var b = "提交",
		c = "false",
		d = "",
		e = {
			icon: "",
			align: "left"
		};

        //提交按钮在经jquery.mobile渲染后，在外层生成了DIV，导致其margin设值无效
        this.margin._widget = new NullWidget(),
		this.text = new ScalarProperty("文本", new SingleTextWidget(new AcceptAllInputFilter), b),
		this.isInline = new ScalarProperty("内联", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISINLINE)), c),
		this.icon = new ScalarProperty("图标", new IconSelectWidget(IconSelectWidget.ICON_ALIGN, new AcceptAllInputFilter), e),
		this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), d),
		this.addProperty("text", this.text, {
			pos: 0
		}),
		this.addProperty("isInline", this.isInline, {
			pos: 5
		}),
		this.addProperty("icon", this.icon, {
			pos: 6
		}),
		this.addProperty("theme", this.theme, {
			pos: 7
		})
	},
	getDeviceExistingControl: function(a) {
		return a('[data-cid="' + this._id + '"]').parent()
	}
},{
	defaultSize: ["100%", 40]
}),

/**
 * 表单控制器
 */
FormControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "form", "form"),
		this.setIsContainer(!0),
		this.setSupportsSorting(!0);
		var b = "GET",
		c = "true";
		this.url = new ScalarProperty("提交到(URL)", new NullWidget(new AcceptAllInputFilter), ""),
		// ACTION 表示提交方式, 属性在settings.js中设置
		this.action = new ScalarProperty("提交方式", new NullWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ACTION)), b),
		// AJAX 表示是否ajax提交, 属性在settings.js中设置
		this.ajax = new ScalarProperty("Ajax 提交", new NullWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.AJAX)), c),
		this.addProperty("url", this.url, {
			pos: 0
		}),
		this.addProperty("action", this.action, {
			pos: 1
		}),
		this.addProperty("ajax", this.ajax, {
			pos: 2
		})
	},
	onDragOver: function(a, b) {
		var c = ControlFactory.getControlForType(b);
		if (!c) return;
		var d = c.defaultSize,
		e = $(this.getDeviceRenderedEl()).get(0);
		$(this._dropShimSelector, e).remove();
		var f = e.children,
		g = null,
		h = $(this._dropShim);
		c && d && h.css({
			width: d[0],
			height: d[1]
		});
		if (f.length <= 0) {
			$(e).append(h);
			return
		}
		for (var i = 0; i < e.children.length; i++) {
			var c = e.children[i],
			j = c.offsetLeft,
			k = c.offsetTop;
			if (! (i + 1 < e.children.length)) {
				if (k < a.y) {
					$(h).insertAfter(c);
					return
				}
				$(h).insertBefore(c);
				return
			}
			var l = e.children[i + 1];
			if (a.y > k && a.y < l.offsetTop) {
				$(h).insertAfter(c);
				return
			}
			if (a.y < k) {
				$(h).insertBefore(c);
				return
			}
		} ! (a.x < w / 2)
	},
	addChildAtPoint: function(a, b) {
		if (this.children.length < 1 || !b) {
			Control.prototype.addChildAtPoint.call(this, a, b);
			return
		}
		for (var c = 0; c < this.children.length; c++) {
			var d = this.children[c],
			e = d.getDeviceRenderedEl().get(0);
			if (e.offsetTop > b.y) {
				this.insertChild(a, c);
				return
			}
		}
		Control.prototype.addChildAtPoint.call(this, a, b)
	}
},
{
	defaultSize: ["100%", 40]
}),

/**
 * 单行文本输入控制器
 */
TextInputControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "textinput" ,"textinput");
		var b = "标签：",
		c = "",
		d = "text";
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), b),
		this.addProperty("label", this.label, {
			pos: 0
		}),
		this.placeholder = new ScalarProperty("文本占位符", new SingleTextWidget(new AcceptUrlInputFilter), c),
		this.addProperty("placeholder", this.placeholder, {
			pos: 1
		}),
		this.text = new ScalarProperty("初始值", new SingleTextWidget(new AcceptUrlInputFilter), c),
		this.addProperty("text", this.text, {
			pos: 2
		}),
		// INPUTTYPE为文本框输入类型
		this.inputType = new ScalarProperty("输入框类型", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.INPUTTYPE)), d),
		this.addProperty("type", this.inputType, {
			pos: 3
		})
	}
},
{
	defaultSize: ["100%", 56]
}),

/**
 * 多行文本输入框控制器
 */
TextAreaControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "textarea", "textarea");
		var b = "标签：",
		c = "",
		d = "text";
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), b),
		this.addProperty("label", this.label, {
			pos: 0
		}),
		this.placeholder = new ScalarProperty("文本占位符", new SingleTextWidget(new AcceptUrlInputFilter), c),
		this.addProperty("placeholder", this.placeholder, {
			pos: 1
		}),
		this.text = new ScalarProperty("初始值", new SingleTextWidget(new AcceptUrlInputFilter), c),
		this.addProperty("text", this.text, {
			pos: 2
		}),
		this.textareaHeight = new ScalarProperty("高度", new SingleTextWidget(new AcceptUrlInputFilter), c),
		this.addProperty("textareaHeight", this.textareaHeight, {
			pos: 3
		})
	}
},
{
	defaultSize: ["100%", 56]
}),

/**
 * 单选按钮控制器
 */
RadioButtonControl = FormControlTemplate.extend({
	initialize: function() {
		var a = this;
		FormControlTemplate.prototype.initialize.call(this, "radiobuttons", "radiobuttons"),
		this._supportsChildRendering = !1,
        //用于其子元素radio的name值，在jQueryMobile-1.3.0中，如果不指定radio的name值，其分组无效
        this.nameField = "radio_" + this.cid,
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), "选择："),
		this.orientation = new ScalarProperty("方向", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ORIENTATION)), "vertical"),
		this.items = new ArrayProperty("元素集合", new RadioItemsWidget(new AcceptAllInputFilter), [{
            text: "选项",
            value: this.getRandomValue()
        }]),
		
		this.addProperty("label", this.label, {
			pos: 0
		}),
		this.addProperty("orientation", this.orientation, {
			pos: 1
		}),
		this.addProperty("items", this.items, {
			pos: 2
		}),

		this.items.bind("itemAdded",function(b) {
			var c = new RadioInputControl, d = a.getRandomValue();
			c.label.setValue(b.text),
            c.value.setValue(d),
            a.addChild(c),
            //改变b对象中的value值，以便更新界面上“值”的显示值
            b.value = d,
			b._controlId = c.getId()
		}),
		this.items.bind("itemChanged",function(b, c) {
			var d = b._controlId,
			e = a.getChildWithId(d);
			console.log("CONTROL: changed text input with id", d);
			if (!e) return;
			e.label.setValue(b.text),
			e.value.setValue(b.value)
		}),
		this.items.bind("itemDeleted",function(b) {
			var c = b._controlId,
			d = a.getChildWithId(c);
			console.log("CONTROL: changed checkbox with id", c);
			if (!d) return;
			a.removeChild(d)
		}),
		this.items.bind("itemMoved",function(b, c) {
			var d = a.getChild(c);
			d && a.moveChild(d, b)
		})

	},
	onAfterBind: function() {
		var a = new RadioInputControl;
		this.addChild(a),
		//a.label.setValue("选项"),
		this.items.getWidget()._data.items[0]._controlId = a.getId()
	},
    cloneControl: function (a) {
        console.log("CONTROL: clone control", this);
        var b = ControlFactory.newControl(this.controlType);
        a && b.setId(this.getId());
        var c = b.getProperties();
        for (var d in this._propertiesMap) {
            var e = this._propertiesMap[d].property,
                f = c[d];
            if (!f) {
                console.error("Cloning control no property with name", d);
                continue
            }
            $.isArray(e.getValue()) ? f.property.setValue($.extend(!0, [], e.getValue())) : typeof e.getValue() == "object" ? f.property.setValue($.extend(!0, {},
            e.getValue())) : f.property.setValue(e.getValue())
        }
        for (var g = 0; g < this.children.length; g++) {
            var h = this.children[g],
                i = h.cloneControl(a);
            //i.setId(i.controlType + IdGiver.give(i.getControlType())),
            i.setId(i.controlType + this._getRandomNumber()),
            i.parentControl = b,
            b.children.push(i),
            b.childrenLookup[i.getId()] = i,
            //修改属性items中的_controlId值
            b.items.getWidget()._data.items[g]._controlId = i.getId()
        }
        return b
    },
	positionLayoutElement: function(a, b) {
		var d = $(b).contents();
		d.insertAfter($("legend", a))
	},
	renderTo: function(a) {
		var b = this._getRenderData(),
		c = "#template-control-" + this._template,
		d = Handlebars.compile($(c).html()),
		e = d(b);
		$(a).html(e);
		var f = $("legend", a),
		g = document.createElement("div");
		this._layout.renderTo(g),
		$(g).children().insertAfter(f),
		this.trigger("controlRendered")
	}
},
{
	defaultSize: ["100%", 89]
}),
/**
 * 单选输入框控制器
 */
RadioInputControl = Control.extend({
	initialize: function() {
		Control.prototype.initialize.call(this, "radio", "radio"),
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), "选项"),
		this.value = new ScalarProperty("值", new SingleTextWidget(new AcceptUrlInputFilter), ""),
		this.addProperty("label", this.label, {
			pos: 0
		}),
		this.addProperty("value", this.value, {
			pos: 1
		})
	}
},
{
	defaultSize: ["100%", 89]
}),

/**
 * 复选框控制器
 */
CheckboxControl = FormControlTemplate.extend({
	initialize: function() {
		var a = this;
		FormControlTemplate.prototype.initialize.call(this, "checkboxes", "checkboxes"),
		this._supportsChildRendering = !1,
        //用于其子元素checkbox的name值
        this.nameField = "checkbox_" + this.cid,
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), "选择："),
		this.orientation = new ScalarProperty("方向", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ORIENTATION)), "vertical"),
		this.items = new ArrayProperty("元素集合", new RadioItemsWidget(new AcceptAllInputFilter), [{
			text: "选项",
			value: this.getRandomValue()
		}]),

		this.addProperty("label", this.label, {
			pos: 0
		}),
		this.addProperty("orientation", this.orientation, {
			pos: 1
		}),
		this.addProperty("items", this.items, {
			pos: 2
		}),

		this.items.bind("itemAdded", function(b) {
			var c = new CheckboxInputControl, d = a.getRandomValue();
			c.label.setValue(b.text),
            c.value.setValue(d),
            a.addChild(c),
            b.value = d,
			b._controlId = c.getId()
		}).bind("itemChanged", function(b, c) {
			var d = b._controlId,
			e = a.getChildWithId(d);
			console.log("CONTROL: changed text input with id", b, c);
			if (!e) return;
			e.label.setValue(b.text),
			e.value.setValue(b.value)
		}).bind("itemDeleted", function(b) {
			var c = b._controlId,
			d = a.getChildWithId(c);
			console.log("CONTROL: changed checkbox with id", c);
			if (!d) return;
			a.removeChild(d)
		}).bind("itemMoved", function(b, c) {
			var d = a.getChild(c);
			d && a.moveChild(d, b)
		})
	},
	onAfterBind: function() {
		var a = new CheckboxInputControl;
		this.addChild(a),
		//a.label.setValue("选项"),
		this.items.getWidget()._data.items[0]._controlId = a.getId()
	},
    cloneControl: function (a) {
        console.log("CONTROL: clone control", this);
        var b = ControlFactory.newControl(this.controlType);
        a && b.setId(this.getId());
        var c = b.getProperties();
        for (var d in this._propertiesMap) {
            var e = this._propertiesMap[d].property,
                f = c[d];
            if (!f) {
                console.error("Cloning control no property with name", d);
                continue
            }
            $.isArray(e.getValue()) ? f.property.setValue($.extend(!0, [], e.getValue())) : typeof e.getValue() == "object" ? f.property.setValue($.extend(!0, {},
            e.getValue())) : f.property.setValue(e.getValue())
        }
        for (var g = 0; g < this.children.length; g++) {
            var h = this.children[g],
                i = h.cloneControl(a);
            //i.setId(i.controlType + IdGiver.give(i.getControlType())),
            i.setId(i.controlType + this._getRandomNumber()),
            i.parentControl = b,
            b.children.push(i),
            b.childrenLookup[i.getId()] = i,
            //修改属性items中的_controlId值
            b.items.getWidget()._data.items[g]._controlId = i.getId()
        }
        return b
    },
	positionLayoutElement: function(a, b) {
		var d = $(b).contents();
		d.insertAfter($("legend", a))
	},
	renderTo: function(a) {
		var b = this._getRenderData(),
		c = "#template-control-" + this._template,
		d = Handlebars.compile($(c).html()),
		e = d(b);
		$(a).html(e);
		var f = $("legend", a),
		g = document.createElement("div");
		this._layout.renderTo(g),
		$(g).children().insertAfter(f),
		this.trigger("controlRendered")
	}
},
{
	defaultSize: ["100%", 89]
}),
/**
 * 复选输入框控制器
 */
CheckboxInputControl = Control.extend({
	initialize: function() {
		Control.prototype.initialize.call(this, "checkbox", "checkbox"),
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), "选项"),
        this.value = new ScalarProperty("值", new SingleTextWidget(new AcceptUrlInputFilter), ""),
        this.addProperty("label", this.label, {
            pos: 0
        }),
        this.addProperty("value", this.value, {
            pos: 1
        })
	}
},
{
	defaultSize: ["100%", 89]
}),


SliderControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "slider", "slider");
		var b = "值：",
		c = "0",
		d = "100";
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptAllInputFilter), b),
		this.value = new ScalarProperty("默认值", new SingleTextWidget(new AcceptAllInputFilter), "50"),
		this.min = new ScalarProperty("最小值", new SingleTextWidget(new AcceptAllInputFilter), c),
		this.max = new ScalarProperty("最大值", new SingleTextWidget(new AcceptAllInputFilter), d),
		this.isHighlight = new ScalarProperty("高亮显示", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISHIGHLIGHT)), "false"),
		this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), ""),
		this.trackTheme = new ScalarProperty("滑动条背景", new ThemeSelectorWidget(new AcceptAllInputFilter), ""),
		this.addProperty("label", this.label, {
			pos: 0
		}),		
		this.addProperty("value", this.value, {
			pos: 1
		}),
		this.addProperty("min", this.min, {
			pos: 1
		}),
		this.addProperty("max", this.max, {
			pos: 2
		}),
		this.addProperty("isHighlight", this.isHighlight, {
			pos: 3
		}),
		this.addProperty("theme", this.theme, {
			pos: 4
		}),
		this.addProperty("trackTheme", this.trackTheme, {
			pos: 5
		})
	}
},
{
	defaultSize: ["100%", 40]
}),

/**
 * 下拉选择控制器
 */
SelectControl = FormControlTemplate.extend({
	initialize: function() {
		var a = this;
		FormControlTemplate.prototype.initialize.call(this, "selectmenu", "selectmenu"),
		this._supportsChildRendering = !1;
		var b = "选择：",
		c = "true",
		d = "vertical",
		e = "";
		this.label = new ScalarProperty("标签", new SingleTextWidget(new AcceptUrlInputFilter), b),
		// ISNATIVE 是否原生下拉菜单
		this.isNative = new ScalarProperty("原始菜单", new SelectWidget(new AcceptAllInputFilter, $.extend(!0, [], SETTINGS.ISNATIVE)), c),
		this.theme = new ScalarProperty("主题", new ThemeSelectorWidget(new AcceptAllInputFilter), e),
		this.items = new ArrayProperty("元素集合", new RadioItemsWidget(new AcceptAllInputFilter), [{
            text: "选项",
            value: a.getRandomValue()
        }]),
		
        this.addProperty("label", this.label, {
            pos: 0
        }),
        this.addProperty("isNative", this.isNative, {
            pos: 1
        }),
        this.addProperty("theme", this.theme, {
			pos: 2
		}),
		this.addProperty("items", this.items, {
			pos: 3
		}),

        //新增下拉选项时，给其value属性赋值
		this.items.bind("itemAdded",function(b) {
			b.value = a.getRandomValue()
		})
	}
},
{
	defaultSize: ["100%", 40]
}),


Handlebars.registerHelper("markerparams", function(a, b) {
	var c = [],	d;
	for (d = 0; d < a.length; d++) c.push(a[d].location);
	return c.join("|")
});

/**
 * 地图控件控制器
 */
GoogleMapsControl = Control.extend({
	initialize: function() {
		var a = this;
		Control.prototype.initialize.call(this, "googlemaps", "googlemaps"),
		this.loc = new ScalarProperty("中心位置", new SingleTextWidget(new AcceptAllInputFilter, 1e3), "深圳市"),
		this.zoom = new ScalarProperty("缩放比例", new SingleTextWidget(new AcceptAllInputFilter, 500), "14"),
		this.width = new ScalarProperty("宽度", new SingleTextWidget(new AcceptAllInputFilter, 500), "288"),
		this.height = new ScalarProperty("高度", new SingleTextWidget(new AcceptAllInputFilter, 500), "200"),
		this.markers = new ArrayProperty("标记", new MapMarkerWidget(new AcceptAllInputFilter), [{
			location: "深圳市"
		}]),
		this.addProperty("loc", this.loc, {
			pos: 0
		}),
		this.addProperty("zoom", this.zoom, {
			pos: 2
		}),
		this.addProperty("width", this.width, {
			pos: 3
		}),
		this.addProperty("height", this.height, {
			pos: 4
		}),
		this.addProperty("markers", this.markers, {
			pos: 5
		})
	}
},
{
	defaultSize: ["100%", 200]
}),

/**
 * 数据表格控件
 */
DataTableControl = Control.extend({
    initialize: function() {
        var self = this,
            tables = window.App ? window.App.getDataSourcesForDataTable() : [],
            defaultColumn = window.App ? window.App.getDefaultColumnForDataTable() : {};

        Control.prototype.initialize.call(this, "datatable", "datatable"),

        this.datasource = new ScalarProperty("数据源", new SelectWidget(new AcceptAllInputFilter, tables)),
        this.columns = new ArrayProperty("列集合", new TableColumnsWidget(new AcceptAllInputFilter)),

        this.addProperty("datasource", this.datasource, {pos: 0}),
        this.addProperty("columns", this.columns, {pos: 1}),

        this.datasource.setValue(window.App ? window.App.getDefaultDataSourceForDataTable() : ""),
        this.columns.setValue(self._turnColumnsData(defaultColumn)),
        //重新绑定其propertyChanged事件
        this.datasource.unbind("propertyChanged").bind("propertyChanged", function (a, b, c, e) {           
            //重置表格列
            self.columns.setValue(self._turnColumnsData(window.App.getDefaultColumnForDataTable(c))),
            //最后一个参数标识是否刷新PropertyView，这里传递true过去，以便更新其columns数据值
            self.onPropertyChanged(a, b, c, !0)
        })
    },
    _turnColumnsData: function(a){
        return [{
            text: "列 - " + a.text || "",
            columnValue: a.value || "",
            columnText: a.text || "",
            priority: 1
        }]
    }
},{
    defaultSize: ["100%", 100]
}),

HtmlControl = Control.extend({
    initialize: function(){
        Control.prototype.initialize.call(this, "html", "html"),

        this.setIsContainer(!0),
        
        this.margin._widget = new NullWidget(),

        this.htmlsource = new ScalarProperty("Html源码", new HtmlSourceWidget(), "在这里输入HTML源码"),

        this.addProperty("htmlsource", this.htmlsource, {pos: 0})
    },

},{
    defaultSize: ["100%", 20]
});

