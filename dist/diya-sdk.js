!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/process/browser.js","inherits":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js":[function(require,module,exports){
/* Diya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */


var message = require('./services/message');

//Services
var auth = require('./services/auth/auth');
var timer = require('./services/timer/timer');
var rtc = require('./services/rtc/rtc');
var Promethe = require('./services/promethe/promethe');
var watchdog = require('./services/watchdog/watchdog');
var discover = require('./services/discover/discover');
var qei = require('./services/qei/qei');

var WebSocket = window.WebSocket || window.MozWebSocket;



 

function Diya(addr){
	var that = this;
	var socket;	

	var close_cb = null;

	var pendingRequests = [];
	var registeredListeners = [];

	var nextReqId = -1;
	function consumeNextReqId(){
		nextReqId++;
		return nextReqId;
	}

	var nextSubscriptionId = -1;
	function consumeNextSubscriptionId(){
		nextSubscriptionId++;
		return nextSubscriptionId;
	}
	
	function dispatch(msg){

		if(msg.reqId !== undefined){
			dispatchRequest(msg);
		}else if(msg.subId !== undefined){
			dispatchEvent(msg);
		}
		//If the msg doesn't have a reqId, it cannot be matched to a pending request
		else {
			console.log('missing reqId or subId. Ignoring msg : ');
			console.log(msg);
			return ;
		}

		
	}

	function dispatchRequest(msg){
		//If msg.reqId corresponds to a pending request, execute the response callback
		if(typeof pendingRequests[msg.reqId] === 'function'){
			console.log(msg);

			//execute the response callback, pass the message data as argument
			pendingRequests[msg.reqId](msg.data);
			delete pendingRequests[msg.reqId];
		}else{
			//No pending request for this reqId, ignoring response
			console.log('msg.reqId doesn\'t match any pending request, Ignoring msg ! '+msg);
			return ;
		}
	}

	function dispatchEvent(msg){
		//If msg.subId corresponds to a registered listener, execute the event callback
		if(typeof registeredListeners[msg.subId] === 'function'){
			console.log(msg);

			//execute the event callback, pass the message data as argument
			if(!msg.result || msg.result != 'closed'){
				registeredListeners[msg.subId](msg.data);
			}else{
				//If the subscription was closed, then remove the handler
				delete registeredListeners[msg.subId];
			}


		}else{
			//No pending request for this subId, ignoring event
			console.log('msg.subId doesn\'t match any registered listeners, Ignoring msg ! '+msg);
			return ;
		}
	}
	
	
	function send(msg){
		if(socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED){
			console.log("diya-SDK : cannot send message -> socket closed");
		}
		try{
			data = JSON.stringify(msg);
			socket.send(data);
		}catch(e){
			console.log('malformed JSON, ignoring msg...');
		}
	}	
	
	function handleMessage(incomingMessage){
		var msg;

		try{
			msg = JSON.parse(incomingMessage.data);
		}catch(e){
			console.log("malformed JSON");
			 
			return ;
		}
		
		dispatch(msg);

	};
	
	function closeAll(){
		while(pendingRequests.length){
			pendingRequests.pop();
		}
		while(registeredListeners.length){
			registeredListeners.pop();
		}

		console.log(close_cb);

		if(typeof close_cb === 'function'){
			close_cb();
		}
	}

	function createMessage(params){
		if(!params.service) return null;
		else return {
			service: params.service,
			func: params.func ? params.func : undefined,
			obj: params.obj ? params.obj : undefined,
			data: params.data ? params.data : undefined
		}
	}


	///////////////////////////////////
	//////////Public API///////////////
	///////////////////////////////////
	
	this.connect = function(callback, args){
		
console.log("sock created");	

		try{
			socket = new WebSocket(addr);

			socket.onerror = function(e){
				callback("Cannot Connect", null);
			}
			
			socket.onopen = function(){
				callback(null, args);
			};
			
			socket.onmessage = function(incomingMessage){
				handleMessage(incomingMessage);
			}
			
			socket.onclose = function(){
				closeAll();
			}
		}catch(e){
			console.log("can't connect to "+addr);
		}
	};

	this.get = function(params, callback){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.reqId = consumeNextReqId();
		pendingRequests[msg.reqId] = callback;

		send(msg);
	}

	this.listen = function(params, callback){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.subId = consumeNextSubscriptionId();
		registeredListeners[msg.subId] = callback;
		
		send(msg);

		return msg.subId;
	}

	this.closeCallback = function(cb){
		close_cb = cb;
	}

	this.stopListening = function(subId){
		msg = {
			func: 'Unsubscribe',
			data: {
				subId: subId
			}
		}

		send(msg);
	}

	this.connected = function(){
		return ! (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED);
	}

	this.disconnect = function(){
		socket.close();
	}
	
}


function DiyaClient(addr, user, password){

	var that = this;

	//var nodes = new Array();

	console.log("EOK");

	function createNode(){
		var node = new diya.Diya(addr);
		//nodes.push(node);

		return node;
	}

	this.setAddress = function(address){
		addr = address;
	}

	this.createSession = function(onconnected, onfailure){

		console.log("createSession");

		var node = createNode();

		node.connect(function(err){
			if(err){
				onfailure(err);
			}else{
				node.get({
					service: 'auth',
					func: 'Authenticate',
					data: {user: user, password: password}
				},
				function(res){
					if(res.authenticated || (res.error && res.error === 'ServiceNotFound')) onconnected(node);
					else onfailure();
				});
			}
		});	
	}
	
}


var diya = {
		DiyaClient: DiyaClient,
		Diya: Diya,
		auth: auth,
		timer: timer,
		rtc: rtc,
		Promethe: Promethe,
		watchdog: watchdog,
		discover: discover,
		qei: qei
}

module.exports = diya;

},{"./services/auth/auth":"/home/antoroll/workspace/DiyaSDK/src/services/auth/auth.js","./services/discover/discover":"/home/antoroll/workspace/DiyaSDK/src/services/discover/discover.js","./services/message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","./services/promethe/promethe":"/home/antoroll/workspace/DiyaSDK/src/services/promethe/promethe.js","./services/qei/qei":"/home/antoroll/workspace/DiyaSDK/src/services/qei/qei.js","./services/rtc/rtc":"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js","./services/timer/timer":"/home/antoroll/workspace/DiyaSDK/src/services/timer/timer.js","./services/watchdog/watchdog":"/home/antoroll/workspace/DiyaSDK/src/services/watchdog/watchdog.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/auth/auth.js":[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */


var util = require('util');

var Message = require('../message');


function Authenticate(user, password, callback){
	Message.call(this, 'auth', 'Authenticate');
	
	this.user = user;
	this.password = password;
	this.callback = callback;
}
util.inherits(Authenticate, Message);

Authenticate.prototype.exec = function(){
	return Authenticate.super_.prototype.exec.call(this, {
			user: this.user,
			password: this.password
	});
}

Authenticate.prototype.parse = function(data){
	if(data.authenticated != undefined){
		this.callback(data.authenticated);
	}
}


var core = {
		Authenticate: Authenticate
}

module.exports = core;

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/discover/discover.js":[function(require,module,exports){
var dgram;

var networkIdRequest = 'diya-network-id\n';

var socket;
var callbacks = [];
var diyas = [];


var state = 'stopped';

function isNode(){
	if(dgram) return true;
	try{
		dgram = require('dgram'+'');
		return true;
	}catch(e){
		return false;
	}
}

function listen(callback){
	if(!isNode()) return ;
	callbacks.push(callback);
	
}

function removeOutdatedDiyas(){
	for(var i=0;i<diyas.length; i++){
		if(new Date().getTime() - diyas[i].touch > 10000){
			diyas.splice(i, 1);
		}
	}
}

function getDiya(name, port, address){
	for(var i=0; i<diyas.length; i++){
		if(diyas[i].name === name && diyas[i].addr === address+':'+port){
			return diyas[i];
		}
	}
	return null;
}

function gotDiya(name, port, address){


	var diya = getDiya(name, port, address);
	if(!diya){
		diya = {name: name, addr: address+':'+port};
		diyas.push(diya);
	}
	diya.touch = new Date().getTime();
}

function dispatchAnswer(name, port, address){
	for(var i=0;i<callbacks.length;i++){
		callbacks[i](name, port, address);
	}
}

function request(){
	socket.send(networkIdRequest, 0, networkIdRequest.length, 2000, '255.255.255.255');
}

function start(){
	if(!isNode()) return ;

	state = 'started';

	if(!socket){
		socket = dgram.createSocket('udp4');

		socket.on('message', function(data, rinfo){
			var msg = data.toString('ascii');
			var params = msg.split(':');
			
			if(params.length == 2){
				gotDiya(params[0], params[1], rinfo.address);
			}
		});

		socket.on('listening', function(){
			socket.setBroadcast(true);	
		});
	}

	function doDiscover(){
		request();
		removeOutdatedDiyas();

		if(state === 'started') setTimeout(doDiscover, 1000);
	}
	doDiscover();


}

function stop(){

	state = 'stopped';

	if(socket) socket.close();
	while(callbacks.length){
		callbacks.pop();
	}
}


function availableDiyas(){
	return diyas;
}

module.exports = {
	start: start,
	stop: stop,
	listen: listen,
	isDiscoverable: isNode,
	availableDiyas: availableDiyas
}
},{}],"/home/antoroll/workspace/DiyaSDK/src/services/message.js":[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



function Message(service, func, obj, permanent){

	this.service = service;
	this.func = func;
	this.obj = obj;
	
	this.permanent = permanent; //If this flag is on, the command will stay on the callback list listening for events
}

Message.buildSignature = function(msg){
	return msg.service+'.'+msg.func+'.'+msg.obj;
}


Message.prototype.signature = function(){
	return this.service+'.'+this.func+'.'+this.obj;
}

Message.prototype.exec = function(data){
	return {
		service: this.service,
		func: this.func,
		obj: this.obj,
		data: data
	}
}

module.exports = Message;

},{}],"/home/antoroll/workspace/DiyaSDK/src/services/promethe/promethe.js":[function(require,module,exports){
var RTC = require('../rtc/rtc');

function Promethe(session){
	this.rtc = new RTC.RTC(session);
}

Promethe.prototype.use = function(regex, callback){
	var that = this;
	this.rtc.use(regex, function(channel){
		that._negociateNeuron(channel, callback);
	});
}

Promethe.prototype.connect = function(){
	this.rtc.connect();
}

Promethe.prototype.disconnect = function(){
	this.rtc.disconnect();
}


Promethe.prototype._negociateNeuron = function(channel, callback){
	channel.setOnMessage(function(message){
		
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O'){
			//Input
			channel.type = 'input'; //Promethe Output = Client Input
		}else if(typeChar === 'I'){
			//Output
			channel.type = 'output'; //Promethe Input = Client Output
		}else{
			//Error
		}

		var size = view.getInt32(1,true);
		if(size != undefined){
			channel.size = size;
			channel._buffer = new Float32Array(size);
		}else{
			//error
		}



		channel.setOnMessage(undefined);

		channel.setOnValue = function(onvalue_cb){
			channel.setOnMessage(onvalue_cb);
		}

		channel.write = function(index, value){
			if(index < 0 || index > channel.size || isNaN(value)) return false;
			channel._buffer[index] = value;
			return true;
		}

		channel.frequency = 33;

		channel._run = function(){
			channel.send(channel._buffer);
			setTimeout(channel._run, channel.frequency);
		}

		channel._run();

		callback(channel);

	});
}


module.exports = Promethe;
},{"../rtc/rtc":"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/qei/qei.js":[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');


var Message = require('../message');


function QEI(node, callback, sampling){
	var that = this;
	this.node = node;
	
	this.sampling = sampling || 10; /* max num of pts displayed */
	this.callback = callback || function(res){}; /* callback, usually after getModel */

	node.get({
		service: "qei",
		func: "DataRequest",
		data: {
			type:"msgInit",
			sampling: 1,
			requestedData: "all"
			/* no time range specified */
			}
		}, function(data){
			that.dataModel= {};
			// console.log(JSON.stringify(that.dataModel));
			that.getDataModelFromRecv(data);
			// console.log(JSON.stringify(that.dataModel));
			
			/// that.updateChart(this.dataModel);
			that.callback(that.dataModel);

			node.listen({
					service: "qei",
					func: "SubscribeQei"
				}, function(res) {
					that.getDataModelFromRecv(res.data);
					that.callback(that.dataModel);
					});
	});

	console.log("DiyaSDK - QEI: created");
	return this;
}

QEI.prototype.getSampling = function(numSamples){
	return this.sampling;
}
QEI.prototype.setSampling = function(numSamples){
	this.sampling = numSamples;
}


/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
 */
QEI.prototype.getDataModelFromRecv = function(data){
	var dataModel=this.dataModel;
	/*\
	|*|
	|*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
	|*|
	|*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
	|*|
	\*/
	/** Decoder un tableau d'octets depuis une chaîne en base64 */
	b64ToUint6 = function(nChr) {
		return nChr > 64 && nChr < 91 ?
				nChr - 65
			: nChr > 96 && nChr < 123 ?
				nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
			: nChr === 43 ?
				62
			: nChr === 47 ?
				63
			:	0;
	};
	/**
	 * Decode base64 string to UInt8Array
	 * @param  {String} sBase64     base64 coded string
	 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
	 * @return {Uint8Array}             tab of decoded bytes
	 */
	base64DecToArr = function(sBase64, nBlocksSize) {
		var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
		nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
		buffer = new ArrayBuffer(nOutLen), taBytes = new Uint8Array(buffer);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3; /* n mod 4 */
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;

			}
		}
		// console.log("u8int : "+JSON.stringify(taBytes));
		return buffer;
	};
	
	if(data && data.header) {
		// console.log('rcvdata '+JSON.stringify(data));
		// if(!data.header.sampling) data.header.sampling=1;
		
		/** case 1 : 1 value received added to dataModel */
		if(data.header.sampling==1) {
			if(data.header.timeEnd) {
				if(!dataModel.time) dataModel.time=[];
				dataModel.time.push(data.header.timeEnd);
				if(dataModel.time.length > this.sampling) {
					dataModel.time = dataModel.time.slice(dataModel.time.length - this.sampling);
				}
			}
			for (var n in data) {
				if(n != "header" && n != "time") {
					// console.log(n);
					if(!dataModel[n]) {
						dataModel[n]={};
						dataModel[n].data=[];
					}

					/* update dataFrame */
					dataModel[n].frame=data[n].frame;

					if(data[n].data.length > 0) {
						/* decode data to Float32Array*/
						var buf = base64DecToArr(data[n].data, 4);
						// console.log(JSON.stringify(buf));
						var fArray = new Float32Array(buf);

						if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
						if(data[n].size != 1) console.log("Expected 1 value received :"+data[n].size);
						
						if(!dataModel[n].data) dataModel[n].data=[];
						dataModel[n].data.push(fArray[0]);
						if(dataModel[n].data.length > this.sampling) {
							dataModel[n].data = dataModel[n].data.slice(dataModel[n].data.length - this.sampling);
						}
					}
					else {
						if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
						dataModel[n].data = [];
					}
					// console.log('mydata '+JSON.stringify(dataModel[n].data));
				}
			}
		}
		else {
			/** case 2 : history data - many values received */
			/** TODO  */
			for (var n in data) {
				if(n == 'time') {
					/* case 1 : time data transmitted, 1 value */
					/** TODO **/
				}
				else if(n != "header") {
					// console.log(n);
					if(!dataModel[n]) {
						dataModel[n]={};
						dataModel[n].data=[];
					}

					/* update dataFrame */
					dataModel[n].frame=data[n].frame;

					if(data[n].data.length > 0) {
						/* decode data to Float32Array*/
						var buf = base64DecToArr(data[n].data, 4); 
						// console.log(JSON.stringify(buf));
						var fArray = new Float32Array(buf);

						if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
						// /* increase size of data if necessary */
						if(fArray.length>dataModel[n].data.length) {
							// dataModel[n].size=data[n].size;
							dataModel[n].data = new Array(dataModel[n].size);
						}
						/* update nb of samples stored */
						for(var i in fArray) {
							dataModel[n].data[parseInt(i)]=fArray[i]; /* keep first val - name of column */
						}
					}
					else {
						if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
						dataModel[n].data = [];
					}
					// dataModel[n].data = Array.from(fArray);
					// console.log('mydata '+JSON.stringify(dataModel[n].data));
				}
			}
		}
	}
	else {
		console.err("No Data to read or header is missing !");
	}
	return this.dataModel;
}


var exp = {
		QEI: QEI
}

module.exports = exp; 

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js":[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');


var Message = require('../message');

/*============COMMANDS==============*/

function ListChannels(onList){
	Message.call(this, 'rtc', 'ListChannels');
	
	this.onList = onList;

	this.permanent = true;
}
util.inherits(ListChannels, Message);

ListChannels.prototype.exec = function(){
	return ListChannels.super_.prototype.exec.call(this);
}

ListChannels.prototype.parse = function(data){
	if(this.onList) this.onList(data.channels);
}

function Connect(channels){
	Message.call(this,'rtc', 'Connect');

	this.channels = channels;
}
util.inherits(Connect, Message);

Connect.prototype.exec =function(){
	var msg = Connect.super_.prototype.exec.call(this);
	msg.obj = this.channels;
	return msg;
}

Connect.prototype.parse = function(data){}

function OfferListener(onoffer){
	Message.call(this, 'rtc', 'RemoteOffer');

	this.onOffer = onoffer;

	this.permanent = true;
}
util.inherits(OfferListener, Message);

OfferListener.prototype.exec = function(){
	return null;
}

OfferListener.prototype.parse = function(data){
	if(this.onOffer) this.onOffer(data);
}

function Answer(promID, session_description){
	Message.call(this, 'rtc', 'Answer');

	this.session_description = session_description;
	this.promID = promID;
}
util.inherits(Answer, Message);

Answer.prototype.exec = function(){
	var that = this;
	return Answer.super_.prototype.exec.call(this, {
		sdp: that.session_description.sdp,
		type: that.session_description.type,
		promID: that.promID
	});
}

Answer.prototype.parse = function(data){

}

function ICECandidate(promID, candidate){
	Message.call(this, 'rtc', 'ICECandidate');

	this.candidate = candidate;
	this.promID = promID;
}
util.inherits(ICECandidate, Message);

ICECandidate.prototype.exec = function(){
	var that = this;
	return ICECandidate.super_.prototype.exec.call(this,{
		candidate: that.candidate,
		promID: that.promID
	});
}

ICECandidate.prototype.parse = function(data){

}

function ICECandidateListener(onicecandidate){
	Message.call(this, 'rtc', 'RemoteICECandidate');

	this.onICECandidate = onicecandidate;

	this.permanent = true;
}
util.inherits(ICECandidateListener, Message);

ICECandidateListener.prototype.exec = function(){
	return null;
}

ICECandidateListener.prototype.parse = function(data){
	if(this.onICECandidate) this.onICECandidate(data);
}

/*==========================================*/
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function Channel(params){
	this.name = params;

	this.channel = undefined;
	this.onopen = undefined;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.channel.readyState === 'open') this.channel.send(msg);
	else console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
}

function RTC(node){
	var that = this;
	
	this.node = node;
	this.availableChannels = new Array();
	this.usedChannels = new Array();

	this.peers = new Array();
	
	this.id = -1;

	node.listen({
		service: 'rtc',
		func: 'ListChannels'
	},
	function(data){ 
		for(var i = 0; i < data.channels.length; i++){
			that.availableChannels.push(new Channel(data.channels[i]));
		}
	});

}

RTC.prototype.use = function(name_regex, onopen_callback){

	for(var i=0; i < this.availableChannels.length;i++){
		var n = this.availableChannels[i];
		if(n.name && n.name.match(name_regex)){
			n.onopen = onopen_callback;
			this.usedChannels[n.name] = n;
		}
	}
}

RTC.prototype.disconnect = function(){
	for(var i=0;i<this.peers.length;i++){
		this.peers[i].close();
	}
	this.peers = new Array();
}

RTC.prototype.connect = function(){
	var that = this;

	var channels = new Array();
	for(var n in this.usedChannels){
		channels.push(n);
	}


	this.node.listen({
		service: 'rtc',
		func: 'Connect',
		obj: channels
	},
	function(data){
		that._handleNegociationMessage(data);
	});
}


RTC.prototype._handleNegociationMessage = function(msg){

	if(msg.eventType === 'RemoteOffer'){
		this.peers[msg.promID] = this._createPeer(msg);
	}else if(msg.eventType === 'RemoteICECandidate'){
		this._addRemoteICECandidate(this.peers[msg.promID], msg);
	}
}

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
RTC.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	console.log("create answer");

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.node.get({
			service: 'rtc',
			func: 'Answer',
			data:{
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	},
	function(err){
		console.log("cannot create answer");
	}, 
	{ 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });

	peer.onicecandidate = function(evt){
		
		that.node.get({
			service: 'rtc',
			func: 'ICECandidate',
			data:{
				peerId: data.peerId,
				promID: data.promID,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that._onDataChannel(evt.channel);
	};

	peer.onaddstream = function(evt){
		console.log("ON ADD STREAM");
		var remoteView = document.querySelector("#myvid");
		remoteView.src = URL.createObjectURL(evt.stream);
	};

	peer.promID = data.promID;

	return peer;
}

RTC.prototype._addRemoteICECandidate = function(peer, data){
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		peer.addIceCandidate(candidate,function(){
			console.log("candidate added ("+peer.iceConnectionState+")");
		},function(e){
			console.log(e);
		});
	}catch(e) {console.log(e);}
}

RTC.prototype._onDataChannel = function(datachannel){
	console.log("Channel "+datachannel.label+" created !");

	var channel = this.usedChannels[datachannel.label];
	if(!channel){
		datachannel.close();
		return ;
	}

	channel.setChannel(datachannel);
}


var exp = {
		ListChannels: ListChannels,
		RTC: RTC
}

module.exports = exp; 

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/timer/timer.js":[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');

var Message = require('../message');

function Timer(period, ontime){
	Message.call(this, 'timer');
	
	this.period = period;
	this.ontime = ontime;
	
	if(period){
		this.loop = true;
		this.permanent = true;
	}
}
util.inherits(Timer, Message);

Timer.prototype.exec = function(){
	return Timer.super_.prototype.exec.call(this, {
		loop: this.loop,
		period: this.period
	});
}

Timer.prototype.parse = function(data){
	if(! data) return ;
	if(data.currentTime){
		this.ontime(data.currentTime);
	}
}



var timer = {
		Timer: Timer
}

module.exports = timer;

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/watchdog/watchdog.js":[function(require,module,exports){
/* diya-sdk
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var util = require('util');

var Message = require('../message');


function ListServices(callback){
	Message.call(this, 'watchdog', 'ListServices');

	this.callback = callback;
}
util.inherits(ListServices, Message);

ListServices.prototype.exec = function(){
	return ListServices.super_.prototype.exec.call(this);
}

ListServices.prototype.parse = function(data){
	if(data.services && this.callback) this.callback(data.services);
}


module.exports = {
	ListServices: ListServices
}


},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}]},{},["/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js"])("/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9EaXlhU0RLL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvYXV0aC9hdXRoLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL21lc3NhZ2UuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvcWVpL3FlaS5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9EaXlhU0RLL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL3RpbWVyL3RpbWVyLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL3dhdGNoZG9nL3dhdGNoZG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyogRGl5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIG1lc3NhZ2UgPSByZXF1aXJlKCcuL3NlcnZpY2VzL21lc3NhZ2UnKTtcblxuLy9TZXJ2aWNlc1xudmFyIGF1dGggPSByZXF1aXJlKCcuL3NlcnZpY2VzL2F1dGgvYXV0aCcpO1xudmFyIHRpbWVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy90aW1lci90aW1lcicpO1xudmFyIHJ0YyA9IHJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0YycpO1xudmFyIFByb21ldGhlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9wcm9tZXRoZS9wcm9tZXRoZScpO1xudmFyIHdhdGNoZG9nID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy93YXRjaGRvZy93YXRjaGRvZycpO1xudmFyIGRpc2NvdmVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9kaXNjb3Zlci9kaXNjb3ZlcicpO1xudmFyIHFlaSA9IHJlcXVpcmUoJy4vc2VydmljZXMvcWVpL3FlaScpO1xuXG52YXIgV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0O1xuXG5cblxuIFxuXG5mdW5jdGlvbiBEaXlhKGFkZHIpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBzb2NrZXQ7XHRcblxuXHR2YXIgY2xvc2VfY2IgPSBudWxsO1xuXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSBbXTtcblx0dmFyIHJlZ2lzdGVyZWRMaXN0ZW5lcnMgPSBbXTtcblxuXHR2YXIgbmV4dFJlcUlkID0gLTE7XG5cdGZ1bmN0aW9uIGNvbnN1bWVOZXh0UmVxSWQoKXtcblx0XHRuZXh0UmVxSWQrKztcblx0XHRyZXR1cm4gbmV4dFJlcUlkO1xuXHR9XG5cblx0dmFyIG5leHRTdWJzY3JpcHRpb25JZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCl7XG5cdFx0bmV4dFN1YnNjcmlwdGlvbklkKys7XG5cdFx0cmV0dXJuIG5leHRTdWJzY3JpcHRpb25JZDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gZGlzcGF0Y2gobXNnKXtcblxuXHRcdGlmKG1zZy5yZXFJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoUmVxdWVzdChtc2cpO1xuXHRcdH1lbHNlIGlmKG1zZy5zdWJJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoRXZlbnQobXNnKTtcblx0XHR9XG5cdFx0Ly9JZiB0aGUgbXNnIGRvZXNuJ3QgaGF2ZSBhIHJlcUlkLCBpdCBjYW5ub3QgYmUgbWF0Y2hlZCB0byBhIHBlbmRpbmcgcmVxdWVzdFxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ21pc3NpbmcgcmVxSWQgb3Igc3ViSWQuIElnbm9yaW5nIG1zZyA6ICcpO1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0XG5cdH1cblxuXHRmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QobXNnKXtcblx0XHQvL0lmIG1zZy5yZXFJZCBjb3JyZXNwb25kcyB0byBhIHBlbmRpbmcgcmVxdWVzdCwgZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0Ly9leGVjdXRlIHRoZSByZXNwb25zZSBjYWxsYmFjaywgcGFzcyB0aGUgbWVzc2FnZSBkYXRhIGFzIGFyZ3VtZW50XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXShtc2cuZGF0YSk7XG5cdFx0XHRkZWxldGUgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF07XG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyByZXFJZCwgaWdub3JpbmcgcmVzcG9uc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cucmVxSWQgZG9lc25cXCd0IG1hdGNoIGFueSBwZW5kaW5nIHJlcXVlc3QsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChtc2cpe1xuXHRcdC8vSWYgbXNnLnN1YklkIGNvcnJlc3BvbmRzIHRvIGEgcmVnaXN0ZXJlZCBsaXN0ZW5lciwgZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0aWYoIW1zZy5yZXN1bHQgfHwgbXNnLnJlc3VsdCAhPSAnY2xvc2VkJyl7XG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShtc2cuZGF0YSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Ly9JZiB0aGUgc3Vic2NyaXB0aW9uIHdhcyBjbG9zZWQsIHRoZW4gcmVtb3ZlIHRoZSBoYW5kbGVyXG5cdFx0XHRcdGRlbGV0ZSByZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF07XG5cdFx0XHR9XG5cblxuXHRcdH1lbHNle1xuXHRcdFx0Ly9ObyBwZW5kaW5nIHJlcXVlc3QgZm9yIHRoaXMgc3ViSWQsIGlnbm9yaW5nIGV2ZW50XG5cdFx0XHRjb25zb2xlLmxvZygnbXNnLnN1YklkIGRvZXNuXFwndCBtYXRjaCBhbnkgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cdFxuXHRcblx0ZnVuY3Rpb24gc2VuZChtc2cpe1xuXHRcdGlmKHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORyB8fCBzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImRpeWEtU0RLIDogY2Fubm90IHNlbmQgbWVzc2FnZSAtPiBzb2NrZXQgY2xvc2VkXCIpO1xuXHRcdH1cblx0XHR0cnl7XG5cdFx0XHRkYXRhID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcblx0XHRcdHNvY2tldC5zZW5kKGRhdGEpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKCdtYWxmb3JtZWQgSlNPTiwgaWdub3JpbmcgbXNnLi4uJyk7XG5cdFx0fVxuXHR9XHRcblx0XG5cdGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKXtcblx0XHR2YXIgbXNnO1xuXG5cdFx0dHJ5e1xuXHRcdFx0bXNnID0gSlNPTi5wYXJzZShpbmNvbWluZ01lc3NhZ2UuZGF0YSk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJtYWxmb3JtZWQgSlNPTlwiKTtcblx0XHRcdCBcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHRcdFxuXHRcdGRpc3BhdGNoKG1zZyk7XG5cblx0fTtcblx0XG5cdGZ1bmN0aW9uIGNsb3NlQWxsKCl7XG5cdFx0d2hpbGUocGVuZGluZ1JlcXVlc3RzLmxlbmd0aCl7XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMucG9wKCk7XG5cdFx0fVxuXHRcdHdoaWxlKHJlZ2lzdGVyZWRMaXN0ZW5lcnMubGVuZ3RoKXtcblx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnMucG9wKCk7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coY2xvc2VfY2IpO1xuXG5cdFx0aWYodHlwZW9mIGNsb3NlX2NiID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNsb3NlX2NiKCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShwYXJhbXMpe1xuXHRcdGlmKCFwYXJhbXMuc2VydmljZSkgcmV0dXJuIG51bGw7XG5cdFx0ZWxzZSByZXR1cm4ge1xuXHRcdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0XHRmdW5jOiBwYXJhbXMuZnVuYyA/IHBhcmFtcy5mdW5jIDogdW5kZWZpbmVkLFxuXHRcdFx0b2JqOiBwYXJhbXMub2JqID8gcGFyYW1zLm9iaiA6IHVuZGVmaW5lZCxcblx0XHRcdGRhdGE6IHBhcmFtcy5kYXRhID8gcGFyYW1zLmRhdGEgOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy9QdWJsaWMgQVBJLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFxuXHR0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihjYWxsYmFjaywgYXJncyl7XG5cdFx0XG5jb25zb2xlLmxvZyhcInNvY2sgY3JlYXRlZFwiKTtcdFxuXG5cdFx0dHJ5e1xuXHRcdFx0c29ja2V0ID0gbmV3IFdlYlNvY2tldChhZGRyKTtcblxuXHRcdFx0c29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcblx0XHRcdFx0Y2FsbGJhY2soXCJDYW5ub3QgQ29ubmVjdFwiLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIGFyZ3MpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGluY29taW5nTWVzc2FnZSl7XG5cdFx0XHRcdGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjbG9zZUFsbCgpO1xuXHRcdFx0fVxuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiY2FuJ3QgY29ubmVjdCB0byBcIithZGRyKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5nZXQgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrKXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5yZXFJZCA9IGNvbnN1bWVOZXh0UmVxSWQoKTtcblx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXSA9IGNhbGxiYWNrO1xuXG5cdFx0c2VuZChtc2cpO1xuXHR9XG5cblx0dGhpcy5saXN0ZW4gPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrKXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5zdWJJZCA9IGNvbnN1bWVOZXh0U3Vic2NyaXB0aW9uSWQoKTtcblx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0gPSBjYWxsYmFjaztcblx0XHRcblx0XHRzZW5kKG1zZyk7XG5cblx0XHRyZXR1cm4gbXNnLnN1YklkO1xuXHR9XG5cblx0dGhpcy5jbG9zZUNhbGxiYWNrID0gZnVuY3Rpb24oY2Ipe1xuXHRcdGNsb3NlX2NiID0gY2I7XG5cdH1cblxuXHR0aGlzLnN0b3BMaXN0ZW5pbmcgPSBmdW5jdGlvbihzdWJJZCl7XG5cdFx0bXNnID0ge1xuXHRcdFx0ZnVuYzogJ1Vuc3Vic2NyaWJlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c3ViSWQ6IHN1YklkXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VuZChtc2cpO1xuXHR9XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAhIChzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpO1xuXHR9XG5cblx0dGhpcy5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0XHRzb2NrZXQuY2xvc2UoKTtcblx0fVxuXHRcbn1cblxuXG5mdW5jdGlvbiBEaXlhQ2xpZW50KGFkZHIsIHVzZXIsIHBhc3N3b3JkKXtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly92YXIgbm9kZXMgPSBuZXcgQXJyYXkoKTtcblxuXHRjb25zb2xlLmxvZyhcIkVPS1wiKTtcblxuXHRmdW5jdGlvbiBjcmVhdGVOb2RlKCl7XG5cdFx0dmFyIG5vZGUgPSBuZXcgZGl5YS5EaXlhKGFkZHIpO1xuXHRcdC8vbm9kZXMucHVzaChub2RlKTtcblxuXHRcdHJldHVybiBub2RlO1xuXHR9XG5cblx0dGhpcy5zZXRBZGRyZXNzID0gZnVuY3Rpb24oYWRkcmVzcyl7XG5cdFx0YWRkciA9IGFkZHJlc3M7XG5cdH1cblxuXHR0aGlzLmNyZWF0ZVNlc3Npb24gPSBmdW5jdGlvbihvbmNvbm5lY3RlZCwgb25mYWlsdXJlKXtcblxuXHRcdGNvbnNvbGUubG9nKFwiY3JlYXRlU2Vzc2lvblwiKTtcblxuXHRcdHZhciBub2RlID0gY3JlYXRlTm9kZSgpO1xuXG5cdFx0bm9kZS5jb25uZWN0KGZ1bmN0aW9uKGVycil7XG5cdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRvbmZhaWx1cmUoZXJyKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRub2RlLmdldCh7XG5cdFx0XHRcdFx0c2VydmljZTogJ2F1dGgnLFxuXHRcdFx0XHRcdGZ1bmM6ICdBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRcdGRhdGE6IHt1c2VyOiB1c2VyLCBwYXNzd29yZDogcGFzc3dvcmR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0aWYocmVzLmF1dGhlbnRpY2F0ZWQgfHwgKHJlcy5lcnJvciAmJiByZXMuZXJyb3IgPT09ICdTZXJ2aWNlTm90Rm91bmQnKSkgb25jb25uZWN0ZWQobm9kZSk7XG5cdFx0XHRcdFx0ZWxzZSBvbmZhaWx1cmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXHRcbn1cblxuXG52YXIgZGl5YSA9IHtcblx0XHREaXlhQ2xpZW50OiBEaXlhQ2xpZW50LFxuXHRcdERpeWE6IERpeWEsXG5cdFx0YXV0aDogYXV0aCxcblx0XHR0aW1lcjogdGltZXIsXG5cdFx0cnRjOiBydGMsXG5cdFx0UHJvbWV0aGU6IFByb21ldGhlLFxuXHRcdHdhdGNoZG9nOiB3YXRjaGRvZyxcblx0XHRkaXNjb3ZlcjogZGlzY292ZXIsXG5cdFx0cWVpOiBxZWlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXlhO1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIEF1dGhlbnRpY2F0ZSh1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ2F1dGgnLCAnQXV0aGVudGljYXRlJyk7XG5cdFxuXHR0aGlzLnVzZXIgPSB1c2VyO1xuXHR0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoQXV0aGVudGljYXRlLCBNZXNzYWdlKTtcblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIEF1dGhlbnRpY2F0ZS5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzLCB7XG5cdFx0XHR1c2VyOiB0aGlzLnVzZXIsXG5cdFx0XHRwYXNzd29yZDogdGhpcy5wYXNzd29yZFxuXHR9KTtcbn1cblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLmF1dGhlbnRpY2F0ZWQgIT0gdW5kZWZpbmVkKXtcblx0XHR0aGlzLmNhbGxiYWNrKGRhdGEuYXV0aGVudGljYXRlZCk7XG5cdH1cbn1cblxuXG52YXIgY29yZSA9IHtcblx0XHRBdXRoZW50aWNhdGU6IEF1dGhlbnRpY2F0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmU7XG4iLCJ2YXIgZGdyYW07XG5cbnZhciBuZXR3b3JrSWRSZXF1ZXN0ID0gJ2RpeWEtbmV0d29yay1pZFxcbic7XG5cbnZhciBzb2NrZXQ7XG52YXIgY2FsbGJhY2tzID0gW107XG52YXIgZGl5YXMgPSBbXTtcblxuXG52YXIgc3RhdGUgPSAnc3RvcHBlZCc7XG5cbmZ1bmN0aW9uIGlzTm9kZSgpe1xuXHRpZihkZ3JhbSkgcmV0dXJuIHRydWU7XG5cdHRyeXtcblx0XHRkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJysnJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrKXtcblx0aWYoIWlzTm9kZSgpKSByZXR1cm4gO1xuXHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFxufVxuXG5mdW5jdGlvbiByZW1vdmVPdXRkYXRlZERpeWFzKCl7XG5cdGZvcih2YXIgaT0wO2k8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGl5YXNbaV0udG91Y2ggPiAxMDAwMCl7XG5cdFx0XHRkaXlhcy5zcGxpY2UoaSwgMSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERpeWEobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wOyBpPGRpeWFzLmxlbmd0aDsgaSsrKXtcblx0XHRpZihkaXlhc1tpXS5uYW1lID09PSBuYW1lICYmIGRpeWFzW2ldLmFkZHIgPT09IGFkZHJlc3MrJzonK3BvcnQpe1xuXHRcdFx0cmV0dXJuIGRpeWFzW2ldO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ290RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblxuXG5cdHZhciBkaXlhID0gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0aWYoIWRpeWEpe1xuXHRcdGRpeWEgPSB7bmFtZTogbmFtZSwgYWRkcjogYWRkcmVzcysnOicrcG9ydH07XG5cdFx0ZGl5YXMucHVzaChkaXlhKTtcblx0fVxuXHRkaXlhLnRvdWNoID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQW5zd2VyKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXHRmb3IodmFyIGk9MDtpPGNhbGxiYWNrcy5sZW5ndGg7aSsrKXtcblx0XHRjYWxsYmFja3NbaV0obmFtZSwgcG9ydCwgYWRkcmVzcyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVxdWVzdCgpe1xuXHRzb2NrZXQuc2VuZChuZXR3b3JrSWRSZXF1ZXN0LCAwLCBuZXR3b3JrSWRSZXF1ZXN0Lmxlbmd0aCwgMjAwMCwgJzI1NS4yNTUuMjU1LjI1NScpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cblx0c3RhdGUgPSAnc3RhcnRlZCc7XG5cblx0aWYoIXNvY2tldCl7XG5cdFx0c29ja2V0ID0gZGdyYW0uY3JlYXRlU29ja2V0KCd1ZHA0Jyk7XG5cblx0XHRzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihkYXRhLCByaW5mbyl7XG5cdFx0XHR2YXIgbXNnID0gZGF0YS50b1N0cmluZygnYXNjaWknKTtcblx0XHRcdHZhciBwYXJhbXMgPSBtc2cuc3BsaXQoJzonKTtcblx0XHRcdFxuXHRcdFx0aWYocGFyYW1zLmxlbmd0aCA9PSAyKXtcblx0XHRcdFx0Z290RGl5YShwYXJhbXNbMF0sIHBhcmFtc1sxXSwgcmluZm8uYWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2xpc3RlbmluZycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzb2NrZXQuc2V0QnJvYWRjYXN0KHRydWUpO1x0XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb0Rpc2NvdmVyKCl7XG5cdFx0cmVxdWVzdCgpO1xuXHRcdHJlbW92ZU91dGRhdGVkRGl5YXMoKTtcblxuXHRcdGlmKHN0YXRlID09PSAnc3RhcnRlZCcpIHNldFRpbWVvdXQoZG9EaXNjb3ZlciwgMTAwMCk7XG5cdH1cblx0ZG9EaXNjb3ZlcigpO1xuXG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpe1xuXG5cdHN0YXRlID0gJ3N0b3BwZWQnO1xuXG5cdGlmKHNvY2tldCkgc29ja2V0LmNsb3NlKCk7XG5cdHdoaWxlKGNhbGxiYWNrcy5sZW5ndGgpe1xuXHRcdGNhbGxiYWNrcy5wb3AoKTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGF2YWlsYWJsZURpeWFzKCl7XG5cdHJldHVybiBkaXlhcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN0YXJ0OiBzdGFydCxcblx0c3RvcDogc3RvcCxcblx0bGlzdGVuOiBsaXN0ZW4sXG5cdGlzRGlzY292ZXJhYmxlOiBpc05vZGUsXG5cdGF2YWlsYWJsZURpeWFzOiBhdmFpbGFibGVEaXlhc1xufSIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCJ2YXIgUlRDID0gcmVxdWlyZSgnLi4vcnRjL3J0YycpO1xuXG5mdW5jdGlvbiBQcm9tZXRoZShzZXNzaW9uKXtcblx0dGhpcy5ydGMgPSBuZXcgUlRDLlJUQyhzZXNzaW9uKTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKHJlZ2V4LCBjYWxsYmFjayl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ydGMudXNlKHJlZ2V4LCBmdW5jdGlvbihjaGFubmVsKXtcblx0XHR0aGF0Ll9uZWdvY2lhdGVOZXVyb24oY2hhbm5lbCwgY2FsbGJhY2spO1xuXHR9KTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5jb25uZWN0KCk7XG59XG5cblByb21ldGhlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5ydGMuZGlzY29ubmVjdCgpO1xufVxuXG5cblByb21ldGhlLnByb3RvdHlwZS5fbmVnb2NpYXRlTmV1cm9uID0gZnVuY3Rpb24oY2hhbm5lbCwgY2FsbGJhY2spe1xuXHRjaGFubmVsLnNldE9uTWVzc2FnZShmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRcblx0XHR2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhtZXNzYWdlLmRhdGEpO1xuXG5cdFx0dmFyIHR5cGVDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3LmdldFVpbnQ4KDApKTtcblx0XHRpZih0eXBlQ2hhciA9PT0gJ08nKXtcblx0XHRcdC8vSW5wdXRcblx0XHRcdGNoYW5uZWwudHlwZSA9ICdpbnB1dCc7IC8vUHJvbWV0aGUgT3V0cHV0ID0gQ2xpZW50IElucHV0XG5cdFx0fWVsc2UgaWYodHlwZUNoYXIgPT09ICdJJyl7XG5cdFx0XHQvL091dHB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ291dHB1dCc7IC8vUHJvbWV0aGUgSW5wdXQgPSBDbGllbnQgT3V0cHV0XG5cdFx0fWVsc2V7XG5cdFx0XHQvL0Vycm9yXG5cdFx0fVxuXG5cdFx0dmFyIHNpemUgPSB2aWV3LmdldEludDMyKDEsdHJ1ZSk7XG5cdFx0aWYoc2l6ZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0Y2hhbm5lbC5zaXplID0gc2l6ZTtcblx0XHRcdGNoYW5uZWwuX2J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG5cdFx0fWVsc2V7XG5cdFx0XHQvL2Vycm9yXG5cdFx0fVxuXG5cblxuXHRcdGNoYW5uZWwuc2V0T25NZXNzYWdlKHVuZGVmaW5lZCk7XG5cblx0XHRjaGFubmVsLnNldE9uVmFsdWUgPSBmdW5jdGlvbihvbnZhbHVlX2NiKXtcblx0XHRcdGNoYW5uZWwuc2V0T25NZXNzYWdlKG9udmFsdWVfY2IpO1xuXHRcdH1cblxuXHRcdGNoYW5uZWwud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhbm5lbC5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyW2luZGV4XSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC5mcmVxdWVuY3kgPSAzMztcblxuXHRcdGNoYW5uZWwuX3J1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRjaGFubmVsLnNlbmQoY2hhbm5lbC5fYnVmZmVyKTtcblx0XHRcdHNldFRpbWVvdXQoY2hhbm5lbC5fcnVuLCBjaGFubmVsLmZyZXF1ZW5jeSk7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC5fcnVuKCk7XG5cblx0XHRjYWxsYmFjayhjaGFubmVsKTtcblxuXHR9KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21ldGhlOyIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIFFFSShub2RlLCBjYWxsYmFjaywgc2FtcGxpbmcpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdFxuXHR0aGlzLnNhbXBsaW5nID0gc2FtcGxpbmcgfHwgMTA7IC8qIG1heCBudW0gb2YgcHRzIGRpc3BsYXllZCAqL1xuXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24ocmVzKXt9OyAvKiBjYWxsYmFjaywgdXN1YWxseSBhZnRlciBnZXRNb2RlbCAqL1xuXG5cdG5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwibXNnSW5pdFwiLFxuXHRcdFx0c2FtcGxpbmc6IDEsXG5cdFx0XHRyZXF1ZXN0ZWREYXRhOiBcImFsbFwiXG5cdFx0XHQvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhhdC5kYXRhTW9kZWw9IHt9O1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdHRoYXQuZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdFx0XG5cdFx0XHQvLy8gdGhhdC51cGRhdGVDaGFydCh0aGlzLmRhdGFNb2RlbCk7XG5cdFx0XHR0aGF0LmNhbGxiYWNrKHRoYXQuZGF0YU1vZGVsKTtcblxuXHRcdFx0bm9kZS5saXN0ZW4oe1xuXHRcdFx0XHRcdHNlcnZpY2U6IFwicWVpXCIsXG5cdFx0XHRcdFx0ZnVuYzogXCJTdWJzY3JpYmVRZWlcIlxuXHRcdFx0XHR9LCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHR0aGF0LmdldERhdGFNb2RlbEZyb21SZWN2KHJlcy5kYXRhKTtcblx0XHRcdFx0XHR0aGF0LmNhbGxiYWNrKHRoYXQuZGF0YU1vZGVsKTtcblx0XHRcdFx0XHR9KTtcblx0fSk7XG5cblx0Y29uc29sZS5sb2coXCJEaXlhU0RLIC0gUUVJOiBjcmVhdGVkXCIpO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuUUVJLnByb3RvdHlwZS5nZXRTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRyZXR1cm4gdGhpcy5zYW1wbGluZztcbn1cblFFSS5wcm90b3R5cGUuc2V0U2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0dGhpcy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfSAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5RRUkucHJvdG90eXBlLmdldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9dGhpcy5kYXRhTW9kZWw7XG5cdC8qXFxcblx0fCp8XG5cdHwqfCAgdXRpbGl0YWlyZXMgZGUgbWFuaXB1bGF0aW9ucyBkZSBjaGHDrm5lcyBiYXNlIDY0IC8gYmluYWlyZXMgLyBVVEYtOFxuXHR8Knxcblx0fCp8ICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL0TDqWNvZGVyX2VuY29kZXJfZW5fYmFzZTY0XG5cdHwqfFxuXHRcXCovXG5cdC8qKiBEZWNvZGVyIHVuIHRhYmxlYXUgZCdvY3RldHMgZGVwdWlzIHVuZSBjaGHDrm5lIGVuIGJhc2U2NCAqL1xuXHRiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRcdHJldHVybiBuQ2hyID4gNjQgJiYgbkNociA8IDkxID9cblx0XHRcdFx0bkNociAtIDY1XG5cdFx0XHQ6IG5DaHIgPiA5NiAmJiBuQ2hyIDwgMTIzID9cblx0XHRcdFx0bkNociAtIDcxXG5cdFx0XHQ6IG5DaHIgPiA0NyAmJiBuQ2hyIDwgNTggP1xuXHRcdFx0XHRuQ2hyICsgNFxuXHRcdFx0OiBuQ2hyID09PSA0MyA/XG5cdFx0XHRcdDYyXG5cdFx0XHQ6IG5DaHIgPT09IDQ3ID9cblx0XHRcdFx0NjNcblx0XHRcdDpcdDA7XG5cdH07XG5cdC8qKlxuXHQgKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG5cdCAqIEBwYXJhbSAge1N0cmluZ30gc0Jhc2U2NCAgICAgYmFzZTY0IGNvZGVkIHN0cmluZ1xuXHQgKiBAcGFyYW0gIHtpbnR9IG5CbG9ja3NTaXplIHNpemUgb2YgYmxvY2tzIG9mIGJ5dGVzIHRvIGJlIHJlYWQuIE91dHB1dCBieXRlQXJyYXkgbGVuZ3RoIHdpbGwgYmUgYSBtdWx0aXBsZSBvZiB0aGlzIHZhbHVlLlxuXHQgKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICB0YWIgb2YgZGVjb2RlZCBieXRlc1xuXHQgKi9cblx0YmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHRcdHZhclxuXHRcdHNCNjRFbmMgPSBzQmFzZTY0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCBcIlwiKSwgbkluTGVuID0gc0I2NEVuYy5sZW5ndGgsXG5cdFx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0XHRidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobk91dExlbiksIHRhQnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG5cdFx0Zm9yICh2YXIgbk1vZDMsIG5Nb2Q0LCBuVWludDI0ID0gMCwgbk91dElkeCA9IDAsIG5JbklkeCA9IDA7IG5JbklkeCA8IG5JbkxlbjsgbkluSWR4KyspIHtcblx0XHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdFx0blVpbnQyNCB8PSBiNjRUb1VpbnQ2KHNCNjRFbmMuY2hhckNvZGVBdChuSW5JZHgpKSA8PCAxOCAtIDYgKiBuTW9kNDtcblx0XHRcdGlmIChuTW9kNCA9PT0gMyB8fCBuSW5MZW4gLSBuSW5JZHggPT09IDEpIHtcblx0XHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdFx0dGFCeXRlc1tuT3V0SWR4XSA9IG5VaW50MjQgPj4+ICgxNiA+Pj4gbk1vZDMgJiAyNCkgJiAyNTU7XG5cdFx0XHRcdH1cblx0XHRcdFx0blVpbnQyNCA9IDA7XG5cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29uc29sZS5sb2coXCJ1OGludCA6IFwiK0pTT04uc3RyaW5naWZ5KHRhQnl0ZXMpKTtcblx0XHRyZXR1cm4gYnVmZmVyO1xuXHR9O1xuXHRcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdyY3ZkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdC8vIGlmKCFkYXRhLmhlYWRlci5zYW1wbGluZykgZGF0YS5oZWFkZXIuc2FtcGxpbmc9MTtcblx0XHRcblx0XHQvKiogY2FzZSAxIDogMSB2YWx1ZSByZWNlaXZlZCBhZGRlZCB0byBkYXRhTW9kZWwgKi9cblx0XHRpZihkYXRhLmhlYWRlci5zYW1wbGluZz09MSkge1xuXHRcdFx0aWYoZGF0YS5oZWFkZXIudGltZUVuZCkge1xuXHRcdFx0XHRpZighZGF0YU1vZGVsLnRpbWUpIGRhdGFNb2RlbC50aW1lPVtdO1xuXHRcdFx0XHRkYXRhTW9kZWwudGltZS5wdXNoKGRhdGEuaGVhZGVyLnRpbWVFbmQpO1xuXHRcdFx0XHRpZihkYXRhTW9kZWwudGltZS5sZW5ndGggPiB0aGlzLnNhbXBsaW5nKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsLnRpbWUgPSBkYXRhTW9kZWwudGltZS5zbGljZShkYXRhTW9kZWwudGltZS5sZW5ndGggLSB0aGlzLnNhbXBsaW5nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRcdGlmKG4gIT0gXCJoZWFkZXJcIiAmJiBuICE9IFwidGltZVwiKSB7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0XHRcdFx0aWYoIWRhdGFNb2RlbFtuXSkge1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGE9W107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGFGcmFtZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5mcmFtZT1kYXRhW25dLmZyYW1lO1xuXG5cdFx0XHRcdFx0aWYoZGF0YVtuXS5kYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdC8qIGRlY29kZSBkYXRhIHRvIEZsb2F0MzJBcnJheSovXG5cdFx0XHRcdFx0XHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YVtuXS5kYXRhLCA0KTtcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJ1ZikpO1xuXHRcdFx0XHRcdFx0dmFyIGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblxuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IGZBcnJheS5sZW5ndGgpIGNvbnNvbGUubG9nKFwiTWlzbWF0Y2ggb2Ygc2l6ZSBcIitkYXRhW25dLnNpemUrXCIgdnMgXCIrZkFycmF5Lmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMSkgY29uc29sZS5sb2coXCJFeHBlY3RlZCAxIHZhbHVlIHJlY2VpdmVkIDpcIitkYXRhW25dLnNpemUpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dLmRhdGEpIGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEucHVzaChmQXJyYXlbMF0pO1xuXHRcdFx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoID4gdGhpcy5zYW1wbGluZykge1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IGRhdGFNb2RlbFtuXS5kYXRhLnNsaWNlKGRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAwKSBjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggcmVjZWl2ZWQgZGF0YSAobm8gZGF0YSB2ZXJzdXMgc2l6ZT1cIitkYXRhW25dLnNpemUrXCIpXCIpO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ215ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGFNb2RlbFtuXS5kYXRhKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvKiogY2FzZSAyIDogaGlzdG9yeSBkYXRhIC0gbWFueSB2YWx1ZXMgcmVjZWl2ZWQgKi9cblx0XHRcdC8qKiBUT0RPICAqL1xuXHRcdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRcdGlmKG4gPT0gJ3RpbWUnKSB7XG5cdFx0XHRcdFx0LyogY2FzZSAxIDogdGltZSBkYXRhIHRyYW5zbWl0dGVkLCAxIHZhbHVlICovXG5cdFx0XHRcdFx0LyoqIFRPRE8gKiovXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihuICE9IFwiaGVhZGVyXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YUZyYW1lICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmZyYW1lPWRhdGFbbl0uZnJhbWU7XG5cblx0XHRcdFx0XHRpZihkYXRhW25dLmRhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0LyogZGVjb2RlIGRhdGEgdG8gRmxvYXQzMkFycmF5Ki9cblx0XHRcdFx0XHRcdHZhciBidWYgPSBiYXNlNjREZWNUb0FycihkYXRhW25dLmRhdGEsIDQpOyBcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJ1ZikpO1xuXHRcdFx0XHRcdFx0dmFyIGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblxuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IGZBcnJheS5sZW5ndGgpIGNvbnNvbGUubG9nKFwiTWlzbWF0Y2ggb2Ygc2l6ZSBcIitkYXRhW25dLnNpemUrXCIgdnMgXCIrZkFycmF5Lmxlbmd0aCk7XG5cdFx0XHRcdFx0XHQvLyAvKiBpbmNyZWFzZSBzaXplIG9mIGRhdGEgaWYgbmVjZXNzYXJ5ICovXG5cdFx0XHRcdFx0XHRpZihmQXJyYXkubGVuZ3RoPmRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHQvLyBkYXRhTW9kZWxbbl0uc2l6ZT1kYXRhW25dLnNpemU7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gbmV3IEFycmF5KGRhdGFNb2RlbFtuXS5zaXplKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8qIHVwZGF0ZSBuYiBvZiBzYW1wbGVzIHN0b3JlZCAqL1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBpIGluIGZBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YVtwYXJzZUludChpKV09ZkFycmF5W2ldOyAvKiBrZWVwIGZpcnN0IHZhbCAtIG5hbWUgb2YgY29sdW1uICovXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IDApIGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCByZWNlaXZlZCBkYXRhIChubyBkYXRhIHZlcnN1cyBzaXplPVwiK2RhdGFbbl0uc2l6ZStcIilcIik7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkYXRhTW9kZWxbbl0uZGF0YSA9IEFycmF5LmZyb20oZkFycmF5KTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZygnbXlkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YU1vZGVsW25dLmRhdGEpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRjb25zb2xlLmVycihcIk5vIERhdGEgdG8gcmVhZCBvciBoZWFkZXIgaXMgbWlzc2luZyAhXCIpO1xuXHR9XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbDtcbn1cblxuXG52YXIgZXhwID0ge1xuXHRcdFFFSTogUUVJXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwOyBcbiIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG4vKj09PT09PT09PT09PUNPTU1BTkRTPT09PT09PT09PT09PT0qL1xuXG5mdW5jdGlvbiBMaXN0Q2hhbm5lbHMob25MaXN0KXtcblx0TWVzc2FnZS5jYWxsKHRoaXMsICdydGMnLCAnTGlzdENoYW5uZWxzJyk7XG5cdFxuXHR0aGlzLm9uTGlzdCA9IG9uTGlzdDtcblxuXHR0aGlzLnBlcm1hbmVudCA9IHRydWU7XG59XG51dGlsLmluaGVyaXRzKExpc3RDaGFubmVscywgTWVzc2FnZSk7XG5cbkxpc3RDaGFubmVscy5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBMaXN0Q2hhbm5lbHMuc3VwZXJfLnByb3RvdHlwZS5leGVjLmNhbGwodGhpcyk7XG59XG5cbkxpc3RDaGFubmVscy5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYodGhpcy5vbkxpc3QpIHRoaXMub25MaXN0KGRhdGEuY2hhbm5lbHMpO1xufVxuXG5mdW5jdGlvbiBDb25uZWN0KGNoYW5uZWxzKXtcblx0TWVzc2FnZS5jYWxsKHRoaXMsJ3J0YycsICdDb25uZWN0Jyk7XG5cblx0dGhpcy5jaGFubmVscyA9IGNoYW5uZWxzO1xufVxudXRpbC5pbmhlcml0cyhDb25uZWN0LCBNZXNzYWdlKTtcblxuQ29ubmVjdC5wcm90b3R5cGUuZXhlYyA9ZnVuY3Rpb24oKXtcblx0dmFyIG1zZyA9IENvbm5lY3Quc3VwZXJfLnByb3RvdHlwZS5leGVjLmNhbGwodGhpcyk7XG5cdG1zZy5vYmogPSB0aGlzLmNoYW5uZWxzO1xuXHRyZXR1cm4gbXNnO1xufVxuXG5Db25uZWN0LnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe31cblxuZnVuY3Rpb24gT2ZmZXJMaXN0ZW5lcihvbm9mZmVyKXtcblx0TWVzc2FnZS5jYWxsKHRoaXMsICdydGMnLCAnUmVtb3RlT2ZmZXInKTtcblxuXHR0aGlzLm9uT2ZmZXIgPSBvbm9mZmVyO1xuXG5cdHRoaXMucGVybWFuZW50ID0gdHJ1ZTtcbn1cbnV0aWwuaW5oZXJpdHMoT2ZmZXJMaXN0ZW5lciwgTWVzc2FnZSk7XG5cbk9mZmVyTGlzdGVuZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbnVsbDtcbn1cblxuT2ZmZXJMaXN0ZW5lci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYodGhpcy5vbk9mZmVyKSB0aGlzLm9uT2ZmZXIoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIEFuc3dlcihwcm9tSUQsIHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3J0YycsICdBbnN3ZXInKTtcblxuXHR0aGlzLnNlc3Npb25fZGVzY3JpcHRpb24gPSBzZXNzaW9uX2Rlc2NyaXB0aW9uO1xuXHR0aGlzLnByb21JRCA9IHByb21JRDtcbn1cbnV0aWwuaW5oZXJpdHMoQW5zd2VyLCBNZXNzYWdlKTtcblxuQW5zd2VyLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRyZXR1cm4gQW5zd2VyLnN1cGVyXy5wcm90b3R5cGUuZXhlYy5jYWxsKHRoaXMsIHtcblx0XHRzZHA6IHRoYXQuc2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAsXG5cdFx0dHlwZTogdGhhdC5zZXNzaW9uX2Rlc2NyaXB0aW9uLnR5cGUsXG5cdFx0cHJvbUlEOiB0aGF0LnByb21JRFxuXHR9KTtcbn1cblxuQW5zd2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXG59XG5cbmZ1bmN0aW9uIElDRUNhbmRpZGF0ZShwcm9tSUQsIGNhbmRpZGF0ZSl7XG5cdE1lc3NhZ2UuY2FsbCh0aGlzLCAncnRjJywgJ0lDRUNhbmRpZGF0ZScpO1xuXG5cdHRoaXMuY2FuZGlkYXRlID0gY2FuZGlkYXRlO1xuXHR0aGlzLnByb21JRCA9IHByb21JRDtcbn1cbnV0aWwuaW5oZXJpdHMoSUNFQ2FuZGlkYXRlLCBNZXNzYWdlKTtcblxuSUNFQ2FuZGlkYXRlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRyZXR1cm4gSUNFQ2FuZGlkYXRlLnN1cGVyXy5wcm90b3R5cGUuZXhlYy5jYWxsKHRoaXMse1xuXHRcdGNhbmRpZGF0ZTogdGhhdC5jYW5kaWRhdGUsXG5cdFx0cHJvbUlEOiB0aGF0LnByb21JRFxuXHR9KTtcbn1cblxuSUNFQ2FuZGlkYXRlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXG59XG5cbmZ1bmN0aW9uIElDRUNhbmRpZGF0ZUxpc3RlbmVyKG9uaWNlY2FuZGlkYXRlKXtcblx0TWVzc2FnZS5jYWxsKHRoaXMsICdydGMnLCAnUmVtb3RlSUNFQ2FuZGlkYXRlJyk7XG5cblx0dGhpcy5vbklDRUNhbmRpZGF0ZSA9IG9uaWNlY2FuZGlkYXRlO1xuXG5cdHRoaXMucGVybWFuZW50ID0gdHJ1ZTtcbn1cbnV0aWwuaW5oZXJpdHMoSUNFQ2FuZGlkYXRlTGlzdGVuZXIsIE1lc3NhZ2UpO1xuXG5JQ0VDYW5kaWRhdGVMaXN0ZW5lci5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBudWxsO1xufVxuXG5JQ0VDYW5kaWRhdGVMaXN0ZW5lci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYodGhpcy5vbklDRUNhbmRpZGF0ZSkgdGhpcy5vbklDRUNhbmRpZGF0ZShkYXRhKTtcbn1cblxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xudmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG52YXIgUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy53ZWJraXRSVENJY2VDYW5kaWRhdGU7XG52YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG5cbmZ1bmN0aW9uIENoYW5uZWwocGFyYW1zKXtcblx0dGhpcy5uYW1lID0gcGFyYW1zO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbm9wZW4gPSB1bmRlZmluZWQ7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHRoaXMuY2hhbm5lbCA9IGRhdGFjaGFubmVsO1xuXG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYodGhhdC5vbm9wZW4pIHRoYXQub25vcGVuKHRoYXQpO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5zZXRPbk1lc3NhZ2UgPSBmdW5jdGlvbihvbm1lc3NhZ2Upe1xuXHR0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gb25tZXNzYWdlO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24obXNnKXtcblx0aWYodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJykgdGhpcy5jaGFubmVsLnNlbmQobXNnKTtcblx0ZWxzZSBjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSB3YXJuaW5nIDogd2VicnRjIGRhdGFjaGFubmVsIHN0YXRlID0gJyt0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIFJUQyhub2RlKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0dGhpcy5hdmFpbGFibGVDaGFubmVscyA9IG5ldyBBcnJheSgpO1xuXHR0aGlzLnVzZWRDaGFubmVscyA9IG5ldyBBcnJheSgpO1xuXG5cdHRoaXMucGVlcnMgPSBuZXcgQXJyYXkoKTtcblx0XG5cdHRoaXMuaWQgPSAtMTtcblxuXHRub2RlLmxpc3Rlbih7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ0xpc3RDaGFubmVscydcblx0fSxcblx0ZnVuY3Rpb24oZGF0YSl7IFxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkYXRhLmNoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHRoYXQuYXZhaWxhYmxlQ2hhbm5lbHMucHVzaChuZXcgQ2hhbm5lbChkYXRhLmNoYW5uZWxzW2ldKSk7XG5cdFx0fVxuXHR9KTtcblxufVxuXG5SVEMucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKG5hbWVfcmVnZXgsIG9ub3Blbl9jYWxsYmFjayl7XG5cblx0Zm9yKHZhciBpPTA7IGkgPCB0aGlzLmF2YWlsYWJsZUNoYW5uZWxzLmxlbmd0aDtpKyspe1xuXHRcdHZhciBuID0gdGhpcy5hdmFpbGFibGVDaGFubmVsc1tpXTtcblx0XHRpZihuLm5hbWUgJiYgbi5uYW1lLm1hdGNoKG5hbWVfcmVnZXgpKXtcblx0XHRcdG4ub25vcGVuID0gb25vcGVuX2NhbGxiYWNrO1xuXHRcdFx0dGhpcy51c2VkQ2hhbm5lbHNbbi5uYW1lXSA9IG47XG5cdFx0fVxuXHR9XG59XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaT0wO2k8dGhpcy5wZWVycy5sZW5ndGg7aSsrKXtcblx0XHR0aGlzLnBlZXJzW2ldLmNsb3NlKCk7XG5cdH1cblx0dGhpcy5wZWVycyA9IG5ldyBBcnJheSgpO1xufVxuXG5SVEMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGNoYW5uZWxzID0gbmV3IEFycmF5KCk7XG5cdGZvcih2YXIgbiBpbiB0aGlzLnVzZWRDaGFubmVscyl7XG5cdFx0Y2hhbm5lbHMucHVzaChuKTtcblx0fVxuXG5cblx0dGhpcy5ub2RlLmxpc3Rlbih7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ0Nvbm5lY3QnLFxuXHRcdG9iajogY2hhbm5lbHNcblx0fSxcblx0ZnVuY3Rpb24oZGF0YSl7XG5cdFx0dGhhdC5faGFuZGxlTmVnb2NpYXRpb25NZXNzYWdlKGRhdGEpO1xuXHR9KTtcbn1cblxuXG5SVEMucHJvdG90eXBlLl9oYW5kbGVOZWdvY2lhdGlvbk1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xuXG5cdGlmKG1zZy5ldmVudFR5cGUgPT09ICdSZW1vdGVPZmZlcicpe1xuXHRcdHRoaXMucGVlcnNbbXNnLnByb21JRF0gPSB0aGlzLl9jcmVhdGVQZWVyKG1zZyk7XG5cdH1lbHNlIGlmKG1zZy5ldmVudFR5cGUgPT09ICdSZW1vdGVJQ0VDYW5kaWRhdGUnKXtcblx0XHR0aGlzLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUodGhpcy5wZWVyc1ttc2cucHJvbUlEXSwgbXNnKTtcblx0fVxufVxuXG52YXIgc2VydmVycyA9IHtcImljZVNlcnZlcnNcIjogW3tcInVybFwiOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dfTtcblJUQy5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBwZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHNlcnZlcnMsIHttYW5kYXRvcnk6IFt7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWV9LCB7RW5hYmxlRHRsc1NydHA6IHRydWV9XX0pO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdGNvbnNvbGUubG9nKFwiY3JlYXRlIGFuc3dlclwiKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0Lm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS5sb2coXCJjYW5ub3QgY3JlYXRlIGFuc3dlclwiKTtcblx0fSwgXG5cdHsgJ21hbmRhdG9yeSc6IHsgJ09mZmVyVG9SZWNlaXZlQXVkaW8nOiB0cnVlLCAnT2ZmZXJUb1JlY2VpdmVWaWRlbyc6IHRydWUgfSB9KTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHRcblx0XHR0aGF0Lm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0lDRUNhbmRpZGF0ZScsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0Y2FuZGlkYXRlOiBldnQuY2FuZGlkYXRlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cGVlci5vbmRhdGFjaGFubmVsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0Ll9vbkRhdGFDaGFubmVsKGV2dC5jaGFubmVsKTtcblx0fTtcblxuXHRwZWVyLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZXZ0KXtcblx0XHRjb25zb2xlLmxvZyhcIk9OIEFERCBTVFJFQU1cIik7XG5cdFx0dmFyIHJlbW90ZVZpZXcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI215dmlkXCIpO1xuXHRcdHJlbW90ZVZpZXcuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChldnQuc3RyZWFtKTtcblx0fTtcblxuXHRwZWVyLnByb21JRCA9IGRhdGEucHJvbUlEO1xuXG5cdHJldHVybiBwZWVyO1xufVxuXG5SVEMucHJvdG90eXBlLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUgPSBmdW5jdGlvbihwZWVyLCBkYXRhKXtcblx0dHJ5e1xuXHRcdHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcblx0XHRwZWVyLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUsZnVuY3Rpb24oKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiY2FuZGlkYXRlIGFkZGVkIChcIitwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZStcIilcIik7XG5cdFx0fSxmdW5jdGlvbihlKXtcblx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdH0pO1xuXHR9Y2F0Y2goZSkge2NvbnNvbGUubG9nKGUpO31cbn1cblxuUlRDLnByb3RvdHlwZS5fb25EYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0Y29uc29sZS5sb2coXCJDaGFubmVsIFwiK2RhdGFjaGFubmVsLmxhYmVsK1wiIGNyZWF0ZWQgIVwiKTtcblxuXHR2YXIgY2hhbm5lbCA9IHRoaXMudXNlZENoYW5uZWxzW2RhdGFjaGFubmVsLmxhYmVsXTtcblx0aWYoIWNoYW5uZWwpe1xuXHRcdGRhdGFjaGFubmVsLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdGNoYW5uZWwuc2V0Q2hhbm5lbChkYXRhY2hhbm5lbCk7XG59XG5cblxudmFyIGV4cCA9IHtcblx0XHRMaXN0Q2hhbm5lbHM6IExpc3RDaGFubmVscyxcblx0XHRSVEM6IFJUQ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuZnVuY3Rpb24gVGltZXIocGVyaW9kLCBvbnRpbWUpe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3RpbWVyJyk7XG5cdFxuXHR0aGlzLnBlcmlvZCA9IHBlcmlvZDtcblx0dGhpcy5vbnRpbWUgPSBvbnRpbWU7XG5cdFxuXHRpZihwZXJpb2Qpe1xuXHRcdHRoaXMubG9vcCA9IHRydWU7XG5cdFx0dGhpcy5wZXJtYW5lbnQgPSB0cnVlO1xuXHR9XG59XG51dGlsLmluaGVyaXRzKFRpbWVyLCBNZXNzYWdlKTtcblxuVGltZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gVGltZXIuc3VwZXJfLnByb3RvdHlwZS5leGVjLmNhbGwodGhpcywge1xuXHRcdGxvb3A6IHRoaXMubG9vcCxcblx0XHRwZXJpb2Q6IHRoaXMucGVyaW9kXG5cdH0pO1xufVxuXG5UaW1lci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYoISBkYXRhKSByZXR1cm4gO1xuXHRpZihkYXRhLmN1cnJlbnRUaW1lKXtcblx0XHR0aGlzLm9udGltZShkYXRhLmN1cnJlbnRUaW1lKTtcblx0fVxufVxuXG5cblxudmFyIHRpbWVyID0ge1xuXHRcdFRpbWVyOiBUaW1lclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVyO1xuIiwiLyogZGl5YS1zZGtcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG5mdW5jdGlvbiBMaXN0U2VydmljZXMoY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3dhdGNoZG9nJywgJ0xpc3RTZXJ2aWNlcycpO1xuXG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoTGlzdFNlcnZpY2VzLCBNZXNzYWdlKTtcblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIExpc3RTZXJ2aWNlcy5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzKTtcbn1cblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnNlcnZpY2VzICYmIHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2soZGF0YS5zZXJ2aWNlcyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdExpc3RTZXJ2aWNlczogTGlzdFNlcnZpY2VzXG59XG5cbiJdfQ==
