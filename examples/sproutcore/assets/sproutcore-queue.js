(function() {
var get = SC.get, set = SC.set;

SC.ExecutionQueue = SC.Object.extend({
  /**
   *
   */
  options: null,

  /**
   *
   */
  isReadyBinding: SC.Binding.oneWay('_hold').transform(function(value) { return value < 0; }),

  /**
   *
   */
  schedule: function(target, method) {
    if (typeof method === 'string') {
      method = target[method];
    }
    this._callbacks.add($.proxy(method, target));
  },

  /**
   *
   */
  run: function(force) {
    if (force === true) {
      this.set('_hold', 0);
    }
    if (this.decrementProperty('_hold') < 0) {
      SC.run.schedule('sync', this._callbacks, 'fire');
    }
  },

  /**
   *
   */
  hold: function() {
    this.incrementProperty('_hold');
  },

  /** @private */
  init: function() {
    this._super();
    this._callbacks = SC.$.Callbacks(get(this, 'options'));
  },

  /** @private */
  _hold: 0
});

SC.initializationQueue = SC.ExecutionQueue.create({
  /**
   *
   */
  options: 'memory once unique',

  /**
   *
   */
  loadScript: function(url) {
    var dataType = url.match(/\.(handlebars|hbs)$/) ? 'handlebars' :
      (url.match(/\.js$/) ? 'script' : false);
    if (!dataType) { return false; }
    this.hold();
    return SC.$.ajax(url, {
      dataType: dataType,
      context: this,
      complete: function() {
        this.run();
      },
      error: function(xhr, status) {
        console.log(status);
        this.setProperties({
          isError: true,
          errorObject: xhr
        });
      }
    });
  },

  loadScripts: function() {
    var scripts = SC.$.makeArray(arguments);
    var async = scripts[0] === true;
    if (async) {
      for (var i = 1, l = scripts.length; i < l; i++) {
        this.loadScript(scripts[i]);
      }
    } else {
      var _this = this;
      function _loadScripts(url) {
        if (!url) { return; }
        _this.loadScript(url).always(function() {
          _loadScripts(scripts.shift());
        });
      }
      _loadScripts(scripts.shift());
    }
  }
});

SC.QueueActionSupport = SC.Mixin.create({
  queue: null,
  action: null,
  isErrorBinding: 'queue.isError',
  errorObjectBinding: 'queue.errorObject',

  init: function() {
    this._super();
    var queue = get(this, 'queue'), action = get(this, 'action');
    if (queue && action) {
      queue.schedule(this, action);
    }
  }
});

jQuery.ajaxSetup({
  converters: {
    "text handlebars": function(textValue) {
      return SC.Handlebars.compile(textValue);
    }
  }
});

jQuery.ajaxPrefilter('handlebars', function(options, originalOptions, jqXHR) {
  jqXHR.success(function(data) {
    var name = options.templateName || options.url.split('/').pop().replace(/\.(handlebars|hbs)$/, '');
    SC.TEMPLATES[name] = data;
  });
});

SC.$($.proxy(SC.initializationQueue, 'run'));

})();
