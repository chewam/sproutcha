Ext.define('MyApp.view.PagingToolbar', {
    extend: 'Ext.Container',
    cls: 'toolbar',
    alias : 'widget.pagingToolbar',
    items: [{
        xtype: 'container',
        cls: 'info',
        tpl: Ext.create('Ext.XTemplate',
            '<div>page: {page}/{pageCount}</div>',
            '<div>{first} - {last} of {totalCount}</div>',
            {compiled: true}
        )
    }, {
        xtype: 'container',
        cls: 'pagination',
        queryName: 'pagination',
        data: [{label: '&larr; Previous', cls:'prev'}, {label: 'Next &rarr;', cls: 'next'}],
        tpl: '<ul><tpl for="."><li class="{cls}"><a href="#">{label}</a></li></tpl></ul>',
        afterRender: function() {
            var func = Ext.bind(this.fireEvent, this, ['click', this], 0);
            this.el.on('click', func);
        }
    }]
});
