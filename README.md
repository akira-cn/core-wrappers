# Core-wrappers

[![npm status](https://img.shields.io/npm/v/core-wrappers.svg)](https://www.npmjs.org/package/core-wrappers)
[![build status](https://api.travis-ci.org/akira-cn/core-wrappers.svg?branch=master)](https://travis-ci.org/akira-cn/core-wrappers) 
[![dependency status](https://david-dm.org/akira-cn/core-wrappers.svg)](https://david-dm.org/akira-cn/core-wrappers) 
[![coverage status](https://img.shields.io/coveralls/akira-cn/core-wrappers.svg)](https://coveralls.io/github/akira-cn/core-wrappers)

Core-wrappers is a small library exporting basic wrapper functions compatible with [ES7 Decorators](https://github.com/wycats/javascript-decorators). 

## Use it in nodeJS

A version compiled to ES5 in CJS format is published to npm as core-wrappers.

```bash
npm install core-wrappers
```

## Use it on browser

**core-wrappers CDN**

```html
<script src="https://s5.ssl.qhimg.com/!2a2ec8a7/core-wrappers.min.js"></script>
```

You can use it with any AMD loader or **standalone**

```js
function test(){
	console.log(1);
}

test = CoreWrappers.once(test);

test();
test(); //WARN: This function should not be called more than 1 times.
```

## Wrappers

##### For both Wrappers and Decorates

* [@allow](#allow)
* [@bind](#bind)
* [@debounce](#debounce)
* [@defer](#defer)
* [@deprecate](#deprecate)
* [@methodize](#methodize)
* [@multicast](#multicast)
* [@observable](#observable)
* [@once](#once)
* [@promisify](#promisify)
* [@repeat](#repeat)
* [@spread](#spread)
* [@supressWarnings](#supressWarnings)
* [@throttle](#throttle)

##### For Decorates only

* [@decorator](#decorator)
* [@toDecorator](#toDecorator)

## API Docs

### @allow

**allow(times, fn)**

Creates a version of the function that can only be called many time. Repeated calls to the modified function will have no effect, returning the value from the original call. Useful for initialization functions, instead of having to set a boolean flag and then check it later.

Wrapper:

```js
var allow = require('../src/core-wrappers').allow;

var initialize = allow(1, createApplication);
initialize();
initialize();
// Application is only created once.
```

Decorator:

```js
const w = require('../src/core-wrappers');
const allow = w.toDecorator(w.allow);

let times = 0;

class Foo{
	constructor(){
		initialize();
	}
	@allow(1)
	initialize(){
	  return times++;
	}
}

let f = new Foo(), f2 = new Foo();
expect(times).to.equal(1);
```

### @bind

**bind(...args, fn)**

Forces invocations of this function to always have `this` refer to the class instance, even if the function is passed around or would otherwise lose its `this` context. e.g. `var fn = context.method;` Popular with React components.

Wrapper:

```js
var bind = require('../src/core-wrappers').bind;

function Person(name){
	this.name = name;
}
Person.prototype.getName = function(){
	return this.name;
}

var akira = new Person('akira');
akira.getName = bind(akira, akira.getName);
var getName = akira.getName;
console.log(getName()); //akira
```

Decorator:

```js
const w = require('../src/core-wrappers');

const bind = w.toDecorator(function(fn){
  let {target, key, descriptor} = this;

  delete descriptor.value;
  delete descriptor.writable;

  descriptor.set = function(value){
    target[key] = value;
  }

  descriptor.get = function(){
    return fn.bind(this);
  }

  return descriptor;
});

class Person {
  constructor(name){
  	this.name =name;
  }
  @bind
  getName() {
  	return this.name;
  }
}

const akira = new Person('akira');
akira.getName = bind(akira, akira.getName);
let getName = akira.getName;
console.log(getName()); //akira
```

### @debounce

**debounce(wait, immediate, fn)**

Creates and returns a new debounced version of the passed function which will postpone its execution until after wait milliseconds have elapsed since the last time it was invoked. Useful for implementing behavior that should only happen after the input has stopped arriving. For example: rendering a preview of a Markdown comment, recalculating a layout after the window has stopped being resized, and so on.

At the end of the wait interval, the function will be called with the arguments that were passed most recently to the debounced function.

Pass true for the immediate argument to cause debounce to trigger the function on the leading instead of the trailing edge of the wait interval. Useful in circumstances like preventing accidental double-clicks on a "submit" button from firing a second time.

Wrapper:

```js
var w = require('../src/core-wrappers');

var i = 0;
function inc(){
  i++;
}
var inc1 = w.debounce(100, inc);
inc1();
inc1();
inc1();
expect(i).to.equal(0);
setTimeout(function(){
  console.log(i); //2
  inc1();
  inc1();
  inc1();
}, 150);
setTimeout(function(){
  console.log(i); //3
  done();
}, 550);   

var inc2 = w.debounce(100, true, inc);
inc2();
inc2();
inc2();
console.log(i); //1   
```

Decorator:

```js
const w = require('../src/core-wrappers');
const debounce = w.toDecorator(w.debounce);

class Foo{
  constructor(i){
    this.i = i;
  }
  @debounce(100, true)
  inc(){
    this.i++;
  }
}

let foo = new Foo(0);
foo.inc();
foo.inc();
foo.inc();
console.log(foo.i); //1

setTimeout(function(){
  foo.inc();
  console.log(foo.i); //2
}, 150);
```

### @decorator

**decorator(wrapper, ...args)**

Immediately applies the provided wrapper and arguments to the method.

```js
const w = require('../src/core-wrappers');
const decorator = w.decorator;

class Foo{
  @decorator(w.allow, 2)
  bar(){
    return 1;
  }
}

let f = new Foo();
expect(f.bar()).to.equal(1);
expect(f.bar()).to.equal(1);
expect(f.bar()).to.equal(undefined);
```

### @defer

**defer(promisify, fn)**

Defers invoking the func until the current call stack has cleared. Any additional arguments are provided to func when it’s invoked.

If promisify is true, it returns a promise otherwise it returns the timer id.

Wrapper:

```js
var w = require('../src/core-wrappers');

var i = 0;
function inc(){
  return i++;
}
inc = w.defer(inc);
inc();
expect(i).to.equal(0);
process.nextTick(function(ret){
  console.log(ret); //0
  console.log(i); //1
});
```

Decorator:

```js
const w = require('../src/core-wrappers');
const defer = w.toDecorator(w.defer);

class Foo{
  constructor(i){
    this.i = i;
  }

  @defer(true)
  inc(){
    return this.i++;
  }
}

let foo = new Foo(0);
foo.inc().then(function(ret){
  console.log(ret); //0
  console.log(foo.i); //1
});
```

### @delay

**delay(wait, promisify, fn)**

Invokes func after wait milliseconds. 

If promisify is true, it returns a promise otherwise it returns the timer id.

### @deprecate

**deprecate(message, url, fn)**

Calls console.warn() with a deprecation message. Provide a custom message to override the default one. You can also provide a url, for further reading.

```js
const w = require('../src/core-wrappers');

const deprecate = w.toDecorator(function(msg, url, fn){
  if(typeof msg === 'function'){
    fn = msg;
    msg = 'This function will be removed in future versions.';
    url = null;
  }
  if(typeof url === 'function'){
    fn = url;
    url = null;
  }

  let {target, key, descriptor} = this;
  let methodSignature = `${target.constructor.name}#${key}`;

  return w.deprecate(`DEPRECATION ${methodSignature}: ${msg}`, url, fn);
});

const suppressWarnings = w.toDecorator(w.suppressWarnings);

class Foo{
  @deprecate
  bar(){

  }
  @deprecate('We stopped bar2', 'http://knowyourmeme.com/memes/facepalm')
  bar2(){

  }
  @suppressWarnings
  bar3(){
    this.bar();
  }
}
var foo = new Foo();
foo.bar();
foo.bar2();
foo.bar3();
```

### @methodize

**methodize(fn)**

Add the `this context` to the first argument of the function.

```js
let methodize = w.toDecorator(w.methodize);

class Foo{
  x = 1;
  @methodize
  bar(self, y){
    return self.x + y;
  }
}

var foo = new Foo();
expect(foo.bar(2)).to.equal(3);
```

### @multicast

**multicast(fn)**

Allow the first argument of the function be an array and invokes function with the elements of the array one by one.

Wrapper:

```js
var w = require('../src/core-wrappers');

function setColor(el, color){
    return el.style.color = color;
}

var setColorMany = w.multicast(setColor);

var els = document.querySelectorAll("ul>li:nth-child(2n+1)");
console.log(els);
setColorMany(Array.from(els), "red");
```

Decorator:

```js
const w = require('../src/core-wrappers');
let multicast = w.toDecorator(w.multicast);
let spread = w.toDecorator(w.spread);

class Collection {
  constructor(){
    this.items = [];
  }

  @spread
  @multicast
  append(item){
    this.items.push(item);
    return this.items.slice(-1)[0];
  }
}

var c = new Collection();
c.append(1,2,3);
expect(c.items[1]).to.equal(2); //2
```

### @multiset

**multiset(fn)**

Allow setter's first argument to be a json object.

```js
const w = require('../src/core-wrappers');
let multiset = w.toDecorator(w.multiset);

class Store{
  constructor(){
    this.map = {};
  }
  @multiset
  setItem(key, value){
    this.map[key] = value;
  }
}

let store = new Store();
store.setItem('a', 1);
store.setItem({b:2, c:3});

expect(store.a).to.equal(1);
expect(store.b).to.equal(2);
expect(store.c).to.equal(3);
```

### @observable

**observable(fn)**

Let function to be observable so we can trigger `before` and `after` events when the function is invoked. 

```js
var w = require('../src/core-wrappers');

function add(x, y){
  return x + y;
}
expect(add(1,2)).to.equal(3);

add = w.observable(add);

add.before = function(args){
  args[1] += 4;
}

expect(add(1,2)).to.equal(7);
```

### @once

**once(fn)**

This wrapper is the shortcut of [allow(1, fn)](#allow).

### @promisify

**promisify(fn)**

Transform a function with callback(err, ...args) to a promise style.

Wrapper:

```js
var w = require('../src/core-wrappers');

var fs = require('fs');

var readFile = w.promisify(fs.readFile);

readFile('/path/to/file').then(function(data){

});
```

Decorator:

```js
const w = require('../src/core-wrappers');
let promisify = w.toDecorator(w.promisify);

class Site{
  constructor(url){
    this.url = url;
  }
  @promisify
  getData(callback){
    let request = require('request');
    request(this.url, callback);
  }
}

var site = new Site('https://registry.npmjs.org/core-wrappers');
site.getData().then(function(res){
  var data = JSON.parse(res[1]);
  expect(data.name).to.equal('core-wrappers');
  done();
});
```

### @repeat

**repeat(times, wait, fn)**

Call function many times.

### @spread

**spread(fn)**

See [multicast](#multicast)

### @suppressWarnings

**suppressWarnings(fn)**

See [deprecate](#deprecate)

### @throttle

**throttle(wait, options, fn)**

Creates and returns a new, throttled version of the passed function, that, when invoked repeatedly, will only actually call the original function at most once per every wait milliseconds. Useful for rate-limiting events that occur faster than you can keep up with.

By default, throttle will execute the function as soon as you call it for the first time, and, if you call it again any number of times during the wait period, as soon as that period is over. If you'd like to disable the leading-edge call, pass {leading: false}, and if you'd like to disable the execution on the trailing-edge, pass 
{trailing: false}.

```js
var w = require('../src/core-wrappers');

var i = 0;
function inc(){
  i++;
}
inc = w.throttle(500, {leading:false}, inc);
inc();
expect(i).to.equal(0);
setTimeout(function(){
  console.log(i); //1
}, 550);
```

## LISENSE

[MIT](LISENSE)
