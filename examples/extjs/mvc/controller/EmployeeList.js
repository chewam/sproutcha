Ext.define('MyApp.controller.EmployeeList', {

    models: ['Employee'],

    stores: ['Employees'],

    views: ['EmployeeList', 'PagingToolbar'],

    extend: 'Ext.app.Controller',

    refs: [{ref: 'pagingToolbar', selector: 'pagingToolbar'}],

    init: function() {
        this.control({
            'pagingToolbar > container[queryName="pagination"]': {
                click: this.onPaginationClick
            }
        });
        this.getEmployeesStore().on({
            scope: this,
            update: this.updatePagination,
            datachanged: this.updatePagination
        });
    },

    onPaginationClick: function(container, event, target) {
        var li;
        if (target && (li = Ext.fly(target).up('li'))) {
            if (li.hasCls('next')) {
                this.nextPage();
            } else {
                this.previousPage();
            }
            this.updatePagination();
        }
    },

    nextPage: function() {
        var store = this.getEmployeesStore(),
            pageCount = Math.ceil(store.getTotalCount() / store.pageSize);
        if (store.currentPage !== pageCount) {
            store.nextPage();
        }
    },

    previousPage: function() {
        var store = this.getEmployeesStore();
        if (store.currentPage !== 1) {
            store.previousPage();
        }
    },

    updatePagination: function() {
        var store = this.getEmployeesStore(),
            totalCount = store.getTotalCount(),
            toolbar = this.getPagingToolbar(),
            info = toolbar.items.first(),
            pagination = toolbar.items.last(),
            previousButton = pagination.el.select('li.prev'),
            nextButton = pagination.el.select('li.next'),
            pageCount = Math.ceil(totalCount / store.pageSize);

        if (store.currentPage === 1) {
            previousButton.addCls('disabled');
        } else {
            previousButton.removeCls('disabled');
        }

        if (store.currentPage === pageCount) {
            nextButton.addCls('disabled');
        } else {
            nextButton.removeCls('disabled');
        }

        info.update({
            page: store.currentPage,
            totalCount: totalCount,
            pageCount: pageCount,
            last: store.currentPage * store.pageSize,
            first: store.currentPage * store.pageSize - store.pageSize + 1,
        });
    }

});
