App.Employee = Ember.Record.extend({
  primaryKey: 'id',

  first_name: Ember.Record.attr(String),
  last_name: Ember.Record.attr(String),
  salary: Ember.Record.attr(Number),
  company: Ember.Record.toOne('App.Company', {isMaster: true})
});
