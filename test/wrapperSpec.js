var expect = require('chai').expect;

var w;
try{
  w = require('../test-cov/core-wrappers');
}catch(ex){
  w = require('../src/core-wrappers');
}

describe('Core Wrappers', function(){
  describe('wrappers', function(){

    it('allow', function(){
      var i = 0;
      function test(){
        return ++i;
      }
      test = w.allow(2, test);
      expect(test()).to.equal(1);
      expect(test()).to.equal(2);
      expect(test()).to.equal(undefined);
    });

    it('bind', function(){
      function test(){
        return this.x;
      }
      test = w.bind({x:1}, test);
      expect(test()).to.equal(1);
    });

    it('once', function(){
      var i = 0;
      function test(){
        return ++i;
      }
      test = w.once(test);
      expect(test()).to.equal(1);
      expect(test()).to.equal(undefined);
    });

    it('delay', function(done){
      var i = 0;
      function inc(){
        return i++;
      }
      inc = w.delay(100, inc);
      inc();
      expect(i).to.equal(0);
      setTimeout(function(){
        expect(i).to.equal(1);
        done();
      }, 150);

      var j = 0;
      function inc2(){
        return j++;
      }

      inc2 = w.delay(50, true, inc2);
      expect(j).to.equal(0);

      inc2().then(function(res){
        expect(j).to.equal(1);
      });
    });

    it('defer', function(done){
      var i = 0;
      function inc(){
        return i++;
      }
      inc = w.defer(inc);
      inc();
      expect(i).to.equal(0);
      process.nextTick(function(){
        expect(i).to.equal(1);
        done();
      });      
    });

    it('methodize', function(){
      var foo = {
        x : 1,
        bar : w.methodize(function(self, y){
          return self.x + y;
        })
      };
      expect(foo.bar(2)).to.equal(3);
    });

    it('enumerable', function(){
      var obj = {};

      w.enumerable(obj, 'add', false, function(x, y){
        return x + y;
      });

      expect(obj.add(1, 2)).to.equal(3);

      expect(Object.keys(obj).indexOf('add')).to.equal(-1);     
    });

    it('readonly', function(){
      var obj = {};

      w.readonly(obj, 'add', function(x, y){
        return x + y;
      });

      expect(obj.add(1, 2)).to.equal(3);

      try{
        obj.add = 11;
        delete obj.add;
      }catch(ex){}

      expect(obj.add(2, 3)).to.equal(5);
    });

    it('repeat', function(){
      var i = 0;
      function inc(){
        i++;
      }
      inc = w.repeat(5, inc);
      inc();
      expect(i).to.equal(5);
    });

    it('reduce', function(){
      function add(x, y){
        return x + y;
      }

      add = w.reduce(add);

      expect(add(1,2,3,4)).to.equal(10);
    });

    it('throttle', function(done){
      var i = 0;
      function inc(){
        i++;
      }
      inc = w.throttle(500, {leading:false}, inc);
      inc();
      expect(i).to.equal(0);
      setTimeout(function(){
        expect(i).to.equal(1);
        done();
      }, 550);
    });

    it('debounce', function(done){
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
        expect(i).to.equal(2);
        inc1();
        inc1();
        inc1();
      }, 150);
      setTimeout(function(){
        expect(i).to.equal(3);
        done();
      }, 550);   

      var inc2 = w.debounce(100, true, inc);
      inc2();
      inc2();
      inc2();
      expect(i).to.equal(1);       
    });

    it('observable', function(){
      function add(x, y){
        return x + y;
      }
      expect(add(1,2)).to.equal(3);

      add = w.observable(add);

      add.before = function(args){
        args[1] += 4;
      }

      expect(add(1,2)).to.equal(7);
    });

    it('promisify', function(done){
      function test(x, callback){
        setTimeout(function(){
          callback(null, x);
        }, 100);
      }

      test = w.promisify(test);
      test(10).then(function(res){
        expect(res[0]).to.equal(10);
        done();
      });
    });
  });

  //ES6
  describe('decorators', function(){

    it('allow', function(){
      var allow = w.getDecorator('allow');

      class Foo{
        @allow(2)
        bar(){
          return 1;
        }
      }

      var f = new Foo();
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(undefined);
    });

    it('decorator', function(){
      var decorator = w.getDecorator();

      class Foo{
        @decorator(w.allow, 2)
        bar(){
          return 1;
        }
      }

      var f = new Foo();
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(1);
      expect(f.bar()).to.equal(undefined);

      function twice(fn){
        return function(){
          return [fn.apply(this, arguments),
            fn.apply(this, arguments)];
        }
      }

      let doublecall = w.getDecorator(twice);

      class Foo2{
        constructor(){
          this.x = 0;
          this.y = 0;
        }
        @decorator(twice)
        bar(){
          this.x++;
        }
        @doublecall
        bar2(){
          this.y += 2;
        }
      }

      var f2 = new Foo2();
      f2.bar();
      f2.bar2();
      expect(f2.x).to.equal(2);
      expect(f2.y).to.equal(4);
    });

    it('bind', function(){
      var bind = w.getDecorator('bind');

      class Foo{
        constructor(){
          this.x = 1;
        }
        @bind
        bar(){
          return this.x;
        }
      }
      var foo = new Foo();
      var bar = foo.bar;
      expect(bar()).to.equal(1);
    });

    it('debounce', function(done){
      const debounce = w.getDecorator('debounce');

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
      expect(foo.i).to.equal(1);

      setTimeout(function(){
        foo.inc();
        expect(foo.i).to.equal(2);
        done();
      }, 150);
    });

    it('defer', function(done){
      const defer = w.getDecorator('defer');

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
        expect(ret).to.equal(0);
        expect(foo.i).to.equal(1);
        done();
      });
    });

    it('deprecate', function(){
      var deprecate = w.getDecorator('deprecate');

      var suppressWarnings = w.getDecorator('suppressWarnings');

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
    });

    it('methodize', function(){
      let methodize = w.getDecorator('methodize');

      class Foo{
        x = 1;
        y = 0;
        @methodize
        bar(self, y){
          self.y = y;
          return self.x + y;
        }
        @methodize('x','y')
        bar2(x, y, z){
          return x + y + z;
        }
      }

      var foo = new Foo();
      expect(foo.bar(2)).to.equal(3);
      expect(foo.bar2(3)).to.equal(6);
    });

    it('multicast', function(){
      let multicast = w.getDecorator('multicast');
      let spread = w.getDecorator('spread');

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
    });

    if('multiset', function(){
      let multiset = w.getDecorator('multiset');

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
    });

    it('enumerable', function(){
      const enumerable = w.getDecorator('enumerable');

      class Foo{
        //Note: class methods are nonenumerable 
        //so this is only useful for instance properties.
        @enumerable(false)
        bar = 1
      }

      var foo = new Foo();
      expect(foo.bar).to.equal(1);
      expect(Object.keys(foo).indexOf('bar')).to.equal(-1);
    });

    it('readonly', function(){
      const readonly = w.getDecorator('readonly');

      class Foo{
        @readonly
        bar(){
          return 1;
        }
      }

      var foo = new Foo();
      expect(foo.bar()).to.equal(1);
      //expect(()=>foo.bar=11).to.throw(Error);
      try{
        foo.bar = 11;
        delete foo.bar;
      }catch(ex){}
      expect(foo.bar()).to.equal(1);
    });

    it('once', function(){
      const once = w.getDecorator('once');

      let times = 0;

      class Foo{
        constructor(){
          this.initialize();
        }
        @once
        initialize(){
          return times++;
        }
      }

      let f = new Foo(), f2 = new Foo();
      expect(times).to.equal(1);
    });

    it('reduce', function(){
      const reduce = w.getDecorator('reduce');

      class Foo{
        @reduce
        multiply(x, y){
          return x * y;
        }
      }

      var foo = new Foo();
      expect(foo.multiply(1,2,3,4)).to.equal(24);
    });

    it('promisify', function(done){
      let promisify = w.getDecorator('promisify');

      class Site{
        constructor(url){
          this.url = url;
        }
        @promisify
        getData(callback){
          let request = require('request');
          request.get(this.url, {timeout: 1500}, callback);
        }
      }

      var site = new Site('https://registry.npmjs.org/core-wrappers');
      site.getData().then(function(res){
        var data = JSON.parse(res[1]);
        expect(data.name).to.equal('core-wrappers');
        done();
      }).catch(function(err){
        console.log(err)
        done();
      });
    });

  });
});