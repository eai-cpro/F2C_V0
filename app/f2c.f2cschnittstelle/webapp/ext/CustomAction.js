sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label"
], function(MessageToast, Dialog, Button, Input, Label) {
    "use strict";

    return {
        onBatchUpdateClick: function(oContext, aSelectedContexts) {
            
            // 1. Prüfen, ob etwas in der Tabelle markiert wurde
            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("Bitte markiere zuerst Aufträge in der Tabelle!");
                return;
            }

            // 2. IDs aus den markierten Zeilen auslesen und in ein Array packen
            var aIds = [];
            for (var i = 0; i < aSelectedContexts.length; i++) {
                aIds.push(aSelectedContexts[i].getProperty("ManufacturingOrder"));
            }

            // 3. Das Dialog-Popup bauen
            var oInput = new Input({ placeholder: "Neuer Empfänger-Name" });
            var oDialog = new Dialog({
                title: "Massen-Update: " + aIds.length + " Aufträge",
                content: [ new Label({ text: "Neuer Name:" }), oInput ],
                beginButton: new Button({
                    text: "Senden",
                    type: "Emphasized",
                    press: function() {
                        var sNewName = oInput.getValue();
                        oDialog.close();
                        
                        MessageToast.show("Batch wird gesendet...");

                        // 4. Den HTTP-Request an dein Backend (service.js) schicken
                        var oModel = aSelectedContexts[0].getModel();
                        var oAction = oModel.bindContext("/changeReceiverBatch(...)");
                        
                        // Parameter setzen (genau wie im CDS definiert)
                        oAction.setParameter("ManufacturingOrders", aIds);
                        oAction.setParameter("newName", sNewName);

                        oAction.execute().then(function() {
                            var oResult = oAction.getBoundContext().getObject();
                            MessageToast.show(oResult.value || "Erfolgreich!");
                            oModel.refresh(); // Tabelle automatisch neu laden
                        }).catch(function(oError) {
                            MessageToast.show("Fehler: " + oError.message);
                        });
                    }
                }),
                endButton: new Button({
                    text: "Abbrechen",
                    press: function() { oDialog.close(); }
                }),
                afterClose: function() { oDialog.destroy(); }
            });

            oDialog.open();
        }
    };
});