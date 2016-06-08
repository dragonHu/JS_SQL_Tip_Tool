var AJAX = {};
AJAX.ajaxReq = function(rurl, rtype, rdata, cb, rasyn, iscancel) {
	rasyn = rasyn || true;
	rdata = rdata || null;
	rtype = rtype || "get";
	var xhr = createCORSRequest(rtype, rurl);
	//都支持Load
	xhr.onload = function() {
		var allHeaders = xhr.getAllResponseHeaders();
		//console.log("获取服务器请求头信息", allHeaders);
		clearTimeout(timeout); //清除定时器
		//请求完成
		if (xhr.status === 200 || xhr.status === 304) {
			//请求成功
			if (typeof cb == 'function') {
				cb(xhr.responseText);
			}
			xhr = null;
		} else {
			console.log("request url error", xhr.status);
			xhr = null;
		}
	};
	//上传进度
	xhr.onprogress = function(e) {
		var uploadpress = doc.getElementById("uploadpress");
		if (e.lengthComputable) {
			uploadpress.innerHTML = "已接收:" + e.position + " 共" + e.totalSize;
		}
	};
	xhr.onerror = function() {
		console.log("请求错误!", rurl);
	};
	xhr.open(rtype, rurl, rasyn);
	xhr.send(rdata);
	//设置定时器
	var timeout = setTimeout(function() {
		//取消请求
		if (xhr) xhr.abort();
		console.log("requerst timeout");
	}, 5000);
	if (iscancel) {
		//取消请求
		if (xhr) xhr.abort();
	}
};
//跨浏览器的CORS
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		xhr = null;
	}
	return xhr;
}