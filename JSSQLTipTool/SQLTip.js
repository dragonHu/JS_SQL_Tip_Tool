var SQLTip = {
	sqlstr: '',
	nlocal: '',
	sqltextarea: null,
	//初始化函数接受一个dom元素 绑定事件
	init: function(sqltextarea) {
		var _this = this;
		
		//如果元素存在
		var st = $(sqltextarea),
			tagname = st[0].nodeName.toLocaleLowerCase();
		_this.sqltextarea = st;	
		if (!st) {
			throw Error("dom is not exits!");
		}
		if (tagname != "textarea" && tagname != "input") {
			throw Error("please set dom textarea or input");
		}
		_this.eventBind(st);
	},
	/*内存回收机制*/
	discope:function(){
	   var _this=this;
       _this.sqltextarea.keyup=null;
       _this.sqltextarea=null;
       _this=null;
       $(document).keyup=null;
	},
	returnSqlVal: function() {
		var sqlval=this.sqltextarea.val().trim();
		return sqlval;
	},
	eventBind: function(targetDom) {
		var _this = this,
			doc = document,
			cw = targetDom.width(),
			ch = targetDom.height();
		var listtmp = "<div id='divlist' class='SQL_divlist' ><ul></ul></div>";
		targetDom.parent().append(listtmp);
		//获取插入的容器
		var divlist = $("#divlist"),
			divlistul = divlist.find('ul');
		//
		$(doc).keyup(function(event) {
			var kcode = event.keyCode,
			    isshow=divlist[0].style.display.trim(); 
			//判断sqllist是否显示
			if(!isshow||isshow!='block'){
               return;
			}  
			switch (kcode) {
				case 38: //上
					scrollkey('up');
					break;
				case 40: //下
					scrollkey('down');
					break;
				case 37:
					targetDom.focus(); //左
					break;
				case 39:
					targetDom.focus(); //右
					break;		
				case 13:
					replaceCMD();
					var sqlstr = divlistul.find('._indexclass').text();
					divlist.hide();
					divlistul.html(''); //先置空
					targetDom.val(_this.sqlstr + sqlstr);
					targetDom.focus(); //再次获取焦点
					_this.sqlstr = targetDom.val();
					break;
				default:
				targetDom.focus();
				break;	
			}
		});
		//键盘事件keyup
		targetDom.keyup(function(event) {
			event.stopPropagation(); //阻止冒泡
			//获取当前光标所处的位置
			var tar = event.target,
				kcode = event.keyCode,
				arr = [],
				cols = tar.cols,
				rows = tar.rows,
				len=tar.textLength,
				listwidth = (len % cols) * (cw / cols),
				listheight = Math.floor(len / cols) * (ch / rows);
			if (kcode === 16) { //shift键 直接返回
				return;
			}
			divlist.hide();
			divlistul.html(''); //先置空
			//查询最后输入的字符 是否为命令
			var entertext = targetDom.val().toLocaleLowerCase(),
				cmdtext = entertext.substr(len - 1, len);
			if (cmdtext == "@") {
				innerhandlerselect(_this.tableword);
			} else if (cmdtext == "$") {
				innerhandlerselect(_this.fnword);
			} else if (cmdtext == ".") {
				//查找表下面的字段
				var _index = entertext.lastIndexOf(' '),
					tablename = entertext.substring(_index + 1, len - 1);
				innerhandlerselect(_this.tableword[tablename]);
			} else if (kcode === 32) {
				innerhandlerselect(_this.keyword);
			} else {
				//字母
				if (kcode <= 90 && kcode >= 65) {
					fillword();
				}else if (kcode <= 105 && kcode >= 96) {//数字
					fillword();
				}else if (kcode <= 57 && kcode >= 48) {
					fillword();
				}else{
					//功能键 返回
					return;
				}
			}
			//输入字母或数字 字符时 只匹配关键字
			function fillword() {
				var _index = entertext.lastIndexOf(' ');
				if (_index === -1) {
					_this.nlocal = entertext;
				} else {
					_this.nlocal = entertext.substr(_index + 1, entertext.length);
				}
				//查找输入的字符
				innerhandlerselect(_this.keyword, _this.nlocal);
			}
			//查询对应的字段显示
			function innerhandlerselect(obj, option) {
				divlist.show();
				targetDom.blur(); //失去焦点
				arr = _this.foreachWord(obj, option);
				_this.renderPage(arr.reverse(), divlistul);
				//高度距离计算 文本框的top+文字的高度+5像素的高度
				divlist.css('top', targetDom.offset().top + listheight + (ch / rows) + 5 + 'px');
				divlist.css('left', listwidth - targetDom.offset().left + 5 + 'px');
			}
			//sql cache
			_this.sqlstr = entertext;
		});
		//选择关键字
		divlistul.click(function(event) {
			var tar = event.target;
			//如果选择了关键字
			if (tar.tagName == 'LI') {
				divlist.hide();
				replaceCMD();
				targetDom.val(_this.sqlstr + $(tar).text()).focus();
			}
		});
		//替换命令字符
		function replaceCMD() {
			var entertext = targetDom.val().toLocaleLowerCase(),
				len = entertext.length,
				cmdtext = targetDom.val().substr(len - 1, len);

			if (cmdtext == "@" || cmdtext == "$") {
				_this.sqlstr = entertext.substring(0, len - 1);
			}
			//如果用户输入的字符不为空
			if (_this.nlocal !== '') {
				var _index = entertext.lastIndexOf(_this.nlocal);
				_this.sqlstr = entertext.substring(0, _index);
				_this.nlocal = '';
			}
		}
		//选择上下键滚动
		function scrollkey(type) {

			var _indexclass = divlistul.find('._indexclass'),
				len = _indexclass.length;

			//默认赋值第一个元素
			if (len === 0) {
				divlistul.find('li').first().addClass('_indexclass');
				return;
			}
			if (type === "up") {
				_indexclass.prev().addClass('_indexclass').siblings().removeClass('_indexclass');
			} else {
				_indexclass.next().addClass('_indexclass').siblings().removeClass('_indexclass');
			}
			//计算当前元素位于滚动条的位置 
			var stop = divlistul[0].scrollHeight - divlist.height(),
				length = divlistul.find('li').length,
				scrollt = (stop / length) * _indexclass.index();
			//滚动条 联动   
			divlist.scrollTop(scrollt);
		}
	},
	/*渲染页面
	 param @ arr渲染的数据
	 param @ tmp渲染的数据的模板
	*/
	renderPage: function(arr, tmp) {
		var i = arr.length,
			listr = '';
		if (arr.length === 0) {
			tmp.html("无结果!");
			return;
		}
		while (i) {
			i--;
			listr += "<li>" + arr[i] + "</li>";
		}
		tmp.html(listr);
	},
	/*
    用于查询sql关键字和sql的函数 
	*/
	foreachWord: function(targetObj, option) {
		var tempArr = [];
		for (var i in targetObj) {
			if (option) {
				var _index = targetObj[i].indexOf(option);
				if (_index !== -1) {
					tempArr.push(targetObj[i]);
				}
			} else {
				tempArr.push(i);
			}
		}
		return tempArr;
	},
	//关键字配置
	keyword: {
		"*": "*",
		"select": "select",
		"from": "from",
		"where": "where",
		"delete": "delete",
		"distinct": "distinct",
		"as": "as",
		"update": "update",
		"insert": "insert",
		"set": "where",
		"and": "and"
	},
	tableword: {
		"table1": {
			"name": "aaa",
			"age": 12
		},
		"table2": {
			"name": "bbb",
			"age": 13
		},
		"table3": {
			"name": "ccc",
			"age": 14
		},
		"table4": {
			"name": "ddd",
			"age": 14
		},
		"table5": {
			"name": "eee",
			"age": 15
		},
		"table6": {
			"name": "fff",
			"age": 16
		},
	},
	fnword: {
		"fnname1": "fnname1",
		"fnname2": "fnname2",
		"fnname3": "fnname3",
		"fnname4": "fnname4",
		"fnname5": "fnname5"
	}
};