// CAP Framework
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    // 1. Verbindung zum externen S/4 Service herstellen (Name aus der package.json)
    const s4 = await cds.connect.to('API_PRODUCTION_ORDER_2_SRV_0001');

    // 2. Read anfrage 
    this.on('READ', 'ProductionOrders', async req => {

        console.log("--> Leite Anfrage an S/4HANA weiter...");

        
        // req.query = die Anfrage vom Frontend

        //s4.run() = leite diese Anfrage einfach an S/4 weiter
        // leiten wir sie 1:1 an das externe System weiter
        return s4.run(req.query);
    });

    // 2. DIE LOGIK FÜR DEN NEUEN BUTTON
    this.on('changeReceiver', 'ProductionOrders', async req => {

        const id = req.params[0].ManufacturingOrder; // aus der URL
        const neuerName = req.data.newName;           // vom Button / Eingabefel

        console.log("--> Action gedrückt! ID:", id, "Neuer Name:", neuerName);

        try {
            console.log("--> Action gedrückt! ID:", id, "Neuer Name:", neuerName);

            // SCHRITT 1: Daten lesen (wir brauchen das Datum "LastChangeDateTime")
            const query = SELECT.one.from('A_ProductionOrder_2').where({ ManufacturingOrder: id });
            const data = await s4.run(query); // s4.run(query) = schicke die Anfrage an S/4

            let etag = null;

            // PLAN A: Prüfen, ob LastChangeDateTime da ist (Das ist unser Gold!)
            if (data.LastChangeDateTime) {
                // Wir bauen den ETag manuell nach S/4HANA-Bauplan: W/"'2026...'"
                etag = `W/"'${data.LastChangeDateTime}'"`;
                console.log("--> ETag manuell gebaut:", etag);
            }
            // PLAN B: Vielleicht ist er doch in den Metadaten versteckt?
            else if (data.__metadata && data.__metadata.etag) {
                etag = data.__metadata.etag;
            }
            // PLAN C: Wenn alles fehlt, müssen wir doch den Stern nehmen (auch wenn er bisher nicht ging)
            else {
                console.log("--> Kein Datum gefunden, nehme *");
                etag = "*";
            }
            console.time('⏱️ Zeit für S/4-Update'); // <--- START DER MESSUNG

            // SCHRITT 2: Speichern mit unserem selbstgebauten ETag
            await s4.send({
                method: 'PATCH',
                path: `A_ProductionOrder_2('${id}')`,
                data: { GoodsRecipientName: neuerName },
                headers: { "If-Match": etag }
            });

            console.timeEnd('⏱️ Zeit für S/4-Update'); // <--- STOPP UND AUSGABE IM LOG

            req.notify(`Erfolg! Empfänger für Auftrag ${id} wurde auf "${neuerName}" geändert.`);

        } catch (error) {
            console.timeEnd('⏱️ Zeit für S/4-Update'); // Stoppen, falls ein Fehler auftritt
            console.error("Fehler Details:", error);
            // Wir geben die Fehlermeldung direkt an dich weiter
            req.error(500, "Fehler beim Speichern: " + (error.response?.data?.error?.message?.value || error.message));
        }
    });
});