'use strict';

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var expect = require('chai').expect;

var w;
try {
  w = require('../test-cov/core-wrappers');
} catch (ex) {
  w = require('../src/core-wrappers');
}

describe('Core Wrappers', function () {
  describe('wrappers', function () {

    it('allow', function () {
      var i = 0;
      function test() {
        return ++i;
      }
      test = w.allow(2, test);
      expect(test()).to.equal(1);
      expect(test()).to.equal(2);
      expect(test()).to.equal(undefined);
    });

    it('bind', function () {
      function test() {
        return this.x;
      }
      test = w.bind({ x: 1 }, test);
      expect(test()).to.equal(1);
    });

    it('once', function () {
      var i = 0;
      function test() {
        return ++i;
      }
      test = w.once(test);
      expect(test()).to.equal(1);
      expect(test()).to.equal(undefined);
    });

    it('delay', function (done) {
      var i = 0;
      function inc() {
        return i++;
      }
      inc = w.delay(100, inc);
      inc();
      expect(i).to.equal(0);
      setTimeout(function () {
        expect(i).to.equal(1);
        done();
      }, 150);

      var j = 0;
      function inc2() {
        return j++;
      }

      inc2 = w.delay(50, true, inc2);
      expect(j).to.equal(0);

      inc2().then(function (res) {
        expect(j).to.equal(1);
      });
    });

    it('defer', function (done) {
      var i = 0;
      function inc() {
        return i++;
      }
      inc = w.defer(inc);
      inc();
      expect(i).to.equal(0);
      process.nextTick(function () {
        expect(i).to.equal(1);
        done();
      });
    });

    it('methodize', function () {
      var foo = {
        x: 1,
        bar: w.methodize(function (self, y) {
          return self.x + y;
        })
      };
      expect(foo.bar(2)).to.equal(3);
    });

    it('repeat', function () {
      var i = 0;
      function inc() {
        i++;
      }
      inc = w.repeat(5, inc);
      inc();
      expect(i).to.equal(5);
    });

    it('throttle', function (done) {
      var i = 0;
      function inc() {
        i++;
      }
      inc = w.throttle(500, { leading: false }, inc);
      inc();
      expect(i).to.equal(0);
      setTimeout(function () {
        expect(i).to.equal(1);
        done();
      }, 550);
    });

    it('debounce', function (done) {
      var i = 0;
      function inc() {
        i++;
      }
      var inc1 = w.debounce(100, inc);
      inc1();
      inc1();
      inc1();
      expect(i).to.equal(0);
      setTimeout(function () {
        expect(i).to.equal(2);
        inc1();
        inc1();
        inc1();
      }, 150);
      setTimeout(function () {
        expect(i).to.equal(3);
        done();
      }, 550);

      var inc2 = w.debounce(100, true, inc);
      inc2();
      inc2();
      inc2();
      expect(i).to.equal(1);
    });

    it('observable', function () {
      function add(x, y) {
        return x + y;
      }
      expect(add(1, 2)).to.equal(3);

      add = w.observable(add);

      add.before = function (args) {
        args[1] += 4;
      };

      expect(add(1, 2)).to.equal(7);
    });

    it('promisify', function (done) {
      function test(x, callback) {
        setTimeout(function () {
          callback(null, x);
        }, 100);
      }

      test = w.promisify(test);
      test(10).then(function (res) {
        expect(res[0]).to.equal(10);
        done();
      });
    });
  });

  //ES6
  describe('decorators', function () {

    it('allow', function () {
      var _dec, _desc, _value, _class;

      //var allow = w.toDecorator(w.allow);
      var decorator = w.decorator;

      var Foo = (_dec = decorator(w.allow, 2), (_class = function () {
        function Foo() {
          (0, _classCallCheck3.default)(this, Foo);
        }

        (0, _createClass3.default)(Foo, [{
          key: 'bar',
          value: function bar() {
            return 1;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class.prototype, 'bar', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'bar'), _class.prototype)), _class));


      var f = new Foo();
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(undefined);
    });

    it('bind', function () {
      var _desc2, _value2, _class2;

      var bind = w.toDecorator(function (fn) {
        var target = this.target;
        var key = this.key;
        var descriptor = this.descriptor;


        delete descriptor.value;
        delete descriptor.writable;

        descriptor.set = function (value) {
          target[key] = value;
        };

        descriptor.get = function () {
          return fn.bind(this);
        };

        return descriptor;
      });

      var Foo = (_class2 = function () {
        function Foo() {
          (0, _classCallCheck3.default)(this, Foo);

          this.x = 1;
        }

        (0, _createClass3.default)(Foo, [{
          key: 'bar',
          value: function bar() {
            return this.x;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class2.prototype, 'bar', [bind], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'bar'), _class2.prototype)), _class2);

      var foo = new Foo();
      var bar = foo.bar;
      expect(bar()).to.equal(1);
    });

    it('debounce', function (done) {
      var _dec2, _desc3, _value3, _class3;

      var debounce = w.toDecorator(w.debounce);

      var Foo = (_dec2 = debounce(100, true), (_class3 = function () {
        function Foo(i) {
          (0, _classCallCheck3.default)(this, Foo);

          this.i = i;
        }

        (0, _createClass3.default)(Foo, [{
          key: 'inc',
          value: function inc() {
            this.i++;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class3.prototype, 'inc', [_dec2], (0, _getOwnPropertyDescriptor2.default)(_class3.prototype, 'inc'), _class3.prototype)), _class3));


      var foo = new Foo(0);
      foo.inc();
      foo.inc();
      foo.inc();
      expect(foo.i).to.equal(1);

      setTimeout(function () {
        foo.inc();
        expect(foo.i).to.equal(2);
        done();
      }, 150);
    });

    it('defer', function (done) {
      var _dec3, _desc4, _value4, _class4;

      var defer = w.toDecorator(w.defer);

      var Foo = (_dec3 = defer(true), (_class4 = function () {
        function Foo(i) {
          (0, _classCallCheck3.default)(this, Foo);

          this.i = i;
        }

        (0, _createClass3.default)(Foo, [{
          key: 'inc',
          value: function inc() {
            return this.i++;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class4.prototype, 'inc', [_dec3], (0, _getOwnPropertyDescriptor2.default)(_class4.prototype, 'inc'), _class4.prototype)), _class4));


      var foo = new Foo(0);
      foo.inc().then(function (ret) {
        expect(ret).to.equal(0);
        expect(foo.i).to.equal(1);
        done();
      });
    });

    it('deprecate', function () {
      var _dec4, _desc5, _value5, _class5;

      var deprecate = w.toDecorator(function (msg, url, fn) {
        if (typeof msg === 'function') {
          fn = msg;
          msg = 'This function will be removed in future versions.';
          url = null;
        }
        if (typeof url === 'function') {
          fn = url;
          url = null;
        }

        var target = this.target;
        var key = this.key;
        var descriptor = this.descriptor;

        var methodSignature = target.constructor.name + '#' + key;

        return w.deprecate('DEPRECATION ' + methodSignature + ': ' + msg, url, fn);
      });

      var suppressWarnings = w.toDecorator(w.suppressWarnings);

      var Foo = (_dec4 = deprecate('We stopped bar2', 'http://knowyourmeme.com/memes/facepalm'), (_class5 = function () {
        function Foo() {
          (0, _classCallCheck3.default)(this, Foo);
        }

        (0, _createClass3.default)(Foo, [{
          key: 'bar',
          value: function bar() {}
        }, {
          key: 'bar2',
          value: function bar2() {}
        }, {
          key: 'bar3',
          value: function bar3() {
            this.bar();
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class5.prototype, 'bar', [deprecate], (0, _getOwnPropertyDescriptor2.default)(_class5.prototype, 'bar'), _class5.prototype), _applyDecoratedDescriptor(_class5.prototype, 'bar2', [_dec4], (0, _getOwnPropertyDescriptor2.default)(_class5.prototype, 'bar2'), _class5.prototype), _applyDecoratedDescriptor(_class5.prototype, 'bar3', [suppressWarnings], (0, _getOwnPropertyDescriptor2.default)(_class5.prototype, 'bar3'), _class5.prototype)), _class5));

      var foo = new Foo();
      foo.bar();
      foo.bar2();
      foo.bar3();
    });

    it('methodize', function () {
      var _desc6, _value6, _class6;

      var methodize = w.toDecorator(w.methodize);

      var Foo = (_class6 = function () {
        function Foo() {
          (0, _classCallCheck3.default)(this, Foo);
          this.x = 1;
        }

        (0, _createClass3.default)(Foo, [{
          key: 'bar',
          value: function bar(self, y) {
            return self.x + y;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class6.prototype, 'bar', [methodize], (0, _getOwnPropertyDescriptor2.default)(_class6.prototype, 'bar'), _class6.prototype)), _class6);


      var foo = new Foo();
      expect(foo.bar(2)).to.equal(3);
    });

    it('multicast', function () {
      var _desc7, _value7, _class8;

      var multicast = w.toDecorator(w.multicast);
      var spread = w.toDecorator(w.spread);

      var Collection = (_class8 = function () {
        function Collection() {
          (0, _classCallCheck3.default)(this, Collection);

          this.items = [];
        }

        (0, _createClass3.default)(Collection, [{
          key: 'append',
          value: function append(item) {
            this.items.push(item);
            return this.items.slice(-1)[0];
          }
        }]);
        return Collection;
      }(), (_applyDecoratedDescriptor(_class8.prototype, 'append', [spread, multicast], (0, _getOwnPropertyDescriptor2.default)(_class8.prototype, 'append'), _class8.prototype)), _class8);


      var c = new Collection();
      c.append(1, 2, 3);
      expect(c.items[1]).to.equal(2); //2
    });

    if ('multiset', function () {
      var _desc8, _value8, _class9;

      var multiset = w.toDecorator(w.multiset);

      var Store = (_class9 = function () {
        function Store() {
          (0, _classCallCheck3.default)(this, Store);

          this.map = {};
        }

        (0, _createClass3.default)(Store, [{
          key: 'setItem',
          value: function setItem(key, value) {
            this.map[key] = value;
          }
        }]);
        return Store;
      }(), (_applyDecoratedDescriptor(_class9.prototype, 'setItem', [multiset], (0, _getOwnPropertyDescriptor2.default)(_class9.prototype, 'setItem'), _class9.prototype)), _class9);


      var store = new Store();
      store.setItem('a', 1);
      store.setItem({ b: 2, c: 3 });

      expect(store.a).to.equal(1);
      expect(store.b).to.equal(2);
      expect(store.c).to.equal(3);
    }) ;

    it('once', function () {
      var _desc9, _value9, _class10;

      var once = w.toDecorator(w.once);

      var times = 0;

      var Foo = (_class10 = function () {
        function Foo() {
          (0, _classCallCheck3.default)(this, Foo);

          this.initialize();
        }

        (0, _createClass3.default)(Foo, [{
          key: 'initialize',
          value: function initialize() {
            return times++;
          }
        }]);
        return Foo;
      }(), (_applyDecoratedDescriptor(_class10.prototype, 'initialize', [once], (0, _getOwnPropertyDescriptor2.default)(_class10.prototype, 'initialize'), _class10.prototype)), _class10);


      var f = new Foo(),
          f2 = new Foo();
      expect(times).to.equal(1);
    });
  });
});
