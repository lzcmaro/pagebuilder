var pageAccessId = "";
Ajax = function(){
    function request(url,opt){
        function fn(){};
        var async   = opt.async !== false,
            method  = opt.method    || 'GET',
            data    = opt.data      || null,
            success = opt.success   || fn,
            failure = opt.failure   || fn;
            method  = method.toUpperCase();
        if(method == 'GET' && data){
            url += (url.indexOf('?') == -1 ? '?' : '&') + data;
            data = null;
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function(){
            _onStateChange(xhr,success,failure);
        };
        xhr.open(method,url,async);
        if(method == 'POST'){
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;');
        }
        xhr.send(data);
        return xhr;
    }
    function _onStateChange(xhr,success,failure){
        if(xhr.readyState == 4){
            var s = xhr.status;
            if(s>= 200 && s < 300){
                success(xhr.responseText);
            }else{
                failure(xhr.responseText);
            }
        }else{}
    }
    return {request:request};  
}();
$(function () {
    $("a[data-role=button], div[data-role=navbar] a").bind("click", function () { // 普通按钮，导航按钮事件绑定
        var fade = $(this).attr("data-transition");
        var a = $(this).attr("href");
        var $tab = $(this).parents("div[data-role=page]");
        var activeClass = "ui-page-active",
            btnActive = "ui-btn-active";
        $tab.removeClass(activeClass);
        $(a).addClass(activeClass);
        if ($(this).hasClass(btnActive)) return;
        $(".ui-btn-active").removeClass(btnActive);
        $(this).addClass(btnActive);
    });

    $("ul[data-role=listview] li.ui-btn").bind("click", function () { // 绑定listview的点击事件
        $(this).parents("div[data-role=page]").removeClass("ui-btn-active");
        $(".ui-btn-active").removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");
    });

    $("ul[data-role=listview] li.ui-btn a,a.ui-link").bind("click", function () { // 列表链接跳转
        var a = $(this).attr("href");
        var $tab = $(this).parents("div[data-role=page]");
        var activeClass = "ui-page-active";
        $tab.removeClass(activeClass);
        $(a).addClass(activeClass);
    });
	
    $("label[for*=radio]").bind("click", function () { // 绑定radio的点击事件
		var on = "ui-icon-radio-on",
            off = "ui-icon-radio-off",
            active = "ui-btn-active",
			type = $(this).parents("fieldset").attr("data-type");
		var $radio = $(this).parent().parent().find("label[for*=radio]");
        var $dom = $radio.children().find(".ui-icon");
        $radio.attr("data-icon", "radio-off");
        $(this).attr("data-icon", "radio-on");
		
		if(type == "horizontal"){ // 水平方向
			$radio.removeClass("ui-radio-on").removeClass(active);
			$(this).toggleClass("ui-radio-on").toggleClass(active);
		}else{ //垂直方向
			$radio.removeClass("ui-radio-on");
			$(this).toggleClass("ui-radio-on");
		}
        $dom.removeClass(on);
        $dom.addClass(off);
        $(this).children().find(".ui-icon").removeClass(off).addClass(on);
    });
	
    $("select").bind("change", function () { // 下拉选择取值
        $(this).siblings().children().find("span").text($(this).find("option:selected").text());
    });

    $(".ui-select a").bind("click", function () { // 下拉弹出层处理
        var b = $(this).attr("id");
        var prefix = b.substring(0, b.length - 6) + "listbox";
        var left = $(this).width() / 2 - $("#" + prefix + "-popup").width() / 2;
        var top = $(this).offset().top;
        $("#" + prefix + "-popup").css({
            left: left,
            top: top
        }).removeClass("ui-popup-hidden").addClass("ui-popup-active");
        $("#" + prefix + "-screen").removeClass("ui-screen-hidden").addClass("in");
        return false;
    });

    $(".ui-popup-screen").bind("click", function () { // 绑定屏幕的点击事件，用于关闭弹出层
        var a = $(this).attr("id");
        var prefix = a.substring(0, a.length - 7); // 截取id前缀
        $(this).removeClass("in").addClass("ui-screen-hidden");
        $("#" + prefix + "-popup").removeAttr("style").removeClass("ui-popup-active").addClass("ui-popup-hidden");
    });

    $(".ui-selectmenu-list li a").bind("click", function () { // 下拉弹出层数据选择处理
        var txt = $(this).text();
        var prefix = $(this).closest("ul").parent().attr("id");
        var id = $(this).closest("ul").attr("id");
        $(".ui-selectmenu-list li", $("#" + prefix + "-popup")).removeClass("ui-btn-active");
        $(this).closest("li").addClass("ui-btn-active");
        $("#" + prefix + "-popup").removeAttr("style").removeClass("ui-popup-active").addClass("ui-popup-hidden");
        $("#" + prefix + "-screen").removeClass("in").addClass("ui-screen-hidden");
        $("a[aria-owns=" + id + "] span span.ui-btn-text").text(txt);
        return false;
    });

    $("label[for*=checkbox]").bind("click", function () { // 绑定checkbox的点击事件
        var on = "ui-icon-checkbox-on",
            off = "ui-icon-checkbox-off",
            active = "ui-btn-active",
			type = $(this).parents("fieldset").attr("data-type");
        var $dom = $(this).children().find(".ui-icon");
        if ($(this).attr("data-icon") == "checkbox-on") {
            $(this).attr("data-icon", "checkbox-off");
        } else {
            $(this).attr("data-icon", "checkbox-on");
        }
		if(type == "horizontal"){ // 水平方向
			$(this).toggleClass("ui-checkbox-on").toggleClass(active);	
		}else{ // 垂直方向
			$(this).toggleClass("ui-checkbox-on")
		}
        if ($dom.hasClass(off)) {
            $dom.removeClass(off).addClass(on);
        } else {
            $dom.removeClass(on).addClass(off);
        }
    });


    $("div[data-role=page]").bind("click",function(e){ // 页脚为固定模式时，绑定页面的点击事件，切换页脚样式
        var $dom = $(this).find("div[data-role=footer]");
        var p = $(this).find("div[data-role=footer]").attr("data-position");
        if (p == 'fixed') { // 固定模式
            $dom.toggleClass("ui-fixed-hidden");
        };
    });
});
$(function () {
	bindSubmitEvents();
});

function bindSubmitEvents() {
    $("form").each(function () {
        $("input[type=submit]", $(this)).unbind("click").one("click", function () {
		   getQueryParameter("isPreview") === "true" || getSubmitData(this);
        }).bind("click", function () {
            return false;
        })
    })
}

function onClicked(dom){
	$(dom).one("click", function () {
		getQueryParameter("isPreview") === "true" || getSubmitData(this);
	})
}

function getSubmitData(dom) {
    var $self = $(dom).parents("div[data-role=page]"),
        $form = $(dom).parents("form"),
        data = [];
    if (_check(dom) == false) {
        alert("请填写调查问卷内容");
		onClicked(dom)
        return;
    }
    $("div[data-role=fieldcontain]", $self).each(function () { //表单元素的父级容器
        var _self = $(this),
            c = $(".ui-controlgroup-label", _self),
            d = $(".ui-input-text", _self),
            s = $(".ui-select", _self),
            item = {
                question: null,
                ask: []
            };
        if (c.length > 0) { //单选和复选
            item.question = _self.find('.ui-controlgroup-label legend').html();
            _self.find('input').each(function () {
                var input = $(this);
                if ($("label[for=" + input.attr("id") + "]").hasClass("ui-radio-on") || $("label[for=" + input.attr("id") + "]").hasClass("ui-checkbox-on")) {
                    item.ask.push({
                        type: input.attr('type'),
                        name: input.attr('name'),
                        isChecked: input.attr('type') == "radio" ? ($("label[for=" + input.attr("id") + "]").hasClass("ui-radio-on") ? '1' : '0') : ($("label[for=" + input.attr("id") + "]").hasClass("ui-checkbox-on") ? '1' : '0'),
                        value: $("label[for=" + input.attr("id") + "] span.ui-btn-text").html()
                    });
                }
            });


        } else if (d.length > 0) { //文本框和文本域
            item.question = _self.find('.ui-input-text').html();
            _self.find('input,textarea').each(function () {
                var input = $(this);
                item.ask.push({
                    type: input.attr('type') ? input.attr('type') : "textarea",
                    name: input.attr('name'),
                    isChecked: "1",
                    value: input.val()
                });
            });

        } else if (s.length > 0) { //下拉选择框
            item.question = _self.find('.ui-select').html();
            var isNative = _self.find('select').attr('data-native-menu');

            if(isNative === 'false'){ // 不是原生下拉框
        	  	 item.ask.push({
                        type: "select",
                        name: _self.find('select').attr('name'),
                        isChecked: "1",
                        value: _self.find('.ui-select span.ui-btn-text').text()
                });	
            }else{
            	 _self.find('select option').each(function () {
	                var input = $(this);
	                if (input.is(":selected")) {
	                    item.ask.push({
	                        type: "select",
	                        name: input.parent().attr('name'),
	                        isChecked: input.is(":selected") ? "1" : "0",
	                        value: input.text()
	                    });
	                }
           		 });
            }
        } else { //其他
            // todo
        }
        data.push(item);
    });
    // 获取?后的参数 location.search;
    var param1 = getPostUrl();
    var url = $form.attr("action");
    var param = param1 + "&json=" + encodeURI(JSON.stringify(data).replace(/&/g, "＆"));
    submitForm(url, param, dom);
    return !1;
}

/*
  防止加密的数据中+等,无法传入后台需要转码
*/
function getPostUrl() {
    var url = "";
    var param = location.search;
    if (param.length >= 1) {
        var sIndex = param.indexOf("?");
        if (sIndex == 0) {
            param = param.substring(1);
        }
        var params = param.split("&");
        var paras = null;
        var colIndex = 0;
        var paramName = "";
        var paramValue = "";
        for (var index = 0; index < params.length; index++) {
            colIndex = params[index].indexOf("=");
            paramName = params[index].substring(0, colIndex + 1);
            paramValue = params[index].substring(colIndex + 1);
            if (url != "") {
                url += "&";
            }
            url += paramName + encodeURIComponent(paramValue);
        }
    }
    var fileName = getFileName(location.pathname);
    if (url != "") {
        url += "&";
    }
    url += "fileName=" + fileName;
    return url;
}


function _check(dom) { // 验证用户是否有勾选或者输入数据
    var $form = $(dom).parents("form"),
        flag = false;
    $("input[type=radio]", $form).each(function () {
        if ($(this).is(":checked")) {
            flag = true;
        }
    });
    $("select option", $form).each(function () {
        if ($(this).is(":selected")) {
            flag = true;
        }
    });
    $("textarea", $form).each(function () {
        if ($.trim($(this).val()) != "") {
            flag = true;
        }
    });
    $("input[type=text]", $form).each(function () {
        if ($.trim($(this).val()) != "") {
            flag = true;
        }
    });
    $("input[type=password]", $form).each(function () {
        if ($.trim($(this).val()) != "") {
            flag = true;
        }
    });
    if (flag) {
        return true;
    } else {
        return false;
    }
}

function submitForm(url, param, dom) { // 提交处理
    Ajax.request(url, {
        method: "POST",
        data: param + "&pageAccessId=" + pageAccessId,
        success: function (data) {
            var json = JSON.parse(data);
            var errorCode = json.errorCode;
            var errorMsg = json.errorMsg;
            var contextPath = json.contextPath;
            showErrorPage(errorCode, errorMsg, contextPath);
        },
        failure: function (data) { onClicked(dom) }
    });
}
// 显示错误页面
function showErrorPage(errorCode, errorMsg, contextPath) {
    //alert("errorCode="+errorCode+" errorMsg="+errorMsg+" contextPath="+contextPath);
    if (errorCode == 0) {
        document.location = contextPath + "/html/surveyresult.html";
    } else if (errorCode == 1002) {
        document.location = contextPath + "/html/invalidpage.html";
    } else if (errorCode == 1003) {
        document.location = contextPath + "/html/doublesubmit.html";
    } else if (errorCode == -1) {
        // 未知异常
        //alert("errorCode="+errorCode+" errorMsg="+errorMsg+" contextPath="+contextPath);
        alert("未知异常，请联系管理员!");
    }
}
// 获得项目的名称 
function getProjectName(url) {
    return "/" + url.split("/")[3];
}

function getFileName(url) {
    var lastPipe = url.lastIndexOf('/');
    var lastPeriod = url.lastIndexOf('.');
    var fileName = "";
    if (lastPipe < lastPeriod) {
        fileName = url.substring(lastPipe + 1, lastPeriod);
    } else {
        fileName = '';
    }
    return fileName;
}

// 页面加载完成后调用该方法记录访问时间
$(window).load(function () {
	if(getQueryParameter("isPreview") !== "true"){
		getPageAccess();
	}
});

function getPageAccess(){ // 获取用户访问时间
	
	var projectName = getProjectName(location.href);
    // 检测页面是否加载完成
    var url = projectName+"/pageAccessAction.action", param = getPostUrl();

    Ajax.request(url,{
		method:"POST",
	    data : param,
	    success : function(data){
	    	var json = JSON.parse(data);
			var result =json.result;
			var contextPath =json.contextPath;
			if(result==true){
				pageAccessId = json.pageAccessId;
			}
	    },
	    failure : function(data){}
	  }
	);

}

function getQueryParameter(a) { //获取参数
    var c = location.href,
        b = "";
    c = c.replace("?", "?&").split("&");
    for (var i = 1; i < c.length; i++) {
        if (c[i].indexOf(a + "=") == 0) {
            b = c[i].replace(a + "=", "")
        }
    }
    return b
}

// 处理订阅的请求
function subscribe() {}