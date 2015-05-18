var chai = require('chai');

var expect = chai.expect;

describe('di', function () {

  var di = require('../lib/di');

  beforeEach(function () {
    di.clear();
  });

  describe('.register()', function () {

    it('should except a string as a dependency', function () {
      di.register('str', 'this is a string');
      expect(di.dependencies.str).to.equal('this is a string');
    });

    it('should except a number as a dependency', function () {
      di.register('num', 5);
      expect(di.dependencies.num).to.equal(5);
    });

    it('should except an array as a dependency', function () {
      di.register('arr', ['a', 'b', 'c']);
      expect(di.dependencies.arr).to.eql(['a', 'b', 'c']);
    });

    it('should except a function as a dependency', function () {
      var fn = function () {
        console.log('Hello World!');
      };
      di.register('hello', fn);
      expect(di.dependencies.hello).to.equal(fn);
    });

  });

  describe('.get()', function () {

    it('should return a dependency if given a name', function () {
      di.register('a', 'foo');
      expect(di.get('a')).to.equal('foo');
    });

    it('should return an array if given an array of names', function () {
      di.register('a', 'foo');
      di.register('b', 'bar');
      expect(di.get(['a', 'b'])).to.eql(['foo', 'bar']);
    });

    it('should return undefined if given a name that is not registered', function () {
      expect(di.get('c')).to.not.exist();
    });

  });

  describe('.has()', function () {

    it('should return true if the name is registered', function () {
      di.register('a', 'foo');
      expect(di.has('a')).to.be.true();
    });

    it('should return false if the name is not registered' , function () {
      expect(di.has('b')).to.be.false();
    });

  });

  describe('.annotate()', function () {

    it('should return an array of dependency names from func signature', function () {
      var fn1 = function () {
        console.log('hello world!');
      };
      expect(di.annotate(fn1)).to.eql([]);
      var fn2 = function (foo, bar) {
        console.log('hello world!');
      };
      expect(di.annotate(fn2)).to.eql(['foo', 'bar']);
      expect(fn2.$dependencies).to.eql(['foo', 'bar']);
    });

    it('should return an array of dependency names from $dependencies property', function () {
      var fn = function (foo, bar) {
        console.log('hello world!');
      };
      fn.$dependencies = ['$foo', '$bar'];
      expect(di.annotate(fn)).to.eql(['$foo', '$bar']);
    });

  });

  describe('.invoke()', function () {

    it('should invoke a function with injected dependencies', function () {
      di.register('name', 'John Smith');
      var fn = function (name) {
        return 'hello ' + name + '!';
      };
      expect(di.invoke(fn)).to.equal('hello John Smith!');
    });

    it('should except an object for local dependencies', function () {
      di.register('name', 'John Smith');
      var fn = function (greeting, name) {
        return greeting + ' '+ name + '!';
      };
      expect(di.invoke(fn, { greeting: 'hello' })).to.equal('hello John Smith!');
    });

    it('should except a \'self\' arg', function () {
      di.register('name', 'John Smith');
      var obj = {
        greeting: 'hello'
      };
      var fn = function (name) {
        return this.greeting + ' ' + name + '!';
      };
      expect(di.invoke(fn, {}, obj)).to.equal('hello John Smith!');
    });

    it('should expect inline dependency naming', function () {
      di.register('john', 'John Smith');
      var fn = function (name) {
        return 'hello ' + name + '!';
      };
      expect(di.invoke(['john', fn])).to.equal('hello John Smith!');
    });

    it('should except the name of a registered function to invoke', function () {
      di.register('name', 'John Smith');
      di.register('greet', function (name) {
        return 'hello ' + name + '!';
      });
      expect(di.invoke('greet')).to.equal('hello John Smith!');
    });

  });

  describe('.instantiate()', function () {

    it('should instantiate a class with the injected dependencies', function () {
      di.register('name', 'John Smith');
      var Person = function (name) {
        this.name = name;
      };
      var john = di.instantiate(Person);
      expect(john.name).to.equal('John Smith');
    });

    it('should except an object for local dependencies', function () {
      di.register('name', 'John Smith');
      var Person = function (greeting, name) {
        this.greeting = greeting;
        this.name = name;
        this.greet = function () {
          return this.greeting + ' ' + this.name + '!';
        };
      };
      var john = di.instantiate(Person, { greeting: 'hello' });
      expect(john.name).to.equal('John Smith');
      expect(john.greet()).to.equal('hello John Smith!');
    });

    it('should except inline dependency naming', function () {
      di.register('john', 'John Smith');
      var Person = function (name) {
        this.name = name;
      };
      var john = di.instantiate(['john', Person]);
      expect(john.name).to.equal('John Smith');
    });

    it('should except the name of a registered class to instantiated', function () {
      di.register('name', 'John Smith');
      di.register('Person', function (name) {
        this.name = name;
      });
      var john = di.instantiate('Person');
      expect(john.name).to.equal('John Smith');
    });

  });

});
