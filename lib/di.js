
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FN_ARGS = /^function\s*[^\(]*\(([^\)]*)\)/m;
var ARGUMENT_NAMES = /([^\s,]+)/g;

var di = {

  dependencies: {},

  register: function (name, dep) {
    if ('string' === typeof name) {
      di.dependencies[name] = dep;
    } else {
      for (var n in name) {
        di.dependencies[n] = name[n];
      }
    }
  },

  clear: function () {
    di.dependencies = {};
  },

  get: function (name) {
    if (Array.isArray(name)) {
      return name.map(function (value) {
        return di.dependencies[value];
      });
    } else {
      return di.dependencies[name];
    }
  },

  has: function (name) {
    return di.dependencies.hasOwnProperty(name);
  },

  invoke: function (func, locals, self) {
    var depNames;
    var args;
    locals = locals || {};
    if (typeof func === 'string') {
      func = di.get(func);
    }
    if (Array.isArray(func)) {
      depNames = func.slice(0, -1);
      func = func[func.length - 1];
    } else {
      depNames = di.annotate(func);
    }
    args = depNames.map(function (name) {
      return locals[name] || di.dependencies[name];
    });
    return func.apply(self, args);
  },

  instantiate: function (type, locals) {
    var depNames;
    var args;
    locals = locals || {};
    if (typeof type === 'string') {
      type = di.get(type);
    }
    if (Array.isArray(type)) {
      depNames = type.slice(0, -1);
      type = type[type.length - 1];
    } else {
      depNames = di.annotate(type);
    }
    args = depNames.map(function (name) {
      return locals[name] || di.dependencies[name];
    });
    return new (Function.prototype.bind.apply(type, [null].concat(args)));
  },

  annotate: function (func) {
    var functionTxt, argsTxt;
    if (!func.$dependencies) {
      functionTxt = func.toString().replace(STRIP_COMMENTS, '');
      argsTxt = functionTxt.match(FN_ARGS);
      func.$dependencies = argsTxt[1].match(ARGUMENT_NAMES);
    }
    return func.$dependencies || [];
  }

};

module.exports = di;
