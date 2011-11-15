App.DataSource = SC.DataSource.extend({
  fetch: function(store, query) {
    store.loadQueryResults(query, SC.SparseArray.create({
      delegate: this,
      store: store,
      query: query,
      rangeWindowSize: 30
    }));
    return true;
  },

  sparseArrayDidRequestLength: function(sparseArray) {
    return this.sparseArrayDidRequestRange(sparseArray, {start: 0, length: sparseArray.get('rangeWindowSize')});
  },

  sparseArrayDidRequestRange: function(sparseArray, range) {
    if (this._request) {
      this._request.abort();
    }
    this._request = $.ajax('http://demo.revolunet.com:9876/api/v1/employee', {
      context: this,
      contentType: 'application/json',
      data: {offset: range.start, limit:range.length},
      success: function(data) {
        this.didFetchRecords(data, sparseArray, range);
      },
      error: this.errorFetchRecords
    });
  },

  didFetchRecords: function(data, sparseArray, range) {
    data.objects.forEach(function(employee) {
      sparseArray.get('store').loadRecord(App.Company, employee.company);
      employee.company = employee.company.id;
    });
    var storeKeys = sparseArray.get('store')
      .loadRecords(sparseArray.getPath('query.recordType'), data.objects);
    sparseArray.provideLength(data.meta.total_count);  
    sparseArray.provideObjectsInRange(range, storeKeys);
    sparseArray.rangeRequestCompleted(range.start);
  },

  errorFetchRecords: function(error) {
    SC.Logger.error('Do somephing about errors');
  }
});
