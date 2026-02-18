sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'f2c.f2cschnittstelle',
            componentId: 'ProductionOrdersList',
            contextPath: '/ProductionOrders'
        },
        CustomPageDefinitions
    );
});