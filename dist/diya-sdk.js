!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
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

},{"./support/isBuffer":3,"_process":2,"inherits":1}],5:[function(require,module,exports){
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
var rtc = require('./services/rtc/rtc');
var Promethe = require('./services/promethe/promethe');
var discover = require('./services/discover/discover');
var qei = require('./services/qei/qei');
var update = require('./services/update/update');

var WebSocket = window.WebSocket || window.MozWebSocket;



 

function Diya(addr){
	var that = this;
	var socket;	

	var DEBUG = false;

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
				//If the subscription was closed, call listener with null data, then remove the handler
				registeredListeners[msg.subId](null);
				delete registeredListeners[msg.subId];
			}


		}else{
			//No pending request for this subId, ignoring event
			console.log('msg.subId doesn\'t match any registered listeners, Ignoring msg ! ');
			console.log(msg);
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

	this.get = function(params, callback, timeout){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.reqId = consumeNextReqId();
		pendingRequests[msg.reqId] = callback;

		//Timeout after which the request will be discarded
		if(timeout && timeout > 0){
			setTimeout(function(){
				if(pendingRequests[msg.reqId]){
					delete pendingRequests[msg.reqId];
				}
			}, timeout);
		}

		send(msg);
	}

	this.listen = function(params, callback, timeout){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.subId = consumeNextSubscriptionId();
		registeredListeners[msg.subId] = callback;

		//Timeout after which the subscription is automatically invalidated
		if(timeout && timeout > 0){
			setTimeout(function(){
				that.stopListening(msg.subId);	
			}, timeout);
		}

		send(msg);

		return msg.subId;
	}

	this.closeCallback = function(cb){
		close_cb = cb;
	}

	this.stopListening = function(subId){

		if(!registeredListeners[subId]) return ;

		msg = {
			func: 'Unsubscribe',
			data: {
				subId: subId
			}
		}

		send(msg);

		delete registeredListeners[subId];
	}

	this.connected = function(){
		return ! (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED);
	}

	this.disconnect = function(){
		socket.close();
		closeAll();
	}
	
	this.debug = function(value){
		DEBUG = value;
	}
}


function DiyaClient(addr, user, password){

	var that = this;

	function createNode(){
		var node = new diya.Diya(addr);
		//nodes.push(node);

		return node;
	}

	this.setAddress = function(address){
		addr = address;
	}

	this.createSession = function(onconnected, onfailure){
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
		rtc: rtc,
		Promethe: Promethe,
		discover: discover,
		qei: qei,
		update: update
}

module.exports = diya;

},{"./services/discover/discover":6,"./services/message":7,"./services/promethe/promethe":8,"./services/qei/qei":9,"./services/rtc/rtc":10,"./services/update/update":11}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var RTC = require('../rtc/rtc');

function Promethe(session){
	var that = this;

	this.rtc = new RTC.RTC(session);
	
	this.rtc.onclose = function(){
		if(typeof that.onclose === 'function') that.onclose();
	}
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
		};

		channel.write = function(index, value){
			if(index < 0 || index > channel.size || isNaN(value)) return false;
			channel._buffer[index] = value;
			return true;
		};
		
		channel.writeAll = function(values){
			if(!Array.isArray(values) || values.length !== channel.size)
				return false;
			
			for (var i = 0; i<values.length; i++){
				if(isNaN(values[i])) return false;
				channel._buffer[i] = values[i];
			}
			return true;
		};

		channel.frequency = 33;

		channel._run = function(){
			if(channel.send(channel._buffer))
				setTimeout(channel._run, channel.frequency);
		};

		channel._run();

		callback(channel);

	});
}


module.exports = Promethe;
},{"../rtc/rtc":10}],9:[function(require,module,exports){
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

/**
 *  callback : function called after model updated
 * */
function QEI(node, callback, sampling){
	var that = this;
	this.node = node;
	
	this.sampling = sampling || 10; /* max num of pts stored */
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
			that._getDataModelFromRecv(data);
			// console.log(JSON.stringify(that.dataModel));
			
			/// that.updateChart(this.dataModel);
			that._updateLevels(that.dataModel);
			that.callback(that.dataModel);

			node.listen({
					service: "qei",
					func: "SubscribeQei"
				}, function(res) {
					that._getDataModelFromRecv(res.data);
					that._updateLevels(that.dataModel);
					that.callback(that.dataModel);
					});
	});

	console.log("DiyaSDK - QEI: created");
	return this;
}
/**
 * Get dataModel : 
 * {
 * 	time: [FLOAT, ...],
 * 	"senseurXX": {
 * 			data:[FLOAT, ...],
 * 			qualityIndex:[FLOAT, ...],
 * 			range: [FLOAT, FLOAT],
 * 			unit: FLOAT
 * 		},
 *   ... ("senseursYY")
 * }
 */
QEI.prototype.getDataModel = function(){
	return this.dataModel;
}
QEI.prototype.getDataRange = function(){
	return this.dataModel.range;
}
QEI.prototype.updateQualityIndex = function(){
	var that=this;
	var dm = this.dataModel;
	
	for(var d in dm) {
		if(d=='time' || !dm[d].data) continue;
	
		if(!dm[d].qualityIndex || dm[d].data.length != dm[d].qualityIndex.length)
			dm[d].qualityIndex = new Array(dm[d].data.length);
		
		dm[d].data.forEach(function(v,i) {
				dm[d].qualityIndex[i] = checkQuality(v,dm[d].qualityConfig);
			});
	}
}

QEI.prototype.getDataconfortRange = function(){
	return this.dataModel.confortRange;
}
QEI.prototype.getSampling = function(numSamples){
	return this.sampling;
}
QEI.prototype.setSampling = function(numSamples){
	this.sampling = numSamples;
}



QEI.prototype._updateConfinementLevel = function(model){
	var co2 = model['CO2'].data[model['CO2'].data.length - 1];
	var voct = model['VOCt'].data[model['VOCt'].data.length - 1];
	var confinement = Math.max(co2, voct);

	if(confinement < 800){
		return 3;
	}
	if(confinement < 1600){
		return 2;
	}
	if(confinement < 2400){
		return 1;
	}
	if(confinement < 3000){
		return 0;
	}
}

QEI.prototype._updateAirQualityLevel = function(confinement, model){
	var fineDustQualityIndex = model['Fine Dust'].qualityIndex[model['Fine Dust'].qualityIndex.length-1];
	var ozoneQualityIndex = model['Ozone'].qualityIndex[model['Ozone'].qualityIndex.length-1];

	var qualityIndex = fineDustQualityIndex + ozoneQualityIndex;
	if(qualityIndex < 2) return confinement - 1;
	else return confinement;
}

QEI.prototype._updateEnvQualityLevel = function(airQuality, model){
	var humidityQualityIndex = model['Humidity'].qualityIndex[model['Humidity'].qualityIndex.length-1];
	var temperatureQualityIndex = model['Temperature'].qualityIndex[model['Temperature'].qualityIndex.length-1];

	var qualityIndex = humidityQualityIndex + temperatureQualityIndex;
	if(qualityIndex < 2) return airQuality - 1;
	else return airQuality;	
}

QEI.prototype._updateLevels = function(model){
	this.confinement = this._updateConfinementLevel(model);
	this.airQuality = this._updateAirQualityLevel(this.confinement, model);
	this.envQuality = this._updateEnvQualityLevel(this.airQuality, model);
}

QEI.prototype.getConfinementLevel = function(){
	return this.confinement;
}

QEI.prototype.getAirQualityLevel = function(){
	return this.airQuality;
}

QEI.prototype.getEnvQualityLevel = function(){
	return this.envQuality;
}


var checkQuality = function(data, qualityConfig){
	var quality;
	if(data && qualityConfig) {
		if(data>qualityConfig.confortRange[1] || data<qualityConfig.confortRange[0])
			quality=0;
		else
			quality=1.0
		return quality;
	}
	return 1.0;
}

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
 */
QEI.prototype._getDataModelFromRecv = function(data){
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
		//~ console.log('rcvdata '+JSON.stringify(data));
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

					/* update data range */
					dataModel[n].range=data[n].range;
					/* update data label */
					dataModel[n].label=data[n].label;
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data confortRange */
					dataModel[n].qualityConfig={confortRange: data[n].confortRange};

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
					this.updateQualityIndex();
					//~ console.log('mydata '+JSON.stringify(dataModel[n].data));
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

					/* update data range */
					dataModel[n].range=data[n].range;
					/* update data label */
					dataModel[n].label=data[n].label;
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data confortRange */
					dataModel[n].qualityConfig={confortRange: data[n].confortRange};

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
		console.log("No Data to read or header is missing !");
	}
	return this.dataModel;
}


var exp = {
		QEI: QEI
}

module.exports = exp; 

},{"../message":7,"util":4}],10:[function(require,module,exports){
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

/*==========================================*/
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function Channel(name, open_cb){
	this.name = name;

	this.channel = undefined;
	this.onopen = open_cb;
	this.closed = false;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.close = function(){
	this.closed = true;
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.closed) return false;
	else if(this.channel.readyState === 'open'){
		try{
			this.channel.send(msg);
		}catch(e){
			console.log('[rtc.channel.write] exception occured while sending data');
		}
		return true;
	}
	else{
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
}


////////////////////////////////////////////////

function Peer(rtc, id, channels){
	this.id = id;
	this.channels = channels;
	this.rtc = rtc;
	this.peer = null;

	this.connected = false;
	this.closed = false;

	this._connect();
}


Peer.prototype._connect = function(){
	var that = this;

	this.sub = this.rtc.node.listen({
		service: 'rtc',
		func: 'Connect',
		obj: this.channels,
		data: {
			promID: this.id
		}
	},
	function(data){
		that._handleNegociationMessage(data);
	});

	setTimeout(function(){
		if(!that.connected && !that.closed){
			that.rtc.reconnect();
		}else{
		}
	}, 10000);
}

Peer.prototype._handleNegociationMessage = function(msg){

	if(msg.eventType === 'RemoteOffer'){
		this._createPeer(msg);
	}else if(msg.eventType === 'RemoteICECandidate'){
		this._addRemoteICECandidate(msg);
	}
};

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

Peer.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});
	this.peer = peer;

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.rtc.node.get({
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


	peer.oniceconnectionstatechange = function(){
		console.log(peer.iceConnectionState);
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;  
			that.rtc.node.stopListening(this.sub);
		}else if(peer.iceConnectionState === 'disconnected'){
			if(!that.closed) that.rtc.reconnect();
		}
	}

	peer.onicecandidate = function(evt){
		that.rtc.node.get({
			service: 'rtc',
			func: 'ICECandidate',
			data:{
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(evt.channel);
	};
}

Peer.prototype._addRemoteICECandidate = function(data){
	var that = this;
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate,function(){
			console.log("candidate added ("+that.peer.iceConnectionState+")");
		},function(e){
			console.log(e);
		});
	}catch(e) {console.log(e);}
}

Peer.prototype.close = function(){
	this.rtc.node.stopListening(this.sub);
	if(this.peer) try{
		this.peer.close();
	}catch(e){}
	this.connected = false;
	this.closed = true;
}



/////////////////////////////////


function RTC(node){
	var that = this;
	
	this.node = node;
	this.usedChannels = [];

	this.requestedChannels = [];

	this.peers = [];
}

RTC.prototype.use = function(name_regex, onopen_callback){
	this.requestedChannels.push({regex: name_regex, cb: onopen_callback});
}

RTC.prototype.reconnect = function(){
	var that = this;
		
	that.disconnect();
	that.connect();
	console.log("reconnecting...");
}

RTC.prototype.disconnect = function(){

	for(var promID in this.peers){
		this._closePeer(promID);
	}

	this.node.stopListening(this.sub);

	if(typeof this.onclose === 'function') this.onclose();
}

RTC.prototype.connect = function(){
	var that = this;
	var foundChannels = false;

	this.sub = this.node.listen({
		service: 'rtc',
		func: 'ListenPeers'
	},
	function(data){
			
		if(data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that.peers[data.promID]){
					var channels = that._matchChannels(data.channels);
					if(channels.length > 0){
						that.peers[data.promID] = new Peer(that, data.promID, channels);
					}
				}
			}
			else if(data.eventType === 'PeerClosed'){
				if(that.peers[data.promID]){
					that._closePeer(data.promID);
					if(typeof that.onclose === 'function') that.onclose();
				}
			}
		}

	});
}


RTC.prototype._closePeer = function(promID){

	if(this.peers[promID]){
		var p = this.peers[promID];
		p.close();

		for(var i=0; i < p.channels.length; i++){
			delete this.usedChannels[p.channels[i]];
		}

		delete this.peers[promID];
	}
}

RTC.prototype._matchChannels = function(receivedChannels){
	var that = this;

	//Contains all channels that will be passed to Connect as objects
	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		
		for(var j = 0; j < that.requestedChannels.length; j++){
			var req = that.requestedChannels[j];
			
			if(name && name.match(req.regex) && !that.usedChannels[name]){
				that.usedChannels[name] = new Channel(name, req.cb);
				channels.push(name); //prepare the connect object list
			}
		}
	}

	return channels;
};

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
		RTC: RTC
}

module.exports = exp; 

},{"../message":7,"util":4}],11:[function(require,module,exports){
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

function Update(node){	
	var that = this;
	this.node = node;
	return this;
}

Update.prototype.statusLockApt = function(callback){
	
	/*this.node.get({
			service: 'update',
			func: 'LockStatus'
		},function(data){
			if(data.lockStatus) 
				callback(null,data.lockStatus); 
	});*/
	
	this.node.listen({
			service: 'update',
			func: 'SubscribeLockStatus'
		}, 
		function(res){
			callback(null,res.lockStatus);
			console.log(res.lockStatus);
		});

}

Update.prototype.listPackages = function(callback){

	this.node.get({
		service: 'update',
		func: 'ListPackages'
	}, function(data){
		if(data.packages) 
			callback(null,data.packages); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}
	
Update.prototype.updateAll = function(callback){

	this.node.get({
		service: 'update',
		func: 'UpdateAll'
	}, function(data){
		if(data.packages) 
			callback(null,data.packages); 
		if(data.error)
			callback(data.error,null);
	}); 
}
	
Update.prototype.installPackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^-|[^\s]\s+[^\s]|-$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.node.get({
				service: 'update',
				func: 'InstallPackage',
				data:{
					package: pkg,
				}
			}, function(data){
				if(data.packages) 
					callback(null,data.packages); 
				if(data.error)
					callback(data.error,null);
					
				
			});
		}
	}
	
}

Update.prototype.removePackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^[+ -]|[^\s]\s+[^\s]|[+ -]$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.node.get({
				service: 'update',
				func: 'RemovePackage',
				data:{
					package: pkg,
				}
			}, function(data){
				if(data.packages) 
					callback(null,data.packages); 
				if(data.error)
					callback(data.error,null);
					
				
			});
		}
	}
	
}
		
		
var exp = {
		Update: Update
}

module.exports = exp; 

},{"../message":7,"util":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sZWlscmVuZy9zdm5fZGlyL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvbGVpbHJlbmcvc3ZuX2Rpci9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvbGVpbHJlbmcvc3ZuX2Rpci9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9sZWlscmVuZy9zdm5fZGlyL2RpeWEtc2RrL3NyYy9kaXlhLXNkay5qcyIsIi9ob21lL2xlaWxyZW5nL3N2bl9kaXIvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyLmpzIiwiL2hvbWUvbGVpbHJlbmcvc3ZuX2Rpci9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL2xlaWxyZW5nL3N2bl9kaXIvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3Byb21ldGhlL3Byb21ldGhlLmpzIiwiL2hvbWUvbGVpbHJlbmcvc3ZuX2Rpci9kaXlhLXNkay9zcmMvc2VydmljZXMvcWVpL3FlaS5qcyIsIi9ob21lL2xlaWxyZW5nL3N2bl9kaXIvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3J0Yy9ydGMuanMiLCIvaG9tZS9sZWlscmVuZy9zdm5fZGlyL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy91cGRhdGUvdXBkYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qIERpeWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cbnZhciBtZXNzYWdlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9tZXNzYWdlJyk7XG5cbi8vU2VydmljZXNcbnZhciBydGMgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3J0Yy9ydGMnKTtcbnZhciBQcm9tZXRoZSA9IHJlcXVpcmUoJy4vc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUnKTtcbnZhciBkaXNjb3ZlciA9IHJlcXVpcmUoJy4vc2VydmljZXMvZGlzY292ZXIvZGlzY292ZXInKTtcbnZhciBxZWkgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3FlaS9xZWknKTtcbnZhciB1cGRhdGUgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3VwZGF0ZS91cGRhdGUnKTtcblxudmFyIFdlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldDtcblxuXG5cbiBcblxuZnVuY3Rpb24gRGl5YShhZGRyKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgc29ja2V0O1x0XG5cblx0dmFyIERFQlVHID0gZmFsc2U7XG5cblx0dmFyIGNsb3NlX2NiID0gbnVsbDtcblxuXHR2YXIgcGVuZGluZ1JlcXVlc3RzID0gW107XG5cdHZhciByZWdpc3RlcmVkTGlzdGVuZXJzID0gW107XG5cblx0dmFyIG5leHRSZXFJZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFJlcUlkKCl7XG5cdFx0bmV4dFJlcUlkKys7XG5cdFx0cmV0dXJuIG5leHRSZXFJZDtcblx0fVxuXG5cdHZhciBuZXh0U3Vic2NyaXB0aW9uSWQgPSAtMTtcblx0ZnVuY3Rpb24gY29uc3VtZU5leHRTdWJzY3JpcHRpb25JZCgpe1xuXHRcdG5leHRTdWJzY3JpcHRpb25JZCsrO1xuXHRcdHJldHVybiBuZXh0U3Vic2NyaXB0aW9uSWQ7XG5cdH1cblx0XG5cdGZ1bmN0aW9uIGRpc3BhdGNoKG1zZyl7XG5cblx0XHRpZihtc2cucmVxSWQgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRkaXNwYXRjaFJlcXVlc3QobXNnKTtcblx0XHR9ZWxzZSBpZihtc2cuc3ViSWQgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRkaXNwYXRjaEV2ZW50KG1zZyk7XG5cdFx0fVxuXHRcdC8vSWYgdGhlIG1zZyBkb2Vzbid0IGhhdmUgYSByZXFJZCwgaXQgY2Fubm90IGJlIG1hdGNoZWQgdG8gYSBwZW5kaW5nIHJlcXVlc3Rcblx0XHRlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtaXNzaW5nIHJlcUlkIG9yIHN1YklkLiBJZ25vcmluZyBtc2cgOiAnKTtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdFxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KG1zZyl7XG5cdFx0Ly9JZiBtc2cucmVxSWQgY29ycmVzcG9uZHMgdG8gYSBwZW5kaW5nIHJlcXVlc3QsIGV4ZWN1dGUgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG5cdFx0aWYodHlwZW9mIHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0obXNnLmRhdGEpO1xuXHRcdFx0ZGVsZXRlIHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdO1xuXHRcdH1lbHNle1xuXHRcdFx0Ly9ObyBwZW5kaW5nIHJlcXVlc3QgZm9yIHRoaXMgcmVxSWQsIGlnbm9yaW5nIHJlc3BvbnNlXG5cdFx0XHRjb25zb2xlLmxvZygnbXNnLnJlcUlkIGRvZXNuXFwndCBtYXRjaCBhbnkgcGVuZGluZyByZXF1ZXN0LCBJZ25vcmluZyBtc2cgISAnK21zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobXNnKXtcblx0XHQvL0lmIG1zZy5zdWJJZCBjb3JyZXNwb25kcyB0byBhIHJlZ2lzdGVyZWQgbGlzdGVuZXIsIGV4ZWN1dGUgdGhlIGV2ZW50IGNhbGxiYWNrXG5cdFx0aWYodHlwZW9mIHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXSA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXG5cdFx0XHQvL2V4ZWN1dGUgdGhlIGV2ZW50IGNhbGxiYWNrLCBwYXNzIHRoZSBtZXNzYWdlIGRhdGEgYXMgYXJndW1lbnRcblx0XHRcdGlmKCFtc2cucmVzdWx0IHx8IG1zZy5yZXN1bHQgIT0gJ2Nsb3NlZCcpe1xuXHRcdFx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0obXNnLmRhdGEpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdC8vSWYgdGhlIHN1YnNjcmlwdGlvbiB3YXMgY2xvc2VkLCBjYWxsIGxpc3RlbmVyIHdpdGggbnVsbCBkYXRhLCB0aGVuIHJlbW92ZSB0aGUgaGFuZGxlclxuXHRcdFx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0obnVsbCk7XG5cdFx0XHRcdGRlbGV0ZSByZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF07XG5cdFx0XHR9XG5cblxuXHRcdH1lbHNle1xuXHRcdFx0Ly9ObyBwZW5kaW5nIHJlcXVlc3QgZm9yIHRoaXMgc3ViSWQsIGlnbm9yaW5nIGV2ZW50XG5cdFx0XHRjb25zb2xlLmxvZygnbXNnLnN1YklkIGRvZXNuXFwndCBtYXRjaCBhbnkgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMsIElnbm9yaW5nIG1zZyAhICcpO1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cdFxuXHRcblx0ZnVuY3Rpb24gc2VuZChtc2cpe1xuXHRcdGlmKHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORyB8fCBzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImRpeWEtU0RLIDogY2Fubm90IHNlbmQgbWVzc2FnZSAtPiBzb2NrZXQgY2xvc2VkXCIpO1xuXHRcdH1cblx0XHR0cnl7XG5cdFx0XHRkYXRhID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcblx0XHRcdHNvY2tldC5zZW5kKGRhdGEpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKCdtYWxmb3JtZWQgSlNPTiwgaWdub3JpbmcgbXNnLi4uJyk7XG5cdFx0fVxuXHR9XHRcblx0XG5cdGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKXtcblx0XHR2YXIgbXNnO1xuXG5cdFx0dHJ5e1xuXHRcdFx0bXNnID0gSlNPTi5wYXJzZShpbmNvbWluZ01lc3NhZ2UuZGF0YSk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJtYWxmb3JtZWQgSlNPTlwiKTtcblx0XHRcdCBcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHRcdFxuXHRcdGRpc3BhdGNoKG1zZyk7XG5cblx0fTtcblx0XG5cdGZ1bmN0aW9uIGNsb3NlQWxsKCl7XG5cdFx0d2hpbGUocGVuZGluZ1JlcXVlc3RzLmxlbmd0aCl7XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMucG9wKCk7XG5cdFx0fVxuXHRcdHdoaWxlKHJlZ2lzdGVyZWRMaXN0ZW5lcnMubGVuZ3RoKXtcblx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnMucG9wKCk7XG5cdFx0fVxuXHRcdGlmKHR5cGVvZiBjbG9zZV9jYiA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjbG9zZV9jYigpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UocGFyYW1zKXtcblx0XHRpZighcGFyYW1zLnNlcnZpY2UpIHJldHVybiBudWxsO1xuXHRcdGVsc2UgcmV0dXJuIHtcblx0XHRcdHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuXHRcdFx0ZnVuYzogcGFyYW1zLmZ1bmMgPyBwYXJhbXMuZnVuYyA6IHVuZGVmaW5lZCxcblx0XHRcdG9iajogcGFyYW1zLm9iaiA/IHBhcmFtcy5vYmogOiB1bmRlZmluZWQsXG5cdFx0XHRkYXRhOiBwYXJhbXMuZGF0YSA/IHBhcmFtcy5kYXRhIDogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vUHVibGljIEFQSS8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcblx0dGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oY2FsbGJhY2ssIGFyZ3Mpe1xuXHRcdHRyeXtcblx0XHRcdHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYWRkcik7XG5cblx0XHRcdHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGNhbGxiYWNrKFwiQ2Fubm90IENvbm5lY3RcIiwgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBhcmdzKTtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihpbmNvbWluZ01lc3NhZ2Upe1xuXHRcdFx0XHRoYW5kbGVNZXNzYWdlKGluY29taW5nTWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0Y2xvc2VBbGwoKTtcblx0XHRcdH1cblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbid0IGNvbm5lY3QgdG8gXCIrYWRkcik7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuZ2V0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cucmVxSWQgPSBjb25zdW1lTmV4dFJlcUlkKCk7XG5cdFx0cGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPSBjYWxsYmFjaztcblxuXHRcdC8vVGltZW91dCBhZnRlciB3aGljaCB0aGUgcmVxdWVzdCB3aWxsIGJlIGRpc2NhcmRlZFxuXHRcdGlmKHRpbWVvdXQgJiYgdGltZW91dCA+IDApe1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRpZihwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXSl7XG5cdFx0XHRcdFx0ZGVsZXRlIHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aW1lb3V0KTtcblx0XHR9XG5cblx0XHRzZW5kKG1zZyk7XG5cdH1cblxuXHR0aGlzLmxpc3RlbiA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQpe1xuXHRcdHZhciBtc2cgPSBjcmVhdGVNZXNzYWdlKHBhcmFtcyk7XG5cdFx0aWYobXNnID09PSBudWxsKSByZXR1cm4gO1xuXG5cdFx0bXNnLnN1YklkID0gY29uc3VtZU5leHRTdWJzY3JpcHRpb25JZCgpO1xuXHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXSA9IGNhbGxiYWNrO1xuXG5cdFx0Ly9UaW1lb3V0IGFmdGVyIHdoaWNoIHRoZSBzdWJzY3JpcHRpb24gaXMgYXV0b21hdGljYWxseSBpbnZhbGlkYXRlZFxuXHRcdGlmKHRpbWVvdXQgJiYgdGltZW91dCA+IDApe1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnN0b3BMaXN0ZW5pbmcobXNnLnN1YklkKTtcdFxuXHRcdFx0fSwgdGltZW91dCk7XG5cdFx0fVxuXG5cdFx0c2VuZChtc2cpO1xuXG5cdFx0cmV0dXJuIG1zZy5zdWJJZDtcblx0fVxuXG5cdHRoaXMuY2xvc2VDYWxsYmFjayA9IGZ1bmN0aW9uKGNiKXtcblx0XHRjbG9zZV9jYiA9IGNiO1xuXHR9XG5cblx0dGhpcy5zdG9wTGlzdGVuaW5nID0gZnVuY3Rpb24oc3ViSWQpe1xuXG5cdFx0aWYoIXJlZ2lzdGVyZWRMaXN0ZW5lcnNbc3ViSWRdKSByZXR1cm4gO1xuXG5cdFx0bXNnID0ge1xuXHRcdFx0ZnVuYzogJ1Vuc3Vic2NyaWJlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c3ViSWQ6IHN1YklkXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VuZChtc2cpO1xuXG5cdFx0ZGVsZXRlIHJlZ2lzdGVyZWRMaXN0ZW5lcnNbc3ViSWRdO1xuXHR9XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAhIChzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpO1xuXHR9XG5cblx0dGhpcy5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0XHRzb2NrZXQuY2xvc2UoKTtcblx0XHRjbG9zZUFsbCgpO1xuXHR9XG5cdFxuXHR0aGlzLmRlYnVnID0gZnVuY3Rpb24odmFsdWUpe1xuXHRcdERFQlVHID0gdmFsdWU7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBEaXlhQ2xpZW50KGFkZHIsIHVzZXIsIHBhc3N3b3JkKXtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZSgpe1xuXHRcdHZhciBub2RlID0gbmV3IGRpeWEuRGl5YShhZGRyKTtcblx0XHQvL25vZGVzLnB1c2gobm9kZSk7XG5cblx0XHRyZXR1cm4gbm9kZTtcblx0fVxuXG5cdHRoaXMuc2V0QWRkcmVzcyA9IGZ1bmN0aW9uKGFkZHJlc3Mpe1xuXHRcdGFkZHIgPSBhZGRyZXNzO1xuXHR9XG5cblx0dGhpcy5jcmVhdGVTZXNzaW9uID0gZnVuY3Rpb24ob25jb25uZWN0ZWQsIG9uZmFpbHVyZSl7XG5cdFx0dmFyIG5vZGUgPSBjcmVhdGVOb2RlKCk7XG5cblx0XHRub2RlLmNvbm5lY3QoZnVuY3Rpb24oZXJyKXtcblx0XHRcdGlmKGVycil7XG5cdFx0XHRcdG9uZmFpbHVyZShlcnIpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdG5vZGUuZ2V0KHtcblx0XHRcdFx0XHRzZXJ2aWNlOiAnYXV0aCcsXG5cdFx0XHRcdFx0ZnVuYzogJ0F1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdFx0ZGF0YToge3VzZXI6IHVzZXIsIHBhc3N3b3JkOiBwYXNzd29yZH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24ocmVzKXtcblx0XHRcdFx0XHRpZihyZXMuYXV0aGVudGljYXRlZCB8fCAocmVzLmVycm9yICYmIHJlcy5lcnJvciA9PT0gJ1NlcnZpY2VOb3RGb3VuZCcpKSBvbmNvbm5lY3RlZChub2RlKTtcblx0XHRcdFx0XHRlbHNlIG9uZmFpbHVyZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cdFxufVxuXG5cbnZhciBkaXlhID0ge1xuXHRcdERpeWFDbGllbnQ6IERpeWFDbGllbnQsXG5cdFx0RGl5YTogRGl5YSxcblx0XHRydGM6IHJ0Yyxcblx0XHRQcm9tZXRoZTogUHJvbWV0aGUsXG5cdFx0ZGlzY292ZXI6IGRpc2NvdmVyLFxuXHRcdHFlaTogcWVpLFxuXHRcdHVwZGF0ZTogdXBkYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGl5YTtcbiIsInZhciBkZ3JhbTtcblxudmFyIG5ldHdvcmtJZFJlcXVlc3QgPSAnZGl5YS1uZXR3b3JrLWlkXFxuJztcblxudmFyIHNvY2tldDtcbnZhciBjYWxsYmFja3MgPSBbXTtcbnZhciBkaXlhcyA9IFtdO1xuXG5cbnZhciBzdGF0ZSA9ICdzdG9wcGVkJztcblxuZnVuY3Rpb24gaXNOb2RlKCl7XG5cdGlmKGRncmFtKSByZXR1cm4gdHJ1ZTtcblx0dHJ5e1xuXHRcdGRncmFtID0gcmVxdWlyZSgnZGdyYW0nKycnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fWNhdGNoKGUpe1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0ZW4oY2FsbGJhY2spe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cdGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU91dGRhdGVkRGl5YXMoKXtcblx0Zm9yKHZhciBpPTA7aTxkaXlhcy5sZW5ndGg7IGkrKyl7XG5cdFx0aWYobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBkaXlhc1tpXS50b3VjaCA+IDEwMDAwKXtcblx0XHRcdGRpeWFzLnNwbGljZShpLCAxKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblx0Zm9yKHZhciBpPTA7IGk8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKGRpeWFzW2ldLm5hbWUgPT09IG5hbWUgJiYgZGl5YXNbaV0uYWRkciA9PT0gYWRkcmVzcysnOicrcG9ydCl7XG5cdFx0XHRyZXR1cm4gZGl5YXNbaV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBnb3REaXlhKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXG5cblx0dmFyIGRpeWEgPSBnZXREaXlhKG5hbWUsIHBvcnQsIGFkZHJlc3MpO1xuXHRpZighZGl5YSl7XG5cdFx0ZGl5YSA9IHtuYW1lOiBuYW1lLCBhZGRyOiBhZGRyZXNzKyc6Jytwb3J0fTtcblx0XHRkaXlhcy5wdXNoKGRpeWEpO1xuXHR9XG5cdGRpeWEudG91Y2ggPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hBbnN3ZXIobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wO2k8Y2FsbGJhY2tzLmxlbmd0aDtpKyspe1xuXHRcdGNhbGxiYWNrc1tpXShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZXF1ZXN0KCl7XG5cdHNvY2tldC5zZW5kKG5ldHdvcmtJZFJlcXVlc3QsIDAsIG5ldHdvcmtJZFJlcXVlc3QubGVuZ3RoLCAyMDAwLCAnMjU1LjI1NS4yNTUuMjU1Jyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0KCl7XG5cdGlmKCFpc05vZGUoKSkgcmV0dXJuIDtcblxuXHRzdGF0ZSA9ICdzdGFydGVkJztcblxuXHRpZighc29ja2V0KXtcblx0XHRzb2NrZXQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQoJ3VkcDQnKTtcblxuXHRcdHNvY2tldC5vbignbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEsIHJpbmZvKXtcblx0XHRcdHZhciBtc2cgPSBkYXRhLnRvU3RyaW5nKCdhc2NpaScpO1xuXHRcdFx0dmFyIHBhcmFtcyA9IG1zZy5zcGxpdCgnOicpO1xuXHRcdFx0XG5cdFx0XHRpZihwYXJhbXMubGVuZ3RoID09IDIpe1xuXHRcdFx0XHRnb3REaXlhKHBhcmFtc1swXSwgcGFyYW1zWzFdLCByaW5mby5hZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHNvY2tldC5vbignbGlzdGVuaW5nJywgZnVuY3Rpb24oKXtcblx0XHRcdHNvY2tldC5zZXRCcm9hZGNhc3QodHJ1ZSk7XHRcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRvRGlzY292ZXIoKXtcblx0XHRyZXF1ZXN0KCk7XG5cdFx0cmVtb3ZlT3V0ZGF0ZWREaXlhcygpO1xuXG5cdFx0aWYoc3RhdGUgPT09ICdzdGFydGVkJykgc2V0VGltZW91dChkb0Rpc2NvdmVyLCAxMDAwKTtcblx0fVxuXHRkb0Rpc2NvdmVyKCk7XG5cblxufVxuXG5mdW5jdGlvbiBzdG9wKCl7XG5cblx0c3RhdGUgPSAnc3RvcHBlZCc7XG5cblx0aWYoc29ja2V0KSBzb2NrZXQuY2xvc2UoKTtcblx0d2hpbGUoY2FsbGJhY2tzLmxlbmd0aCl7XG5cdFx0Y2FsbGJhY2tzLnBvcCgpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gYXZhaWxhYmxlRGl5YXMoKXtcblx0cmV0dXJuIGRpeWFzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c3RhcnQ6IHN0YXJ0LFxuXHRzdG9wOiBzdG9wLFxuXHRsaXN0ZW46IGxpc3Rlbixcblx0aXNEaXNjb3ZlcmFibGU6IGlzTm9kZSxcblx0YXZhaWxhYmxlRGl5YXM6IGF2YWlsYWJsZURpeWFzXG59IiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsInZhciBSVEMgPSByZXF1aXJlKCcuLi9ydGMvcnRjJyk7XG5cbmZ1bmN0aW9uIFByb21ldGhlKHNlc3Npb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5ydGMgPSBuZXcgUlRDLlJUQyhzZXNzaW9uKTtcblx0XG5cdHRoaXMucnRjLm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHR5cGVvZiB0aGF0Lm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoYXQub25jbG9zZSgpO1xuXHR9XG59XG5cblByb21ldGhlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihyZWdleCwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMucnRjLnVzZShyZWdleCwgZnVuY3Rpb24oY2hhbm5lbCl7XG5cdFx0dGhhdC5fbmVnb2NpYXRlTmV1cm9uKGNoYW5uZWwsIGNhbGxiYWNrKTtcblx0fSk7XG59XG5cblByb21ldGhlLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5ydGMuY29ubmVjdCgpO1xufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMucnRjLmRpc2Nvbm5lY3QoKTtcbn1cblxuXG5Qcm9tZXRoZS5wcm90b3R5cGUuX25lZ29jaWF0ZU5ldXJvbiA9IGZ1bmN0aW9uKGNoYW5uZWwsIGNhbGxiYWNrKXtcblx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0XG5cdFx0dmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcobWVzc2FnZS5kYXRhKTtcblxuXHRcdHZhciB0eXBlQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlldy5nZXRVaW50OCgwKSk7XG5cdFx0aWYodHlwZUNoYXIgPT09ICdPJyl7XG5cdFx0XHQvL0lucHV0XG5cdFx0XHRjaGFubmVsLnR5cGUgPSAnaW5wdXQnOyAvL1Byb21ldGhlIE91dHB1dCA9IENsaWVudCBJbnB1dFxuXHRcdH1lbHNlIGlmKHR5cGVDaGFyID09PSAnSScpe1xuXHRcdFx0Ly9PdXRwdXRcblx0XHRcdGNoYW5uZWwudHlwZSA9ICdvdXRwdXQnOyAvL1Byb21ldGhlIElucHV0ID0gQ2xpZW50IE91dHB1dFxuXHRcdH1lbHNle1xuXHRcdFx0Ly9FcnJvclxuXHRcdH1cblxuXHRcdHZhciBzaXplID0gdmlldy5nZXRJbnQzMigxLHRydWUpO1xuXHRcdGlmKHNpemUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdGNoYW5uZWwuc2l6ZSA9IHNpemU7XG5cdFx0XHRjaGFubmVsLl9idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuXHRcdH1lbHNle1xuXHRcdFx0Ly9lcnJvclxuXHRcdH1cblxuXG5cblx0XHRjaGFubmVsLnNldE9uTWVzc2FnZSh1bmRlZmluZWQpO1xuXG5cdFx0Y2hhbm5lbC5zZXRPblZhbHVlID0gZnVuY3Rpb24ob252YWx1ZV9jYil7XG5cdFx0XHRjaGFubmVsLnNldE9uTWVzc2FnZShvbnZhbHVlX2NiKTtcblx0XHR9O1xuXG5cdFx0Y2hhbm5lbC53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFubmVsLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjaGFubmVsLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHRcdFxuXHRcdGNoYW5uZWwud3JpdGVBbGwgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkodmFsdWVzKSB8fCB2YWx1ZXMubGVuZ3RoICE9PSBjaGFubmVsLnNpemUpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGk8dmFsdWVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdFx0aWYoaXNOYU4odmFsdWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRjaGFubmVsLl9idWZmZXJbaV0gPSB2YWx1ZXNbaV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0Y2hhbm5lbC5mcmVxdWVuY3kgPSAzMztcblxuXHRcdGNoYW5uZWwuX3J1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjaGFubmVsLnNlbmQoY2hhbm5lbC5fYnVmZmVyKSlcblx0XHRcdFx0c2V0VGltZW91dChjaGFubmVsLl9ydW4sIGNoYW5uZWwuZnJlcXVlbmN5KTtcblx0XHR9O1xuXG5cdFx0Y2hhbm5lbC5fcnVuKCk7XG5cblx0XHRjYWxsYmFjayhjaGFubmVsKTtcblxuXHR9KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21ldGhlOyIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG4vKipcbiAqICBjYWxsYmFjayA6IGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RlbCB1cGRhdGVkXG4gKiAqL1xuZnVuY3Rpb24gUUVJKG5vZGUsIGNhbGxiYWNrLCBzYW1wbGluZyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0XG5cdHRoaXMuc2FtcGxpbmcgPSBzYW1wbGluZyB8fCAxMDsgLyogbWF4IG51bSBvZiBwdHMgc3RvcmVkICovXG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihyZXMpe307IC8qIGNhbGxiYWNrLCB1c3VhbGx5IGFmdGVyIGdldE1vZGVsICovXG5cblx0bm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6IFwicWVpXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJtc2dJbml0XCIsXG5cdFx0XHRzYW1wbGluZzogMSxcblx0XHRcdHJlcXVlc3RlZERhdGE6IFwiYWxsXCJcblx0XHRcdC8qIG5vIHRpbWUgcmFuZ2Ugc3BlY2lmaWVkICovXG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGF0LmRhdGFNb2RlbD0ge307XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdFx0XG5cdFx0XHQvLy8gdGhhdC51cGRhdGVDaGFydCh0aGlzLmRhdGFNb2RlbCk7XG5cdFx0XHR0aGF0Ll91cGRhdGVMZXZlbHModGhhdC5kYXRhTW9kZWwpO1xuXHRcdFx0dGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cblx0XHRcdG5vZGUubGlzdGVuKHtcblx0XHRcdFx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdFx0XHRcdGZ1bmM6IFwiU3Vic2NyaWJlUWVpXCJcblx0XHRcdFx0fSwgZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YocmVzLmRhdGEpO1xuXHRcdFx0XHRcdHRoYXQuX3VwZGF0ZUxldmVscyh0aGF0LmRhdGFNb2RlbCk7XG5cdFx0XHRcdFx0dGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cdFx0XHRcdFx0fSk7XG5cdH0pO1xuXG5cdGNvbnNvbGUubG9nKFwiRGl5YVNESyAtIFFFSTogY3JlYXRlZFwiKTtcblx0cmV0dXJuIHRoaXM7XG59XG4vKipcbiAqIEdldCBkYXRhTW9kZWwgOiBcbiAqIHtcbiAqIFx0dGltZTogW0ZMT0FULCAuLi5dLFxuICogXHRcInNlbnNldXJYWFwiOiB7XG4gKiBcdFx0XHRkYXRhOltGTE9BVCwgLi4uXSxcbiAqIFx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKiBcdFx0XHRyYW5nZTogW0ZMT0FULCBGTE9BVF0sXG4gKiBcdFx0XHR1bml0OiBGTE9BVFxuICogXHRcdH0sXG4gKiAgIC4uLiAoXCJzZW5zZXVyc1lZXCIpXG4gKiB9XG4gKi9cblFFSS5wcm90b3R5cGUuZ2V0RGF0YU1vZGVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsO1xufVxuUUVJLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59XG5RRUkucHJvdG90eXBlLnVwZGF0ZVF1YWxpdHlJbmRleCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdHZhciBkbSA9IHRoaXMuZGF0YU1vZGVsO1xuXHRcblx0Zm9yKHZhciBkIGluIGRtKSB7XG5cdFx0aWYoZD09J3RpbWUnIHx8ICFkbVtkXS5kYXRhKSBjb250aW51ZTtcblx0XG5cdFx0aWYoIWRtW2RdLnF1YWxpdHlJbmRleCB8fCBkbVtkXS5kYXRhLmxlbmd0aCAhPSBkbVtkXS5xdWFsaXR5SW5kZXgubGVuZ3RoKVxuXHRcdFx0ZG1bZF0ucXVhbGl0eUluZGV4ID0gbmV3IEFycmF5KGRtW2RdLmRhdGEubGVuZ3RoKTtcblx0XHRcblx0XHRkbVtkXS5kYXRhLmZvckVhY2goZnVuY3Rpb24odixpKSB7XG5cdFx0XHRcdGRtW2RdLnF1YWxpdHlJbmRleFtpXSA9IGNoZWNrUXVhbGl0eSh2LGRtW2RdLnF1YWxpdHlDb25maWcpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuUUVJLnByb3RvdHlwZS5nZXREYXRhY29uZm9ydFJhbmdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsLmNvbmZvcnRSYW5nZTtcbn1cblFFSS5wcm90b3R5cGUuZ2V0U2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0cmV0dXJuIHRoaXMuc2FtcGxpbmc7XG59XG5RRUkucHJvdG90eXBlLnNldFNhbXBsaW5nID0gZnVuY3Rpb24obnVtU2FtcGxlcyl7XG5cdHRoaXMuc2FtcGxpbmcgPSBudW1TYW1wbGVzO1xufVxuXG5cblxuUUVJLnByb3RvdHlwZS5fdXBkYXRlQ29uZmluZW1lbnRMZXZlbCA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0dmFyIGNvMiA9IG1vZGVsWydDTzInXS5kYXRhW21vZGVsWydDTzInXS5kYXRhLmxlbmd0aCAtIDFdO1xuXHR2YXIgdm9jdCA9IG1vZGVsWydWT0N0J10uZGF0YVttb2RlbFsnVk9DdCddLmRhdGEubGVuZ3RoIC0gMV07XG5cdHZhciBjb25maW5lbWVudCA9IE1hdGgubWF4KGNvMiwgdm9jdCk7XG5cblx0aWYoY29uZmluZW1lbnQgPCA4MDApe1xuXHRcdHJldHVybiAzO1xuXHR9XG5cdGlmKGNvbmZpbmVtZW50IDwgMTYwMCl7XG5cdFx0cmV0dXJuIDI7XG5cdH1cblx0aWYoY29uZmluZW1lbnQgPCAyNDAwKXtcblx0XHRyZXR1cm4gMTtcblx0fVxuXHRpZihjb25maW5lbWVudCA8IDMwMDApe1xuXHRcdHJldHVybiAwO1xuXHR9XG59XG5cblFFSS5wcm90b3R5cGUuX3VwZGF0ZUFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKGNvbmZpbmVtZW50LCBtb2RlbCl7XG5cdHZhciBmaW5lRHVzdFF1YWxpdHlJbmRleCA9IG1vZGVsWydGaW5lIER1c3QnXS5xdWFsaXR5SW5kZXhbbW9kZWxbJ0ZpbmUgRHVzdCddLnF1YWxpdHlJbmRleC5sZW5ndGgtMV07XG5cdHZhciBvem9uZVF1YWxpdHlJbmRleCA9IG1vZGVsWydPem9uZSddLnF1YWxpdHlJbmRleFttb2RlbFsnT3pvbmUnXS5xdWFsaXR5SW5kZXgubGVuZ3RoLTFdO1xuXG5cdHZhciBxdWFsaXR5SW5kZXggPSBmaW5lRHVzdFF1YWxpdHlJbmRleCArIG96b25lUXVhbGl0eUluZGV4O1xuXHRpZihxdWFsaXR5SW5kZXggPCAyKSByZXR1cm4gY29uZmluZW1lbnQgLSAxO1xuXHRlbHNlIHJldHVybiBjb25maW5lbWVudDtcbn1cblxuUUVJLnByb3RvdHlwZS5fdXBkYXRlRW52UXVhbGl0eUxldmVsID0gZnVuY3Rpb24oYWlyUXVhbGl0eSwgbW9kZWwpe1xuXHR2YXIgaHVtaWRpdHlRdWFsaXR5SW5kZXggPSBtb2RlbFsnSHVtaWRpdHknXS5xdWFsaXR5SW5kZXhbbW9kZWxbJ0h1bWlkaXR5J10ucXVhbGl0eUluZGV4Lmxlbmd0aC0xXTtcblx0dmFyIHRlbXBlcmF0dXJlUXVhbGl0eUluZGV4ID0gbW9kZWxbJ1RlbXBlcmF0dXJlJ10ucXVhbGl0eUluZGV4W21vZGVsWydUZW1wZXJhdHVyZSddLnF1YWxpdHlJbmRleC5sZW5ndGgtMV07XG5cblx0dmFyIHF1YWxpdHlJbmRleCA9IGh1bWlkaXR5UXVhbGl0eUluZGV4ICsgdGVtcGVyYXR1cmVRdWFsaXR5SW5kZXg7XG5cdGlmKHF1YWxpdHlJbmRleCA8IDIpIHJldHVybiBhaXJRdWFsaXR5IC0gMTtcblx0ZWxzZSByZXR1cm4gYWlyUXVhbGl0eTtcdFxufVxuXG5RRUkucHJvdG90eXBlLl91cGRhdGVMZXZlbHMgPSBmdW5jdGlvbihtb2RlbCl7XG5cdHRoaXMuY29uZmluZW1lbnQgPSB0aGlzLl91cGRhdGVDb25maW5lbWVudExldmVsKG1vZGVsKTtcblx0dGhpcy5haXJRdWFsaXR5ID0gdGhpcy5fdXBkYXRlQWlyUXVhbGl0eUxldmVsKHRoaXMuY29uZmluZW1lbnQsIG1vZGVsKTtcblx0dGhpcy5lbnZRdWFsaXR5ID0gdGhpcy5fdXBkYXRlRW52UXVhbGl0eUxldmVsKHRoaXMuYWlyUXVhbGl0eSwgbW9kZWwpO1xufVxuXG5RRUkucHJvdG90eXBlLmdldENvbmZpbmVtZW50TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5jb25maW5lbWVudDtcbn1cblxuUUVJLnByb3RvdHlwZS5nZXRBaXJRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5haXJRdWFsaXR5O1xufVxuXG5RRUkucHJvdG90eXBlLmdldEVudlF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmVudlF1YWxpdHk7XG59XG5cblxudmFyIGNoZWNrUXVhbGl0eSA9IGZ1bmN0aW9uKGRhdGEsIHF1YWxpdHlDb25maWcpe1xuXHR2YXIgcXVhbGl0eTtcblx0aWYoZGF0YSAmJiBxdWFsaXR5Q29uZmlnKSB7XG5cdFx0aWYoZGF0YT5xdWFsaXR5Q29uZmlnLmNvbmZvcnRSYW5nZVsxXSB8fCBkYXRhPHF1YWxpdHlDb25maWcuY29uZm9ydFJhbmdlWzBdKVxuXHRcdFx0cXVhbGl0eT0wO1xuXHRcdGVsc2Vcblx0XHRcdHF1YWxpdHk9MS4wXG5cdFx0cmV0dXJuIHF1YWxpdHk7XG5cdH1cblx0cmV0dXJuIDEuMDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfSAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5RRUkucHJvdG90eXBlLl9nZXREYXRhTW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgZGF0YU1vZGVsPXRoaXMuZGF0YU1vZGVsO1xuXHQvKlxcXG5cdHwqfFxuXHR8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcblx0fCp8XG5cdHwqfCAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9Ew6ljb2Rlcl9lbmNvZGVyX2VuX2Jhc2U2NFxuXHR8Knxcblx0XFwqL1xuXHQvKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cblx0YjY0VG9VaW50NiA9IGZ1bmN0aW9uKG5DaHIpIHtcblx0XHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0XHRcdG5DaHIgLSA2NVxuXHRcdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0XHRcdG5DaHIgLSA3MVxuXHRcdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRcdFx0bkNociArIDRcblx0XHRcdDogbkNociA9PT0gNDMgP1xuXHRcdFx0XHQ2MlxuXHRcdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0XHRcdDYzXG5cdFx0XHQ6XHQwO1xuXHR9O1xuXHQvKipcblx0ICogRGVjb2RlIGJhc2U2NCBzdHJpbmcgdG8gVUludDhBcnJheVxuXHQgKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjQgICAgIGJhc2U2NCBjb2RlZCBzdHJpbmdcblx0ICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cblx0ICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgdGFiIG9mIGRlY29kZWQgYnl0ZXNcblx0ICovXG5cdGJhc2U2NERlY1RvQXJyID0gZnVuY3Rpb24oc0Jhc2U2NCwgbkJsb2Nrc1NpemUpIHtcblx0XHR2YXJcblx0XHRzQjY0RW5jID0gc0Jhc2U2NC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL10vZywgXCJcIiksIG5JbkxlbiA9IHNCNjRFbmMubGVuZ3RoLFxuXHRcdG5PdXRMZW4gPSBuQmxvY2tzU2l6ZSA/IE1hdGguY2VpbCgobkluTGVuICogMyArIDEgPj4gMikgLyBuQmxvY2tzU2l6ZSkgKiBuQmxvY2tzU2l6ZSA6IG5JbkxlbiAqIDMgKyAxID4+IDIsXG5cdFx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRcdGZvciAodmFyIG5Nb2QzLCBuTW9kNCwgblVpbnQyNCA9IDAsIG5PdXRJZHggPSAwLCBuSW5JZHggPSAwOyBuSW5JZHggPCBuSW5MZW47IG5JbklkeCsrKSB7XG5cdFx0XHRuTW9kNCA9IG5JbklkeCAmIDM7IC8qIG4gbW9kIDQgKi9cblx0XHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0XHRpZiAobk1vZDQgPT09IDMgfHwgbkluTGVuIC0gbkluSWR4ID09PSAxKSB7XG5cdFx0XHRcdGZvciAobk1vZDMgPSAwOyBuTW9kMyA8IDMgJiYgbk91dElkeCA8IG5PdXRMZW47IG5Nb2QzKyssIG5PdXRJZHgrKykge1xuXHRcdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5VaW50MjQgPSAwO1xuXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdFx0cmV0dXJuIGJ1ZmZlcjtcblx0fTtcblx0XG5cdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXIpIHtcblx0XHQvL34gY29uc29sZS5sb2coJ3JjdmRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0Ly8gaWYoIWRhdGEuaGVhZGVyLnNhbXBsaW5nKSBkYXRhLmhlYWRlci5zYW1wbGluZz0xO1xuXHRcdFxuXHRcdC8qKiBjYXNlIDEgOiAxIHZhbHVlIHJlY2VpdmVkIGFkZGVkIHRvIGRhdGFNb2RlbCAqL1xuXHRcdGlmKGRhdGEuaGVhZGVyLnNhbXBsaW5nPT0xKSB7XG5cdFx0XHRpZihkYXRhLmhlYWRlci50aW1lRW5kKSB7XG5cdFx0XHRcdGlmKCFkYXRhTW9kZWwudGltZSkgZGF0YU1vZGVsLnRpbWU9W107XG5cdFx0XHRcdGRhdGFNb2RlbC50aW1lLnB1c2goZGF0YS5oZWFkZXIudGltZUVuZCk7XG5cdFx0XHRcdGlmKGRhdGFNb2RlbC50aW1lLmxlbmd0aCA+IHRoaXMuc2FtcGxpbmcpIHtcblx0XHRcdFx0XHRkYXRhTW9kZWwudGltZSA9IGRhdGFNb2RlbC50aW1lLnNsaWNlKGRhdGFNb2RlbC50aW1lLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJ0aW1lXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGxhYmVsICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmxhYmVsPWRhdGFbbl0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS51bml0PWRhdGFbbl0udW5pdDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBjb25mb3J0UmFuZ2UgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucXVhbGl0eUNvbmZpZz17Y29uZm9ydFJhbmdlOiBkYXRhW25dLmNvbmZvcnRSYW5nZX07XG5cblx0XHRcdFx0XHRpZihkYXRhW25dLmRhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0LyogZGVjb2RlIGRhdGEgdG8gRmxvYXQzMkFycmF5Ki9cblx0XHRcdFx0XHRcdHZhciBidWYgPSBiYXNlNjREZWNUb0FycihkYXRhW25dLmRhdGEsIDQpO1xuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYnVmKSk7XG5cdFx0XHRcdFx0XHR2YXIgZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gZkFycmF5Lmxlbmd0aCkgY29uc29sZS5sb2coXCJNaXNtYXRjaCBvZiBzaXplIFwiK2RhdGFbbl0uc2l6ZStcIiB2cyBcIitmQXJyYXkubGVuZ3RoKTtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAxKSBjb25zb2xlLmxvZyhcIkV4cGVjdGVkIDEgdmFsdWUgcmVjZWl2ZWQgOlwiK2RhdGFbbl0uc2l6ZSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0uZGF0YSkgZGF0YU1vZGVsW25dLmRhdGE9W107XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YS5wdXNoKGZBcnJheVswXSk7XG5cdFx0XHRcdFx0XHRpZihkYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGggPiB0aGlzLnNhbXBsaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gZGF0YU1vZGVsW25dLmRhdGEuc2xpY2UoZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoIC0gdGhpcy5zYW1wbGluZyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IDApIGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCByZWNlaXZlZCBkYXRhIChubyBkYXRhIHZlcnN1cyBzaXplPVwiK2RhdGFbbl0uc2l6ZStcIilcIik7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnVwZGF0ZVF1YWxpdHlJbmRleCgpO1xuXHRcdFx0XHRcdC8vfiBjb25zb2xlLmxvZygnbXlkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YU1vZGVsW25dLmRhdGEpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8qKiBjYXNlIDIgOiBoaXN0b3J5IGRhdGEgLSBtYW55IHZhbHVlcyByZWNlaXZlZCAqL1xuXHRcdFx0LyoqIFRPRE8gICovXG5cdFx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdFx0aWYobiA9PSAndGltZScpIHtcblx0XHRcdFx0XHQvKiBjYXNlIDEgOiB0aW1lIGRhdGEgdHJhbnNtaXR0ZWQsIDEgdmFsdWUgKi9cblx0XHRcdFx0XHQvKiogVE9ETyAqKi9cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG4gIT0gXCJoZWFkZXJcIikge1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKG4pO1xuXHRcdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0pIHtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXT17fTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnJhbmdlPWRhdGFbbl0ucmFuZ2U7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgbGFiZWwgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSB1bml0ICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnVuaXQ9ZGF0YVtuXS51bml0O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGNvbmZvcnRSYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlfTtcblxuXHRcdFx0XHRcdGlmKGRhdGFbbl0uZGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHQvKiBkZWNvZGUgZGF0YSB0byBGbG9hdDMyQXJyYXkqL1xuXHRcdFx0XHRcdFx0dmFyIGJ1ZiA9IGJhc2U2NERlY1RvQXJyKGRhdGFbbl0uZGF0YSwgNCk7IFxuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYnVmKSk7XG5cdFx0XHRcdFx0XHR2YXIgZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gZkFycmF5Lmxlbmd0aCkgY29uc29sZS5sb2coXCJNaXNtYXRjaCBvZiBzaXplIFwiK2RhdGFbbl0uc2l6ZStcIiB2cyBcIitmQXJyYXkubGVuZ3RoKTtcblx0XHRcdFx0XHRcdC8vIC8qIGluY3JlYXNlIHNpemUgb2YgZGF0YSBpZiBuZWNlc3NhcnkgKi9cblx0XHRcdFx0XHRcdGlmKGZBcnJheS5sZW5ndGg+ZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGRhdGFNb2RlbFtuXS5zaXplPWRhdGFbbl0uc2l6ZTtcblx0XHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBuZXcgQXJyYXkoZGF0YU1vZGVsW25dLnNpemUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0LyogdXBkYXRlIG5iIG9mIHNhbXBsZXMgc3RvcmVkICovXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgaW4gZkFycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhW3BhcnNlSW50KGkpXT1mQXJyYXlbaV07IC8qIGtlZXAgZmlyc3QgdmFsIC0gbmFtZSBvZiBjb2x1bW4gKi9cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMCkgY29uc29sZS5sb2coXCJTaXplIG1pc21hdGNoIHJlY2VpdmVkIGRhdGEgKG5vIGRhdGEgdmVyc3VzIHNpemU9XCIrZGF0YVtuXS5zaXplK1wiKVwiKTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRhdGFNb2RlbFtuXS5kYXRhID0gQXJyYXkuZnJvbShmQXJyYXkpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdteWRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhTW9kZWxbbl0uZGF0YSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsO1xufVxuXG5cbnZhciBleHAgPSB7XG5cdFx0UUVJOiBRRUlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7IFxuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cbi8qPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cbnZhciBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xudmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xudmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xuXG5mdW5jdGlvbiBDaGFubmVsKG5hbWUsIG9wZW5fY2Ipe1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbm9wZW4gPSBvcGVuX2NiO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHR0aGlzLmNoYW5uZWwgPSBkYXRhY2hhbm5lbDtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHRoYXQub25vcGVuKSB0aGF0Lm9ub3Blbih0aGF0KTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlZCA9IHRydWU7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldE9uTWVzc2FnZSA9IGZ1bmN0aW9uKG9ubWVzc2FnZSl7XG5cdHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNsb3NlZCkgcmV0dXJuIGZhbHNlO1xuXHRlbHNlIGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3Blbicpe1xuXHRcdHRyeXtcblx0XHRcdHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gZXhjZXB0aW9uIG9jY3VyZWQgd2hpbGUgc2VuZGluZyBkYXRhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGVsc2V7XG5cdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gd2FybmluZyA6IHdlYnJ0YyBkYXRhY2hhbm5lbCBzdGF0ZSA9ICcrdGhpcy5jaGFubmVsLnJlYWR5U3RhdGUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBQZWVyKHJ0YywgaWQsIGNoYW5uZWxzKXtcblx0dGhpcy5pZCA9IGlkO1xuXHR0aGlzLmNoYW5uZWxzID0gY2hhbm5lbHM7XG5cdHRoaXMucnRjID0gcnRjO1xuXHR0aGlzLnBlZXIgPSBudWxsO1xuXG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufVxuXG5cblBlZXIucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc3ViID0gdGhpcy5ydGMubm9kZS5saXN0ZW4oe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdDb25uZWN0Jyxcblx0XHRvYmo6IHRoaXMuY2hhbm5lbHMsXG5cdFx0ZGF0YToge1xuXHRcdFx0cHJvbUlEOiB0aGlzLmlkXG5cdFx0fVxuXHR9LFxuXHRmdW5jdGlvbihkYXRhKXtcblx0XHR0aGF0Ll9oYW5kbGVOZWdvY2lhdGlvbk1lc3NhZ2UoZGF0YSk7XG5cdH0pO1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRpZighdGhhdC5jb25uZWN0ZWQgJiYgIXRoYXQuY2xvc2VkKXtcblx0XHRcdHRoYXQucnRjLnJlY29ubmVjdCgpO1xuXHRcdH1lbHNle1xuXHRcdH1cblx0fSwgMTAwMDApO1xufVxuXG5QZWVyLnByb3RvdHlwZS5faGFuZGxlTmVnb2NpYXRpb25NZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblxuXHRpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlT2ZmZXInKXtcblx0XHR0aGlzLl9jcmVhdGVQZWVyKG1zZyk7XG5cdH1lbHNlIGlmKG1zZy5ldmVudFR5cGUgPT09ICdSZW1vdGVJQ0VDYW5kaWRhdGUnKXtcblx0XHR0aGlzLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUobXNnKTtcblx0fVxufTtcblxudmFyIHNlcnZlcnMgPSB7XCJpY2VTZXJ2ZXJzXCI6IFt7XCJ1cmxcIjogXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCJ9XX07XG5cblBlZXIucHJvdG90eXBlLl9jcmVhdGVQZWVyID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgcGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihzZXJ2ZXJzLCB7bWFuZGF0b3J5OiBbe0R0bHNTcnRwS2V5QWdyZWVtZW50OiB0cnVlfSwge0VuYWJsZUR0bHNTcnRwOiB0cnVlfV19KTtcblx0dGhpcy5wZWVyID0gcGVlcjtcblxuXHRwZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe3NkcDogZGF0YS5zZHAsIHR5cGU6IGRhdGEudHlwZX0pKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0LnJ0Yy5ub2RlLmdldCh7XG5cdFx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRcdGZ1bmM6ICdBbnN3ZXInLFxuXHRcdFx0ZGF0YTp7XG5cdFx0XHRcdHByb21JRDogZGF0YS5wcm9tSUQsXG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHNkcDogc2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAsXG5cdFx0XHRcdHR5cGU6IHNlc3Npb25fZGVzY3JpcHRpb24udHlwZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRmdW5jdGlvbihlcnIpe1xuXHRcdGNvbnNvbGUubG9nKFwiY2Fubm90IGNyZWF0ZSBhbnN3ZXJcIik7XG5cdH0sIFxuXHR7ICdtYW5kYXRvcnknOiB7ICdPZmZlclRvUmVjZWl2ZUF1ZGlvJzogdHJ1ZSwgJ09mZmVyVG9SZWNlaXZlVmlkZW8nOiB0cnVlIH0gfSk7XG5cblxuXHRwZWVyLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcblx0XHRjb25zb2xlLmxvZyhwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSk7XG5cdFx0aWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjb25uZWN0ZWQnKXtcblx0XHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTsgIFxuXHRcdFx0dGhhdC5ydGMubm9kZS5zdG9wTGlzdGVuaW5nKHRoaXMuc3ViKTtcblx0XHR9ZWxzZSBpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Rpc2Nvbm5lY3RlZCcpe1xuXHRcdFx0aWYoIXRoYXQuY2xvc2VkKSB0aGF0LnJ0Yy5yZWNvbm5lY3QoKTtcblx0XHR9XG5cdH1cblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LnJ0Yy5ub2RlLmdldCh7XG5cdFx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRcdGZ1bmM6ICdJQ0VDYW5kaWRhdGUnLFxuXHRcdFx0ZGF0YTp7XG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHByb21JRDogdGhhdC5pZCxcblx0XHRcdFx0Y2FuZGlkYXRlOiBldnQuY2FuZGlkYXRlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cGVlci5vbmRhdGFjaGFubmVsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0dGhhdC5ydGMuX29uRGF0YUNoYW5uZWwoZXZ0LmNoYW5uZWwpO1xuXHR9O1xufVxuXG5QZWVyLnByb3RvdHlwZS5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dHJ5e1xuXHRcdHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcblx0XHR0aGlzLnBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSxmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjYW5kaWRhdGUgYWRkZWQgKFwiK3RoYXQucGVlci5pY2VDb25uZWN0aW9uU3RhdGUrXCIpXCIpO1xuXHRcdH0sZnVuY3Rpb24oZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHR9KTtcblx0fWNhdGNoKGUpIHtjb25zb2xlLmxvZyhlKTt9XG59XG5cblBlZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5ydGMubm9kZS5zdG9wTGlzdGVuaW5nKHRoaXMuc3ViKTtcblx0aWYodGhpcy5wZWVyKSB0cnl7XG5cdFx0dGhpcy5wZWVyLmNsb3NlKCk7XG5cdH1jYXRjaChlKXt9XG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIFJUQyhub2RlKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0dGhpcy51c2VkQ2hhbm5lbHMgPSBbXTtcblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzID0gW107XG5cblx0dGhpcy5wZWVycyA9IFtdO1xufVxuXG5SVEMucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKG5hbWVfcmVnZXgsIG9ub3Blbl9jYWxsYmFjayl7XG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMucHVzaCh7cmVnZXg6IG5hbWVfcmVnZXgsIGNiOiBvbm9wZW5fY2FsbGJhY2t9KTtcbn1cblxuUlRDLnByb3RvdHlwZS5yZWNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XG5cdHRoYXQuZGlzY29ubmVjdCgpO1xuXHR0aGF0LmNvbm5lY3QoKTtcblx0Y29uc29sZS5sb2coXCJyZWNvbm5lY3RpbmcuLi5cIik7XG59XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cblx0Zm9yKHZhciBwcm9tSUQgaW4gdGhpcy5wZWVycyl7XG5cdFx0dGhpcy5fY2xvc2VQZWVyKHByb21JRCk7XG5cdH1cblxuXHR0aGlzLm5vZGUuc3RvcExpc3RlbmluZyh0aGlzLnN1Yik7XG5cblx0aWYodHlwZW9mIHRoaXMub25jbG9zZSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5vbmNsb3NlKCk7XG59XG5cblJUQy5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIGZvdW5kQ2hhbm5lbHMgPSBmYWxzZTtcblxuXHR0aGlzLnN1YiA9IHRoaXMubm9kZS5saXN0ZW4oe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdMaXN0ZW5QZWVycydcblx0fSxcblx0ZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcblx0XHRpZihkYXRhLmV2ZW50VHlwZSAmJiBkYXRhLnByb21JRCAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ29ubmVjdGVkJyl7XG5cdFx0XHRcdGlmKCF0aGF0LnBlZXJzW2RhdGEucHJvbUlEXSl7XG5cdFx0XHRcdFx0dmFyIGNoYW5uZWxzID0gdGhhdC5fbWF0Y2hDaGFubmVscyhkYXRhLmNoYW5uZWxzKTtcblx0XHRcdFx0XHRpZihjaGFubmVscy5sZW5ndGggPiAwKXtcblx0XHRcdFx0XHRcdHRoYXQucGVlcnNbZGF0YS5wcm9tSURdID0gbmV3IFBlZXIodGhhdCwgZGF0YS5wcm9tSUQsIGNoYW5uZWxzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ2xvc2VkJyl7XG5cdFx0XHRcdGlmKHRoYXQucGVlcnNbZGF0YS5wcm9tSURdKXtcblx0XHRcdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZGF0YS5wcm9tSUQpO1xuXHRcdFx0XHRcdGlmKHR5cGVvZiB0aGF0Lm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoYXQub25jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xufVxuXG5cblJUQy5wcm90b3R5cGUuX2Nsb3NlUGVlciA9IGZ1bmN0aW9uKHByb21JRCl7XG5cblx0aWYodGhpcy5wZWVyc1twcm9tSURdKXtcblx0XHR2YXIgcCA9IHRoaXMucGVlcnNbcHJvbUlEXTtcblx0XHRwLmNsb3NlKCk7XG5cblx0XHRmb3IodmFyIGk9MDsgaSA8IHAuY2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0ZGVsZXRlIHRoaXMudXNlZENoYW5uZWxzW3AuY2hhbm5lbHNbaV1dO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLnBlZXJzW3Byb21JRF07XG5cdH1cbn1cblxuUlRDLnByb3RvdHlwZS5fbWF0Y2hDaGFubmVscyA9IGZ1bmN0aW9uKHJlY2VpdmVkQ2hhbm5lbHMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly9Db250YWlucyBhbGwgY2hhbm5lbHMgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byBDb25uZWN0IGFzIG9iamVjdHNcblx0dmFyIGNoYW5uZWxzID0gW107XG5cblx0Zm9yKHZhciBpID0gMDsgaSA8IHJlY2VpdmVkQ2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdHZhciBuYW1lID0gcmVjZWl2ZWRDaGFubmVsc1tpXTtcblx0XHRcblx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhhdC5yZXF1ZXN0ZWRDaGFubmVscy5sZW5ndGg7IGorKyl7XG5cdFx0XHR2YXIgcmVxID0gdGhhdC5yZXF1ZXN0ZWRDaGFubmVsc1tqXTtcblx0XHRcdFxuXHRcdFx0aWYobmFtZSAmJiBuYW1lLm1hdGNoKHJlcS5yZWdleCkgJiYgIXRoYXQudXNlZENoYW5uZWxzW25hbWVdKXtcblx0XHRcdFx0dGhhdC51c2VkQ2hhbm5lbHNbbmFtZV0gPSBuZXcgQ2hhbm5lbChuYW1lLCByZXEuY2IpO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpOyAvL3ByZXBhcmUgdGhlIGNvbm5lY3Qgb2JqZWN0IGxpc3Rcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2hhbm5lbHM7XG59O1xuXG5SVEMucHJvdG90eXBlLl9vbkRhdGFDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHRjb25zb2xlLmxvZyhcIkNoYW5uZWwgXCIrZGF0YWNoYW5uZWwubGFiZWwrXCIgY3JlYXRlZCAhXCIpO1xuXG5cdHZhciBjaGFubmVsID0gdGhpcy51c2VkQ2hhbm5lbHNbZGF0YWNoYW5uZWwubGFiZWxdO1xuXHRpZighY2hhbm5lbCl7XG5cdFx0ZGF0YWNoYW5uZWwuY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Y2hhbm5lbC5zZXRDaGFubmVsKGRhdGFjaGFubmVsKTtcbn1cblxuXG52YXIgZXhwID0ge1xuXHRcdFJUQzogUlRDXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwOyBcbiIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cbmZ1bmN0aW9uIFVwZGF0ZShub2RlKXtcdFxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHJldHVybiB0aGlzO1xufVxuXG5VcGRhdGUucHJvdG90eXBlLnN0YXR1c0xvY2tBcHQgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cdFxuXHQvKnRoaXMubm9kZS5nZXQoe1xuXHRcdFx0c2VydmljZTogJ3VwZGF0ZScsXG5cdFx0XHRmdW5jOiAnTG9ja1N0YXR1cydcblx0XHR9LGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0aWYoZGF0YS5sb2NrU3RhdHVzKSBcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLmxvY2tTdGF0dXMpOyBcblx0fSk7Ki9cblx0XG5cdHRoaXMubm9kZS5saXN0ZW4oe1xuXHRcdFx0c2VydmljZTogJ3VwZGF0ZScsXG5cdFx0XHRmdW5jOiAnU3Vic2NyaWJlTG9ja1N0YXR1cydcblx0XHR9LCBcblx0XHRmdW5jdGlvbihyZXMpe1xuXHRcdFx0Y2FsbGJhY2sobnVsbCxyZXMubG9ja1N0YXR1cyk7XG5cdFx0XHRjb25zb2xlLmxvZyhyZXMubG9ja1N0YXR1cyk7XG5cdFx0fSk7XG5cbn1cblxuVXBkYXRlLnByb3RvdHlwZS5saXN0UGFja2FnZXMgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3VwZGF0ZScsXG5cdFx0ZnVuYzogJ0xpc3RQYWNrYWdlcydcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0aWYoZGF0YS5wYWNrYWdlcykgXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGFja2FnZXMpOyBcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHRcblx0fSk7IFxufVxuXHRcblVwZGF0ZS5wcm90b3R5cGUudXBkYXRlQWxsID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICd1cGRhdGUnLFxuXHRcdGZ1bmM6ICdVcGRhdGVBbGwnXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdGlmKGRhdGEucGFja2FnZXMpIFxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBhY2thZ2VzKTsgXG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdH0pOyBcbn1cblx0XG5VcGRhdGUucHJvdG90eXBlLmluc3RhbGxQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjayl7XG5cdFx0XG5cdGlmICgocGtnID09PSAnVW5kZWZpbmVkJykgfHwgKHR5cGVvZiBwa2cgIT09ICdzdHJpbmcnKSB8fCAocGtnLmxlbmd0aCA8IDIpKXtcblx0XHRjYWxsYmFjaygndW5kZWZpbmVkUGFja2FnZScsbnVsbCk7XG5cdH1cblx0ZWxzZSB7XG5cdFxuXHRcdHZhciBJTlZBTElEX1BBUkFNRVRFUlNfUkVHRVggPSAvXi18W15cXHNdXFxzK1teXFxzXXwtJC87XG5cdFx0dmFyIHRlc3ROYW1lUGtnPSBJTlZBTElEX1BBUkFNRVRFUlNfUkVHRVgudGVzdChwa2cpO1xuXHRcdGlmICh0ZXN0TmFtZVBrZylcblx0XHRcdGNhbGxiYWNrKFwiSW52YWxpZFBhcmFtZXRlcnNcIixudWxsKTtcblx0XHRlbHNle1xuXHRcdFx0XHRcblx0XHRcdHRoaXMubm9kZS5nZXQoe1xuXHRcdFx0XHRzZXJ2aWNlOiAndXBkYXRlJyxcblx0XHRcdFx0ZnVuYzogJ0luc3RhbGxQYWNrYWdlJyxcblx0XHRcdFx0ZGF0YTp7XG5cdFx0XHRcdFx0cGFja2FnZTogcGtnLFxuXHRcdFx0XHR9XG5cdFx0XHR9LCBmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0aWYoZGF0YS5wYWNrYWdlcykgXG5cdFx0XHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBhY2thZ2VzKTsgXG5cdFx0XHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0XG59XG5cblVwZGF0ZS5wcm90b3R5cGUucmVtb3ZlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spe1xuXHRcdFxuXHRpZiAoKHBrZyA9PT0gJ1VuZGVmaW5lZCcpIHx8ICh0eXBlb2YgcGtnICE9PSAnc3RyaW5nJykgfHwgKHBrZy5sZW5ndGggPCAyKSl7XG5cdFx0Y2FsbGJhY2soJ3VuZGVmaW5lZFBhY2thZ2UnLG51bGwpO1xuXHR9XG5cdGVsc2Uge1xuXHRcblx0XHR2YXIgSU5WQUxJRF9QQVJBTUVURVJTX1JFR0VYID0gL15bKyAtXXxbXlxcc11cXHMrW15cXHNdfFsrIC1dJC87XG5cdFx0dmFyIHRlc3ROYW1lUGtnPSBJTlZBTElEX1BBUkFNRVRFUlNfUkVHRVgudGVzdChwa2cpO1xuXHRcdGlmICh0ZXN0TmFtZVBrZylcblx0XHRcdGNhbGxiYWNrKFwiSW52YWxpZFBhcmFtZXRlcnNcIixudWxsKTtcblx0XHRlbHNle1xuXHRcdFx0XHRcblx0XHRcdHRoaXMubm9kZS5nZXQoe1xuXHRcdFx0XHRzZXJ2aWNlOiAndXBkYXRlJyxcblx0XHRcdFx0ZnVuYzogJ1JlbW92ZVBhY2thZ2UnLFxuXHRcdFx0XHRkYXRhOntcblx0XHRcdFx0XHRwYWNrYWdlOiBwa2csXG5cdFx0XHRcdH1cblx0XHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRpZihkYXRhLnBhY2thZ2VzKSBcblx0XHRcdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGFja2FnZXMpOyBcblx0XHRcdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRcbn1cblx0XHRcblx0XHRcbnZhciBleHAgPSB7XG5cdFx0VXBkYXRlOiBVcGRhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7IFxuIl19
