Ext.define('MyApp.store.Employees', {
    pageSize: 10,
    autoLoad: true,
    extend: 'Ext.data.Store',
    model: 'MyApp.model.Employee'
});
