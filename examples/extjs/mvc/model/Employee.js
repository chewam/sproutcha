Ext.define('MyApp.model.Employee', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'rest',
        reader: {
            root: 'objects',
            totalProperty: 'meta.total_count'
        },
        startParam: 'offset',
        url: 'http://demo.revolunet.com:9876/api/v1/employee'
    },
    fields: ['id', 'first_name', 'last_name', 'salary', 'company']
});
