App.Employees = SC.ArrayProxy.create({
  rangeStart: 0,
  rangeWindowSize: 10,
  totalBinding: '.contentObjects.length',

  contentObjects: [],

  rangeStop: function() {
    var rangeStop = this.get('rangeStart') + this.get('rangeWindowSize'),
    length = this.get('total');
    if (rangeStop < length) {
      return rangeStop;
    }
    return length;
  }.property('rangeStart', 'rangeWindowSize', 'total').cacheable(),

  hasPrevious: function() {
    return this.get('rangeStart') > 0;
  }.property('rangeStart').cacheable(),
  
  hasNext: function() {
    return this.get('rangeStop') < this.get('total');
  }.property('rangeStop', 'total').cacheable(),

  pageDidChange: function(array, key) {
    var content = this.get('contentObjects').slice(this.get('rangeStart'), this.get('rangeStop'));
    var contentLength = content.get('length'),
        contentFirstObject = content.get('firstObject');
    if (contentLength > 0 && !SC.none(contentFirstObject)) {
      SC.run.schedule('sync', this, function() {
        this.set('content', content);
      });
    }
  }.observes('contentObjects.@each', 'rangeStop'),
  
  nextPage: function() {
    if (this.get('hasNext')) {
      this.incrementProperty('rangeStart', this.get('rangeWindowSize'));
    }
  },
    
  previousPage: function() {
    if (this.get('hasPrevious')) {
      this.decrementProperty('rangeStart', this.get('rangeWindowSize'));
    }
  },

  rangeStartOne: function() {
    return this.get('rangeStart') + 1;
  }.property('rangeStart').cacheable(),

  page: function() {
    return (this.get('rangeStart') / this.get('rangeWindowSize')) + 1;
  }.property('rangeStart', 'rangeWindowSize').cacheable(),

  totalPages: function() {
    return Math.ceil(this.get('total') / this.get('rangeWindowSize'));
  }.property('total', 'rangeWindowSize').cacheable()
});
