const cds = require('@sap/cds');
const { SELECT } = cds.ql;

module.exports = cds.service.impl(async function () {
  const s4 = await cds.connect.to('API_PRODUCTION_ORDER_2_SRV_0001');

  this.on('READ', 'ProductionOrders', async (req) => s4.run(req.query));

  this.on('changeReceiverBatch', async (req) => {
    const ids = req.data.ManufacturingOrders;
    const neuerName = req.data.newName;

    if (!Array.isArray(ids) || ids.length === 0) return req.error(400, "Keine IDs übergeben.");
    if (!neuerName) return req.error(400, "newName fehlt.");

    console.log(`\n📦 STARTE VORBEREITUNG: ${ids.length} Aufträge...`);
    console.time("⏱️ Gesamtzeit");

    const updateAufgaben = []; // Hier sammeln wir die laufenden Raketen (Promises)

    // 1. Wir holen brav für jeden Auftrag das ETag ab
    for (const id of ids) {
      try {
        const query = SELECT.one.from('A_ProductionOrder_2').where({ ManufacturingOrder: id });
        const data = await s4.run(query);

        if (!data) continue;

        let etag = "*";
        if (data.LastChangeDateTime) {
            etag = `W/"'${data.LastChangeDateTime}'"`;
        } else if (data.__metadata && data.__metadata.etag) {
            etag = data.__metadata.etag;
        }

        console.log(`✅ ETag für ${id} geholt.`);

        // 2. WICHTIG: Kein "await" hier! Wir starten den Sendevorgang, 
        // warten aber nicht auf die Antwort, sondern packen ihn in unsere Liste.
        const updatePromise = s4.send({
          method: 'PATCH',
          path: `A_ProductionOrder_2('${id}')`,
          data: { GoodsRecipientName: neuerName },
          headers: { "If-Match": etag }
        });
        
        updateAufgaben.push(updatePromise);

      } catch (e) {
        console.error(`❌ Fehler beim ETag für ${id}:`, e.message);
      }
    }

    // 3. Wenn wir alle ETags haben, lassen wir es krachen!
    if (updateAufgaben.length > 0) {
        try {
            console.log(`\n🚀 FEUERE PARALLEL-UPDATES AN S/4HANA AB (${updateAufgaben.length} Stück gleichzeitig)!`);
            
            // Promise.all wartet, bis ALLE Updates in SAP fertig gebucht sind.
            await Promise.all(updateAufgaben); 
            
            console.log(`🎉 S/4HANA Massen-Update erfolgreich!\n`);
        } catch (err) {
            console.error(`❌ Fehler beim S/4HANA Update:`, err.message);
            return req.error(500, "Fehler beim Update in S/4HANA.");
        }
    }

    console.timeEnd("⏱️ Gesamtzeit");
    return `Erfolg: ${updateAufgaben.length} Aufträge parallel aktualisiert!`;
  });
});