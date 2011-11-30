(function() {
var get = SC.get;

SC.Loader = SC.Object.create({

  delegate: null,

  /**
   * @param {String}
   */
  loadScript: function(url) {
    var dataType = url.match(/\.(handlebars|hbs)$/) ? 'handlebars' :
      (url.match(/\.js$/) ? 'script' : false);
    if (!dataType) { return false; }
    SC.$.holdReady(true);
    return SC.$.ajax(url, {
      dataType: dataType,
      context: this,
      complete: function() {
        SC.$.holdReady(false);
      },
      error: function(xhr) {
        var delegate = get(this, 'delegate');
        if (delegate && typeof delegate.loadError === 'function') {
          delegate.loadError.call(delegate, xhr);
        }
      }
    });
  },

  loadScripts: function() {
    var scripts = SC.A(arguments);
    var ordered = scripts[0] === true;
    if (ordered) {
      scripts.shift();
      var _this = this;
      function _loadScripts(url) {
        if (!url) { return; }
        _this.loadScript(url).always(function() {
          _loadScripts(scripts.shift());
        });
      }
      _loadScripts(scripts.shift());
    } else {
      for (var i = 0, l = scripts.length; i < l; i++) {
        this.loadScript(scripts[i]);
      }
    }
  },

  // TODO: Implement
  loadImage: function() {
  },

  // TODO: Implement
  loadCSS: function() {
  }
});

/**
 * Setup jQuery Ajax to handle handlebars templates loading.
 */
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

})();
