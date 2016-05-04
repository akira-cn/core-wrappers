'use strict'

var slice = Array.prototype.slice;

function allow(maxTime, fn){
  var times = maxTime;
  return function(){
    if(times-- > 0){
      return fn.apply(this, arguments);
    }else{
      console.warn('This function should not be called more than ' + maxTime + ' times.');
    }
  }
}

function bind(){
  var fn = arguments[arguments.length - 1],
      args = slice.call(arguments, 0, -1);

  return fn.bind.apply(fn, args);
}

//from underscore
function debounce(wait, immediate, fn){
  if(typeof immediate === 'function'){
    fn = immediate;
    immediate = false;
  }

  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;

      if (!immediate) {
        result = fn.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;

    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = fn.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

function decorator(wrapper){
  var args = slice.call(arguments, 1);
  return toDecorator(wrapper).apply(null, args);
}

function defer(promisify, fn){
  if(typeof promisify === 'function'){
    fn = promisify;
    promisify = false;
  }

  return function () {
    var context = this,
        args = arguments;
    var nextTick = typeof process !== 'undefined' ? 
      process.nextTick : setTimeout;
    
    if(promisify){
      return new Promise(function(resolve){
        nextTick(function(){
          resolve(fn.apply(context, args));
        });
      });

    }else{
      return nextTick(function(){
        return fn.apply(context, args);
      });
    }
  };  
}

function delay(wait, promisify, fn){
  if(typeof promisify === 'function'){
    fn = promisify;
    promisify = false;
  }

  return function(){
    var context = this,
        args = arguments;

    if(promisify){
      return new Promise(function(resolve){
        setTimeout(function(){
          resolve(fn.apply(context, args));
        }, wait);
      });
    }else{
      return setTimeout(function(){
          return fn.apply(context, args);
      }, wait);
    }
  };
}

function deprecate(msg, url, fn){
  if(typeof msg === 'function'){
    fn = msg;
    msg = 'This function will be removed in future versions.';
    url = null;
  }
  if(typeof url === 'function'){
    fn = url;
    url = null;
  }

  if(url){
    msg += '\n\tSee ' + url + ' for more details.';
  }

  return function(){
    console.warn(msg);
    return fn.apply(this, arguments);
  }
}

function enumerable(target, key, isEnumerable, fn){
  Object.defineProperty(target, key, {
    value: fn,
    enumerable: !(isEnumerable === false)
  });

  return target[key];
}

function methodize(){
  var fn = arguments[arguments.length - 1];

  if(arguments.length <= 1){
    return function(){
      var args = slice.call(arguments);
      return fn.apply(null, [this].concat(args));
    }
  }else{
    var targets = slice.call(arguments, 0, -1);
    return function(){
      var args = slice.call(arguments);
      var context = this;
      return fn.apply(null, targets.map(function(target){
        return context[target];
      }).concat(args));
    }
  }
}

function multicast(fn){
  return function(list) {
    var rest = slice.call(arguments, 1);
    if(Array.isArray(list)){
      var context = this;
      return list.map(function(item){
        return fn.apply(context, [item].concat(rest))
      });
    }else{
      var item = list;
      return fn.apply(this, [item].concat(rest));
    }
  }
}

function multiset(fn){
  return function(key, value){
    if(typeof key !== 'string'){
      for(var i in key){
        fn.call(this, i, key[i]);
      }
    }
  }
}

function observable(fn){
  return function p(){
    var args = slice.call(arguments);

    if(p.before){
      var _r = p.before.call(this, args)
    }

    if(_r === false) return;

    var ret = fn.apply(this, args);

    if(p.after){
      var _r = p.after.call(this, ret);
      if(_r !== undefined) ret = _r;
    }
    return ret;
  }
}

function once(fn){
  return allow(1, fn);
}

function promisify(fn){
  return function(){  
    var args = slice.call(arguments),
        context = this;

    return new Promise(function(resolve, reject){
      args.push(function(err){
        var args = slice.call(arguments, 1);

        if(!err){
          resolve(args);
        }else{
          reject(err);
        }
      });

      fn.apply(context, args);
    });
  }
}

function readonly(target, key, fn){
  Object.defineProperty(target, key, {
    value: fn,
    writable: false,
    configurable: false
  });

  return target[key];
}

function reduce(fn){
  return function(){
    var args = slice.call(arguments);
    return args.reduce(fn);
  }
}

function repeat(times, wait, fn){
  if(typeof wait === 'function'){
    fn = wait;
    wait = 0;
  }

  if(!wait){
    return function(){
      var ret = [];
      for(var i = 0; i < times; i++){
        ret.push(fn.apply(this, arguments));
      }
      return ret;
    }
  }else{
    return function(){
      var i = 0, context = this,
          args = arguments;

      setTimeout(function next(){
        fn.apply(context, args);
        if(i++ < times){
          next();
        }
      }, wait);
    }
  }
}

function spread(fn){
  return function(){
    var args = slice.call(arguments);
    return fn.call(this, args);
  }
}

function suppressWarnings(fn){
  return function(){
    var nativeWarn = console.warn;
    console.warn = function(){};
    var ret = fn.apply(this, arguments);
    console.warn = nativeWarn;
    return ret;
  }
}

//from underscore
function throttle(wait, options, fn){
  if(typeof options === 'function'){
    fn = options;
    options = {};
  }

  var context, args, result;
  var timeout = null;

  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = fn.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    var now = Date.now();

    if (!previous && options.leading === false) previous = now;

    var remaining = wait - (now - previous);
    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = fn.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };  
}

//-------------------------------------------

function isDescriptor(desc){
  if (!desc || !desc.hasOwnProperty) {
    return false;
  }

  var keys = ['value', 'initializer', 'get', 'set'];

  for (var i = 0, l = keys.length; i < l; i++) {
    if (desc.hasOwnProperty(keys[i])) {
      return true;
    }
  }

  return false;
}

function toDecorator(wrapper){
  return function(){
    if(arguments.length === 3 && isDescriptor(arguments[2])){
      var target = arguments[0],
          key = arguments[1],
          descriptor = arguments[2];

      var ret = wrapper.call({
        target: target,
        key: key,
        descriptor: descriptor
      }, descriptor.value || target[key]);
      
      if(typeof ret === 'function'){
        descriptor.value = ret;
      }
      return descriptor;     
    }else{
      var args = slice.call(arguments);

      return function(target, key, descriptor){
        var ret = wrapper.apply({
          target: target,
          key: key,
          descriptor: descriptor
        }, args.concat([descriptor.value || target[key]]));

        if(typeof ret === 'function'){
          descriptor.value = ret;
        }
        return descriptor;
      }
    }
  }
};

var decoratorWrapper = {
  bind: function(fn){
    var target = this.target, key = this.key, 
        descriptor = this.descriptor;

    delete descriptor.value;
    delete descriptor.writable;

    descriptor.set = function(value){
      target[key] = value;
    }

    descriptor.get = function(){
      // use fn reference as identifier which can ensure every function uniquely after wrapped
      return this[fn] || (this[fn] = bind(this, fn));
    }

    return descriptor;
  },

  deprecate: function(msg, url, fn){
    if(typeof msg === 'function'){
      fn = msg;
      msg = 'This function will be removed in future versions.';
      url = null;
    }
    if(typeof url === 'function'){
      fn = url;
      url = null;
    }

    var target = this.target, key = this.key, 
        descriptor = this.descriptor;

    var methodSignature = target.constructor.name + '#' + key;

    return deprecate('DEPRECATION ' + methodSignature + ':' + msg, url, fn);    
  },

  enumerable: function(isEnumerable){
    var target = this.target, key = this.key, 
        descriptor = this.descriptor;

    descriptor.enumerable = !(isEnumerable === false);

    return descriptor;
  },

  readonly: function(){
    var target = this.target, key = this.key, 
        descriptor = this.descriptor;

    descriptor.writable = false;
    descriptor.configurable = false;

    return descriptor;
  }
}

function getDecorator(fn){
  if(!fn || fn === 'decorator'){
    return decorator;
  }else if(typeof fn === 'string'){
    return toDecorator(decoratorWrapper[fn] || wrapper[fn]);
  }else{
    for(var i in wrapper){
      if(wrapper[i] === fn){
        return toDecorator(decoratorWrapper[i] || wrapper[i]);
      }
    }
    return toDecorator(fn);
  }
}

var wrapper = module.exports = {
  allow: allow,
  bind: bind,
  debounce: debounce,
  decorator: decorator,
  defer: defer,
  delay: delay,
  deprecate: deprecate,
  enumerable: enumerable,
  methodize: methodize,
  multicast: multicast,
  multiset: multiset,
  observable: observable,
  once: once,
  promisify: promisify,
  readonly: readonly,
  reduce: reduce,
  repeat: repeat,
  spread: spread,
  suppressWarnings: suppressWarnings,
  throttle: throttle,
  //toDecorator: toDecorator,
  getDecorator: getDecorator
}
