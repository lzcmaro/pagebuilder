
Device = Backbone.View.extend({
    _builder: null,
    _currentPage: "",
    _currentPageObj: null,
    _highlighter: null,
    _highlightedEl: null,
    _highlightSelector: null,
    _dirtyPages: {},
    initialize: function (a) {
        console.log("DEVICE: initializing");
        var a = this;
        setTimeout(function b() {
            var c = parent.BuilderDeviceGlue.getBuilderFromDevice();
            if (c) {
                /*if (c.isDeviceAlreadyInited()) {
					c.reload();
					return
				}*/
                a._builder = c,
                a.initEvents(),
                c.onDeviceReady()
            } else setTimeout(b, 50)
        },
        50)
    },
    initEvents: function () {
        var a = this;

        $("body")
			//鼠标移动事件
			.delegate(".cfwx-control, .highlight, .highlight-selector", "mousemove", function (b) {
				//如果触发该事件的el不是highlight，即return false，以阻止事件传播（control会绑定sortable）
				return $(this).hasClass('highlight-selector') && a.repositionCurrentSelector(), a.moveHover(b), !$(this).hasClass('highlight')
			})
			//点击事件
			.delegate(".cfwx-control, .highlight, .highlight-selector", "click", function (b) {
				if ($(this).hasClass('cfwx-control')) {
					//点击具体控件
					return a._controlClicked($(this).data("cid")), !1
				} else {
					if (!a._currentPageObj) return !1;
					var c = $(".cfwx-control", a._currentPageObj);
					//遍历当前page下所有的控件
					for (var d = c.length - 1; d >= 0; d--) {
						var e = c.eq(d);
						//检索获取当前鼠标点击位置下的有效控件
						if (a._controlElementContains(e, b.pageX, b.pageY) && a._isValidHoverTarget(e)) return a._controlClicked($(e).data("cid")), !1
					}
					return !1
				}

			})
			//鼠标按下事件（控件支持拖拽排序的）
			.delegate(".highlight, .highlight-selector", "mousedown", function (b) {
				if (!a._currentPageObj) return;
				var c = $(".cfwx-control", a._currentPageObj);
				//遍历当前page下所有的控件
				for (var d = c.length - 1; d >= 0; d--) {
					var e = c.eq(d);
					//e.trigger(b)在1.7以上版本中，如果不手动指定其event.target会出现死循环
					//检索获取当前鼠标按下位置下的有效控件
					a._controlElementContains(e, b.pageX, b.pageY) && a._isValidHoverTarget(e) && ((b.target = e.get(0)), e.trigger(b))
				}
			})
			//鼠标穿过控件时的事件
			.delegate(".cfwx-control", "mouseenter", function () {
				return a._isValidHoverTarget($(this)) && a.startHover($(this)), !1
			})
			//鼠标穿出highlight层时的事件
			.delegate(".highlight", "mouseleave", function () {
				return a._isValidHoverTarget($(this)) && a.startHover($(this)), !1
			});

        //2013.07.15增加，避免页面跳转到外部链接
        $("a:not([href^=#])").live("click", function(){ return !1 })
		
		//window滚动件事，复位当前控件的选取框
		$(window).scroll(function() {
			$(document).scrollTop() == 0 && a.stopScrolling(),
			$(document).scrollTop() + $(window).height() >= $(document).height() && a.stopScrolling(),
			a.repositionCurrentSelector()
		})

    },
    removeEvents: function () {
        this.unbind(),
        $("body").undelegate();
    },
    removeSorting: function () {
        $(".ui-sortable").each(function () {
            $(this).sortable("disable")
        })
    },
    enableSorting: function () {
        $('[data-role="content"]').each(function () {
            $(this).sortable("enable")
        })
    },
	/**
	 * 控件点击事件
	 * a, 控件ID
	 */
    _controlClicked: function (a) {
        if (!a) return;
		console.log("DEVICE: clicked on element ", a),
        this._highlighterHidden = !1,       
        this.trigger("controlSelected", a)
    },
    startDragDrop: function (a) {
        this._dragDropping = !0
    },
    stopDragDrop: function () {
        this._dragDropping = !1
    },
    //清除所有控件的选取状态
    onAllControlsDeselected: function () {
        this._highlightSelector && ($(this._highlightSelector).remove(), this._highlightSelector = null),
        this.endHover()
    },
    //选中control,由builder.onControlSelected()触发
    onControlSelected: function (a) {
        var b = $(a.getDeviceRenderedEl());
        this.selectAndHighlightElement(b)
    },
    onPageChanged: function () {
        var a = $.mobile.activePage,
            b = $(a).data("cid");
        //console.log("Switched to page", b),
        this._builder && this._builder.isPreviewMode() && this.markPageDirty(b),
        this.trigger("pageChanged", b)
    },
    markPageDirty: function (a) {
        if (!a) return;
        this._dirtyPages[a] = !0
    },
    //检查鼠标是否已划出当前control边界
    _controlElementContains: function (a, b, c) {
        var d = this._builder.getControl($(a).data("cid"));
        if (!d) return !1;
        var e = a.offset(),
            f = a.outerWidth(),
            g = a.outerHeight(),
            h = d.getCalculatedMargin();
        if (h[3] < 0 && h[1] < 0) {
            if (b > e.left + f + -h[1] || b < e.left + h[3] || c > e.top + g || c < e.top) return !1
        } else if (b > e.left + f || b < e.left || c > e.top + g || c < e.top) return !1;
        return !0
    },
    //选取并高亮当前element
    selectAndHighlightElement: function (a) {
        this._repositionSelector(a)
    },
    //重绘当前control的highlightSelector
    repositionCurrentSelector: function () {
        if (!this._builder) return;
        if (this._builder.isPreviewMode()) return;
        if (this._builder.getSelectedControl()) {
            var a = this._builder.getSelectedControl().getDeviceRenderedEl();
            if (!a) {
                this._builder.setSelectedControl(null);
                return
            }
            this._repositionSelector(a)
        }
        this._highlightedEl && this._repositionHover(this._highlightedEl)
    },
    /**
     * 创建highlightSelector
     * a, 标识当前控件是否可选取
     */
    _makeHighlightSelector: function (a) {
        if (a) {
            var b = this,
                c = $('<div class="highlight-selector"><div class="content"><div class="buttons"><a href="javascript:void(0);" title="复制" class="c-icon c-icon-plus"></a> <a href="javascript:void(0);" title="删除" class="c-icon c-icon-close"></a></div></div></div>');
            return $(".c-icon-plus", c).click(function () {
					var a = b._builder.getSelectedControl();
					if (a) {
						var c = b._builder.duplicateControl(a);
						b._builder.onControlSelected(c)
					}
					return !1
				}),
				$(".c-icon-close", c).click(function () {
					var a = b._builder.getSelectedControl();
					return a && b._builder.removeControl(a), !1
				}),
				c
        }
        return $('<div class="highlight-selector noborder"><div class="content"></div></div>')
    },
    //重绘highlightSelector
    _repositionSelector: function (a) {
        //console.log("DEVICE: reposition selector ", a);
        if (!this._builder) return;
        var b = this._builder.getControl($(a).data("cid"));
        if (!b) {
            this._builder.setSelectedControl(null);
            return
        }
        var c = a.offset();
        this._highlightSelector || (this._highlightSelector = this._makeHighlightSelector(b.getControlType() != "page"), $(this._highlightSelector).appendTo("body"), a.attr("data-position") == "fixed" && (this._highlightSelector.find(".buttons").css("bottom", "4px"), this._highlightSelector.find(".c-icon-plus").remove()));
        var d = b.getCalculatedMargin(),
            e = $(window).height();
        if (d[3] < 0 && d[1] < 0) {
            var f = d[3] + d[1];
            $(this._highlightSelector).css({
                left: c.left + d[1],
                top: c.top,
                width: a.outerWidth() - f,
                height: a.outerHeight()
            })
        } else $(this._highlightSelector).css({
            left: c.left,
            top: c.top,
            width: a.width(),
            height: a.outerHeight()
        })
    },
    //鼠标划过control时触发的hover事件
    startHover: function (a) {
        if (this._isSorting === !0) return;
        this._highlighter || (this._highlighter = $('<div id="highlight" class="highlight"></div>').appendTo("body")),
        this._highlighter.hide(),
        //this._highlighter = null,
        this._repositionHover(a),
        this._highlightedEl = a
    },
    //去除鼠标划过control时添加的highlight层
    endHover: function () {
        //$(".highlight").remove();
        if (!this._highlighter) return;
        this._highlighter.hide(),
        //this._highlighter = null,
        this._highlighterHidden = !1
    },
    startSorting: function () {
        this._isSorting = !0
    },
    endSorting: function () {
        this._isSorting = !1,
        this.repositionCurrentSelector(),
        this.endHover()
    },
    //鼠标划过control时重绘.highlight覆盖层
    _repositionHover: function (a) {
        //console.log("DEVICE: reposition hover ", a);
        var b = this._builder.getControl($(a).data("cid"));
        if (!b) {
            this._highlighter.hide();          
            return
        }
        
        c = a.offset();
        b.getControlType() == "page" || b.getControlType() == "tabbar" ? this._highlighter.addClass("noborder") : this._highlighter.removeClass("noborder");
        //获取当前control计算后的margin值[top,right,bottom,left]
        var d = b.getCalculatedMargin();
        if (d[3] < 0 && d[1] < 0) {
            var e = d[3] + d[1];
            this._highlighter.css({
                left: c.left + d[1],
                top: c.top,
                width: a.outerWidth() - e,
                height: a.outerHeight()
            })
        } else {
            this._highlighter.css({
                left: c.left,
                top: c.top,
                width: a.width(),
                height: a.outerHeight()
            })
        }
        this._highlighter.show()
    },
    //鼠标在control的mousemove事件
    moveHover: function (a) {
        if (!this._currentPageObj) return !1;
        if (this._isSorting === !0 && this._highlightedEl) {
            this._repositionHover(this._highlightedEl);
            var b = this._builder.getSelectedControl();
            if (b) {
                var c = b.getDeviceRenderedEl();
                this._highlightedEl.get(0) === c.get(0) && this._repositionSelector(this._highlightedEl)
            }
            return !1
        }
        var d = $("[data-cid]", this._currentPageObj);
        for (var e = d.length - 1; e >= 0; e--) {
            var f = d.eq(e);
            if (this._controlElementContains(f, a.pageX, a.pageY) && this._isValidHoverTarget(f)) {
                if (this._highlightedEl && f.get(0) == this._highlightedEl.get(0)) return;
                this.endHover(),
                this.startHover(f);
                return
            }
        }
    },
    //判断鼠标划过的目标控件是否为可选的有效控件（PageControl等是不可选的）
    _isValidHoverTarget: function (a) {
        var b = this._builder.getControl($(a).data("cid"));
        return b && !this._builder.isSelectableControl(b) ? !1 : !0
    },
    _setCurrentPage: function (a) {
        var b = this,
            c = $('body > div[data-cid="' + a + '"]');
        if (c.length < 1) {
            console.error("Unable to set current page with id", a, "it doesn't exist");
            return
        }
        this._currentPage = a,
        this._currentPageObj = c
    },
    getCurrentPage: function () {
        return !this._currentPageObj || this._currentPageObj.length < 1 ? (this._currentPageObj = $('body > div[data-cid="' + this._currentPage + '"]'), this._currentPageObj) : this._currentPageObj
    },
    //
    setCurrentPage: function (a) {
        var b = this,
            c = $('body > div[data-cid="' + a + '"]');
        if (c.length < 1) {
            console.error("Unable to set current page with id", a, "it doesn't exist");
            return
        }
        this._currentPage = a,
        this._currentPageObj = c,
        c.unbind("pageinit pagebeforecreate pagecreate pagebeforechange pagechange").bind("pageinit", function () {
            console.log("DEVICE: PAGE INIT", a),
            //b._currentPageObj = $(this),
            $(this).jqmData("alreadyCreated", !0)
        }).bind("pagebeforecreate", function () {
            console.log("DEVICE: PAGE BEFORE CREATE", a)
        }).bind("pagecreate", function () {
            console.log("DEVICE: PAGE CREATE", a)           
        }).bind("pagebeforechange", function () {
            console.log("DEVICE: PAGE BEFORE CHANGE", a)
        }).bind("pagechange", function () {
            console.log("DEVICE: PAGE CHANGE", a)
        }),
        c.jqmData("alreadyCreated") && c.trigger("pagecreate"),
        c.die("pageshow").live("pageshow", function (c, d) {
            console.log("DEVICE: PAGE SHOW", a),
            b.onPageChanged()
        })
    },
    showPage: function (a) {
        var b = $('body > div[data-cid="' + a + '"]');
        if (b.length < 1) {
            console.error("Unable to show page with control id", a, "it doesn't exist");
            return
        }
        console.log("DEVICE: showing page ", a),
        this.onAllControlsDeselected(),
        this.setCurrentPage(a),
        $.mobile.changePage($(this._currentPageObj))
    },
    refreshPage: function () {
        console.log("DEVICE: refreshing device"),
        //删除切换列式table控件的列选取层
        $("table[data-role=table]").each(function(i, n){
            var a = this.id;
            $("#" + a + "-popup-screen, #" + a + "-popup-popup").remove()
        }),
        $.mobile.activePage ? $.mobile.activePage.trigger("pagecreate") : setTimeout(function () {
            $.mobile.activePage.trigger("pagecreate")
        },
        11)
    },
    redrawActivePage: function () {
        if (!$.mobile.activePage || !this._builder || this._builder.isLoading()) return;
        var a = $.mobile.activePage.data("cid"),
            b = this._builder.getControl(a);
        if (!a || !b) return;
        this._builder.isPreviewMode() || (this._dirtyPages[a] === !0 ? (console.log("REDRAWING PAGE", a, "BECAUSE DIRTY"), this.updateControl(b), delete this._dirtyPages[a]) : console.log("NOT REDRAWING PAGE", a, "BECAUSE NOT DIRTY"))
    },
    redrawAll: function () {
        var a = this._builder.getDocument().root;
        a.render(window.document),
        $("body").append(a.getDeviceRenderedEl().children()),
        this.refreshPage()
    },
    recreatePages: function () {
        $('[data-role="page"]').each(function () {
            try {
                $(this).trigger("pagecreate")
            } catch (a) {}
        })
    },
    //初始化应用所有的page
    initAppPages: function (a) {
        if (a.getControlType() != "app") return;
        console.log("DEVICE: init app")
        a.render(window.document),
        $("body").append(a.getDeviceRenderedEl().children())
    },
    initControl: function (a) {
        var b, c, d, e, f, g, h = this;
        if (this._builder.isLoading()) return;
        a.getControlType() == "app" ? (a.render(window.document), $("body").append(a.getDeviceRenderedEl().children(":first"))) : (b = $("body > div[data-cid]"), d = this._builder.getDocument().root, d.render(window.document), $("body").append(d.getDeviceRenderedEl().children()), a.getControlType() == "page" ? (h.setCurrentPage(a.getId()), console.log("WOULD REFRESH PAGE!"), h.refreshPage()) : this.refreshPage());
    },
    addControl: function (a) {
        console.log("DEVICE: adding control", a.getId()),
        this.stopScrolling(),
        this.initControl(a),
        $(".shim").remove()
    },
    addControlToContainer: function (a, b, c) {
        console.log("DEVICE: adding control to container", a.getId(), b.getId()),
        this.stopScrolling(),
        b.addChildAtPoint(a, c),
        this.initControl(a)
    },
    removeControl: function (a) {
        var b = $('[data-cid="' + a.getId() + '"]');
        if (b.length < 1) return null;
        if (a.getControlType() == "page") {
            //console.log("Device: removing page", a.getId());
            var c = $('body > div[data-cid][data-cid!="' + a.getId() + '"]:first');
            this.setCurrentPage(c.data("cid")),
            setTimeout(function () {
                b.remove()
            },
            500)
        } else if(a.getControlType() == "submitbutton"){
			b = b.closest("div.ui-submit"); // 删除jquerymobile添加的div
			b.remove();
		} else if(a.getControlType() === "pagefooter"){
            this._currentPageObj.removeClass("ui-page-footer-fixed"), //移除页面可能存在的ui-page-footer-fixed样式
            b.remove()
        } else b.remove();
        return console.log("DEVICE: removed control: " + a.getId()),
        this.repositionCurrentSelector(),
        b
    },
    updateControl: function (a) {
        //var b = this;
        //console.log("DEVICE: updating control ", a.getDeviceExistingControl($));
        a.render(window.document);
        var c = a.getDeviceExistingControl(jQuery);
        if (a.getControlType() == "page") {
            //var c = $('[data-cid="' + a.getId() + '"]');
            this._changePageTheme(c, $(c).attr("data-theme"), a.theme.getValue())
            //this._changePageBg(c, a)
        } else {
            //var c = a.getDeviceExistingControl($),
            var d = c.attr("class");
            a.getControlType() === "gridblock" && a.getDeviceRenderedEl().attr("class", d),
            c.replaceWith(a.getDeviceRenderedEl())           
        }
        this.refreshPage(),
        this.repositionCurrentSelector(),
        this.endHover()
    },
    //控件在device渲染完成后触发
    onControlRendered: function (a) {
        console.log("DEVICE: control rendered ", a.getId()),
        this._initSortableControl(a);
        for (var b = 0; b < a.children.length; b++) this._initSortableControl(a.children[b])
    },
    _initSortableControl: function (a) {
        console.log("DEVICE: init sortable control", a.getDeviceRenderedEl());
        var b = this;
        a.supportsSorting() && $(a.getDeviceRenderedEl()).sortable({
            tolerance: "pointer", //设置当拖动元素越过其它元素多少时便对元素进行重新排序。可选值：'intersect', 'pointer' 
            items: a.getSortableItemsSelector(), //selector 指定在排序对象中，哪些元素是可以进行拖拽排序的。
            zIndex: 18, //设置在排序动作发生时，元素的z-index值。
            cursor: "move", //光标类型
            start: function (ev, ui) {
                console.log("DEVICE: drag control start", ui.item);
                var d = ui.item; //获得当前拖拽元素
                d.data("oldIndex", d.index()), //保存当前拖拽元素的索引
                b.startSorting()
            },
            change: function (ev, ui) {
                b.repositionCurrentSelector()
            },
            stop: function (ev, ui) {
                console.log("DEVICE: drag control stop", ui.item);
                var d = ui.item;
                b.trigger("controlMoved", d.data("cid"), a, d.data("oldIndex"), d.index()),
                b.endSorting()
            }
        })
    },
    _changePageTheme: function (a, b, c) {
        $(a).attr("data-theme", c),
        b || (b = "c");
        if ($(a).attr("class")) {
            var d = new RegExp("-" + b + "$");
            c = "-" + c;
            var e = $(a).attr("class").split(" "),
                f = !1;
            for (var g in e) d.test(e[g]) && (f = !0, e[g] = e[g].replace(d, c));
            $(a).attr("class", e.join(" "))
        }
    },
    _changePageBg: function (a, b) {
        $(a).css("backgroundImage", "url('" + b.bgImage.getValue() + "')"),
        $(a).css("backgroundRepeat", b.bgImageRepeat.getValue())
    },
    stopScrolling: function () {
        clearInterval(this._scrollTimeout)
    },
    scrollDown: function () {
        var a = $(document);
        clearInterval(this._scrollTimeout),
        this._scrollTimeout = setInterval(function () {
            var b = a.scrollTop();
            a.scrollTop(b + 20)
        },
        30)
    },
    scrollUp: function () {
        var a = $(document);
        clearInterval(this._scrollTimeout),
        this._scrollTimeout = setInterval(function () {
            var b = a.scrollTop();
            a.scrollTop(b - 20)
        },
        30)
    },
    //把滚动条设置到当前控件位置
    scrollToControl: function (a) {
        var b = a.getDeviceRenderedEl(),
            c = b.offset();
        window.scrollTo(0, c.top - $(window).height() / 2)
    },
    designModeHint: function () {
        $("body").removeClass("preview").addClass("design"),
		this.initEvents(),
		this.enableSorting()
    },
    previewModeHint: function () {
        $("body").removeClass("design").addClass("preview"),
        this.onAllControlsDeselected(),
		this.endHover(),
		this.removeEvents(),
		this.removeSorting(),
        this.recreatePages(),
        $.mobile.activePage && this.markPageDirty($.mobile.activePage.data("cid"))
    }

});

