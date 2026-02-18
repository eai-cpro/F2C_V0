sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheProductionOrdersList.iSeeThisPage();
            Then.onTheProductionOrdersList.onTable().iCheckColumns(3, {"ManufacturingOrder":{"header":"Auftragsnummer"},"GoodsRecipientName":{"header":"Aktueller Empfänger"},"MfgOrderPlannedStartDate":{"header":"Startdatum"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheProductionOrdersList.onFilterBar().iExecuteSearch();
            
            Then.onTheProductionOrdersList.onTable().iCheckRows();

            When.onTheProductionOrdersList.onTable().iPressRow(0);
            Then.onTheProductionOrdersObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});