sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"f2c/f2cschnittstelle/test/integration/pages/ProductionOrdersList",
	"f2c/f2cschnittstelle/test/integration/pages/ProductionOrdersObjectPage"
], function (JourneyRunner, ProductionOrdersList, ProductionOrdersObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('f2c/f2cschnittstelle') + '/test/flpSandbox.html#f2cf2cschnittstelle-tile',
        pages: {
			onTheProductionOrdersList: ProductionOrdersList,
			onTheProductionOrdersObjectPage: ProductionOrdersObjectPage
        },
        async: true
    });

    return runner;
});

