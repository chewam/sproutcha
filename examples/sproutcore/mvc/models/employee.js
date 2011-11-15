App.Employee = SC.Record.extend({
  primaryKey: 'id',

  first_name: SC.Record.attr(String),
  last_name: SC.Record.attr(String),
  salary: SC.Record.attr(Number),
  company: SC.Record.toOne('App.Company', {isMaster: true})
});
