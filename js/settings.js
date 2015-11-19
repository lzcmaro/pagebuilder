SETTINGS = {

    //设计器方向
    DeviceOrientation: {
        LANDSCAPE: 0,
        PORTRAIT: 1
    },
    //设计器大小
    DeviceSizes: {
        _240x320: [240, 320],
        _320x480: [320, 480],
        _480x800: [480, 800],
        _600x1024: [600, 1024],
        _640x960: [640, 960],
        _640x1136: [640, 1136],
        _720x1280: [720, 1280],
        _768x1024: [768, 1024],
        _800x1280: [800, 1280]
    },
    //应用模式
    InterfaceModes: {
        DESIGN: 1,
        PREVIEW: 2,
        CODE: 3
    },
    //动作类型
    ActionTypes: {
        ADD: 1,
        REMOVE: 2,
        MOVE_FORWARD: 3,
        MOVE_BACK: 4,
        PROPERTY_FORWARD: 5,
        PROPERTY_BACK: 6
    },
    //控件append模式
    ControlAppendMode: {
        CONTENT_APPEND: 0,
        CONTENT_PREPEND: 1,
        PAGE_APPEND: 2,
        PAGE_PREPEND: 3,
        HEADER_PREPEND: 4,
        HEADER_APPEND: 5,
        FOOTER_PREPEND: 6,
        FOOTER_APPEND: 7
    },
    //图标类型
    ICONS: [{
        value: "",
        key: ""
    }, {
        value: "arrow-l",
        key: "左箭头"
    }, {
        value: "arrow-r",
        key: "右箭头"
    }, {
        value: "arrow-u",
        key: "上箭头"
    }, {
        value: "arrow-d",
        key: "下箭头"
    }, {
        value: "delete",
        key: "删除"
    }, {
        value: "plus",
        key: "加号"
    }, {
        value: "minus",
        key: "减号"
    }, {
        value: "check",
        key: "确认"
    }, {
        value: "gear",
        key: "齿轮"
    }, {
        value: "refresh",
        key: "刷新"
    }, {
        value: "forward",
        key: "前进"
    }, {
        value: "back",
        key: "返回"
    }, {
        value: "grid",
        key: "栅格"
    }, {
        value: "star",
        key: "星号"
    }, {
        value: "alert",
        key: "警告"
    }, {
        value: "info",
        key: "信息"
    }, {
        value: "home",
        key: "首页"
    }, {
        value: "search",
        key: "搜索"
    }],

    //动画效果
    TRANSITIONS: [{
        value: "none",
        key: "无"
    }, {
        value: "fade",
        key: "渐变"
    }, {
        value: "pop",
        key: "弹出"
    }, {
        value: "flip",
        key: "翻转"
    }, {
        value: "turn",
        key: "转动"
    }, {
        value: "flow",
        key: "流动"
    }, {
        value: "slidefade",
        key: "滑动渐变"
    }, {
        value: "slide",
        key: "滑动"
    }, {
        value: "slideup",
        key: "向上滑动"
    }, {
        value: "slidedown",
        key: "向下滑动"
    }],

    // 主题
    THEMES: [{
        value: "",
        key: "默认"
    }, {
        value: "a",
        key: "黑色"
    }, {
        value: "b",
        key: "蓝色"
    }, {
        value: "c",
        key: "灰色"
    }, {
        value: "e",
        key: "黄色"
    }],

    //是否固定模式isFixed
    ISFIXED: [{
        value: "",
        text: "否"
    }, {
        value: "fixed",
        text: "是"
    }],

    //Heading 尺寸(size)
    SIZE: [{
        value: 1,
        text: "1"
    }, {
        value: 2,
        text: "2",
        selected: !0
    }, {
        value: 3,
        text: "3"
    }, {
        value: 4,
        text: "4"
    }, {
        value: 5,
        text: "5"
    }],

    // isReadOnly是否只读
    ISREADONLY: [{
        value: "true",
        text: "是"
    }, {
        value: "false",
        text: "否"
    }],
    // 是否收缩
    _ISCOLLAPSED: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],
    // 是否插入方式显示
    DISPLAYINSET: [{
        value: "true",
        text: "是"
    }, {
        value: "false",
        text: "否"
    }],

    // 表格列数
    COLUMNS: [{
        value: "2",
        text: "2",
        selected: !0
    }, {
        value: "3",
        text: "3"
    }, {
        value: "4",
        text: "4"
    }, {
        value: "5",
        text: "5"
    }],

    // 表格行数
    ROWS: [{
        value: "1",
        text: "1",
        selected: !0
    }, {
        value: "2",
        text: "2"
    }, {
        value: "3",
        text: "3"
    }, {
        value: "4",
        text: "4"
    }, {
        value: "5",
        text: "5"
    }, {
        value: "6",
        text: "6"
    }],

    //是否新窗口打开
    OPENNEWWINDOW: [{
        value: "true",
        text: "是"
    }, {
        value: "false",
        text: "否"
    }],

    //行内显示
    ISINLINE: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],

    // 反向过渡
    ISREVERSETRANSITION: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],

    // 返回按钮		
    ISBACKBUTTON: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],

    // 对齐方式
    ALIGN: [{
        value: "left",
        text: "左"
    }, {
        value: "center",
        text: "中"
    }, {
        value: "right",
        text: "右"
    }],

    //显示模式
    DISPLAYMODE: [{
        value: "block",
        text: "块"
    }, {
        value: "inline",
        text: "行"
    }],

    // 是否小巧模式
    ISMINI: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],


    // 显示方向
    ORIENTATION: [{
        value: "vertical",
        text: "垂直",
        selected: !0
    }, {
        value: "horizontal",
        text: "水平"
    }],
    // 是否原生下拉菜单
    ISNATIVE: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],
    // 提交方式
    ACTION: [{
        value: "GET",
        text: "GET"
    }, {
        value: "POST",
        text: "POST"
    }],
    // 是否Ajax 提交
    AJAX: [{
        value: "false",
        text: "否"
    }, {
        value: "true",
        text: "是"
    }],
	
	ISHIGHLIGHT: [{
			value: "false",
			text: "否"
		},
		{
			value: "true",
			text: "是"
		}],
    // 输入框类型
    INPUTTYPE: [{
        value: "text",
        text: "文本",
        selected: !0
    }],

    //是否激活
    ISACTIVE: [{
        value: !1,
        text: "否"
    }, {
        value: !0,
        text: "是"
    }],

    // 属性标题
    CONTROLNAMES: {
        page: "页面",
        pageheader: "页头",
        heading: "标题",
        pagecontent: "",
        navbar: "导航栏",
        pagefooter: "页脚",
        listview: "列表",
        collapsible: "可折叠文本",
        collapsiblecontent: "",
        grid: "网格",
        gridblock: "单元格",
        text: "文本块",
        link: "链接",
        button: "普通按钮",
        image: "图片",
        submitbutton: "提交按钮",
        form: "表单",
        textinput: "单行文本框",
        textarea: "多行文本框",
        radio: "单选按钮",
        radiobuttons: "单选按钮",
        checkboxes: "复选按钮",
        checkbox: "复选按钮",
        selectmenu: "下拉选择框",
        slider: "滑动条",
        video: "视频",
        audio: "语音",
		googlemaps: "地图",
        datatable: "数据表格",
        html: "HTML源码"
    },
	
	// 控件选项卡导航
	
	WIDGETTABS: {
		toolsBar: "工具栏",
		button: "按钮",
		content: "内容",
		form: "表单"
	},

    //字体
    FONTFAMILY: [{
        value: "宋体",
        text: "宋体"
    }, {
        value: "微软雅黑",
        text: "微软雅黑"
    }, {
        value: "黑体",
        text: "黑体"
    }, {
        value: "楷体",
        text: "楷体"
    }, {
        value: "幼园",
        text: "幼园"
    }, {
        value: "隶书",
        text: "隶书"
    }, {
        value: "Arial", 
        text: "Arial"
    }, {
        value: "Arial Black",
        text: "Arial Black"
    }, {
        value: "Book Antiqua",
        text: "Book Antiqua"
    }, {
        value: "Courier New",
        text: "Courier New"
    }, {
        value: "Tahoma",
        text: "Tahoma"
    }, {
        value: "Verdana",
        text: "Verdana"
    }],

    //字体大小
    FONTSIZE: [{
        value: "xx-small",
        text: "1(8pt)"
    }, {
        value: "x-small",
        text: "2(10pt)"
    }, {
        value: "small",
        text: "3(12pt)"
    }, {
        value: "medium",
        text: "4(14pt)"
    }, {
        value: "large",
        text: "5(18pt)"
    }, {
        value: "x-large",
        text: "6(24pt)"
    }, {
        value: "xx-large",
        text: "7(36pt)"
    }],

    //字体颜色
    FONTCOLOR: ["#000000", "#993300", "#333300", "#003300", "#003366", "#000080", "#333399", "#333333", 
        "#800000", "#FF6600", "#808000", "#008000", "#008080", "#0000FF", "#666699", "#808080", 
        "#FF0000", "#FF9900", "#99CC00", "#339966", "#33CCCC", "#3366FF", "#800080", "#999999",
        "#FF00FF", "#FFCC00", "#FFFF00", "#00FF00", "#00FFFF", "#00CCFF", "#993366", "#C0C0C0",
        "#FF99CC", "#FFCC99", "#FFFF99", "#CCFFCC", "#CCFFFF", "#99CCFF", "#CC99FF", "#FFFFFF"]

};
