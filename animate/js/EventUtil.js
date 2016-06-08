 var doc = document;
 var EventUtil = {
     EventTarget: function() {
         this.handlers = {};
     },
     getEvent: function(event) {
         return event ? event : window.event;
     },
     getTarget: function(event) {
         return event.target || event.srcElement;
     },
     preventDefault: function(event) {
         if (event.preventDefault) {
             event.preventDefault();
         } else {
             event.returnValue = false;
         }
     },
     stopPropagation: function(event) {
         if (event.stopPropagation) {
             event.stopPropagation();
         } else {
             event.cancelBubble = true;
         }
     },
     getRelatedTarget: function(event) {
         if (event.relatedTarget) {
             return event.relatedTarget;
         } else {
             return null;
         }
     },
     getButton: function(event) {
         if (doc.implementation.hasFeature('MouseEvents', '2.0')) {
             return event.button;
         }
     },
     getCharCode: function(event) {
         if (typeof event.charCode == 'number') {
             return event.charCode;
         } else {
             return event.keyCode;
         }
     },
     getClipboardText: function(event) {
         var clipboardData = (event.clipboardData || window.clipboardData);
         return clipboardData.getData("text");
     },
     setClipboardText: function(event, value) {
         if (event.clipboardData) {
             return event.clipboardData.setData("text/plain", value);
         } else if (window.clipboardData) {
             return window.clipboardData.setData("text", value);
         }
     },
     addHandler: function(target, eventtype, cb) {
         if (target.attachEvent) {
             target.attachEvent('on' + eventtype, cb);
         } else {
             target.addEventListener(eventtype, cb);
         }
     },
     removeHandler: function(target, eventtype, cb) {
         if (target.detachEvent) {
             target.detachEvent('on' + eventtype, cb);
         } else {
             target.removeEventListener(eventtype, cb);
         }
     }
 };
 //封装观察者模式
 EventUtil.EventTarget.prototype = {
     constructor: EventUtil.EventTarget,
     addHandler: function(type, handler) {
         if (typeof this.handlers[type] == 'undefined') {
             this.handlers[type] = [];
         }
         this.handlers[type].push(handler);
         console.log('addHandler', this.handlers[type]);
     },
     fire: function(event) {
         if (!event.target) {
             event.target = this;
         }
         if (this.handlers[event.type] instanceof Array) {
             var handlers = this.handlers[event.type];
             for (var i = 0, len = handlers.length; i < len; i++) {
                 handlers[i](event);
             }
         }
     },
     removeHandler: function(type, handler) {
         if (this.handlers[type] instanceof Array) {
             var handlers = this.handlers[type];
             for (var i = 0, len = handlers.length; i < len; i++) {
                 if (handlers[i] === handler) {
                     //第一个参数为当前数组的index 后一个参数为删除几个
                     handlers.splice(i, 1);
                     break;
                 }
             }
         }
         console.log('removeHandler', this.handlers);
     }
 };