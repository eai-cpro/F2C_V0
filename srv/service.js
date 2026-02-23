const cds = require('@sap/cds');
const { SELECT } = cds.ql;

module.exports = cds.service.impl(async function () {
  const s4 = await cds.connect.to('API_PRODUCTION_ORDER_2_SRV_0001');

  this.on('READ', 'ProductionOrders', async (req) => s4.run(req.query));

  //  BATCH-ACTION
  this.on('changeReceiverBatch', async (req) => {
    const ids = req.data.ManufacturingOrders;
    const neuerName = req.data.newName;

    if (!Array.isArray(ids) || ids.length === 0) return req.error(400, "Keine IDs übergeben.");
    if (!neuerName) return req.error(400, "newName fehlt.");

    console.log(`\n STARTE ECHTEN BATCH: ${ids.length} Aufträge -> "${neuerName}"`);
    console.time("Batch Gesamtzeit");

    let successCount = 0;

    //  sichere Schleife für S/4HANA
    for (const id of ids) {
      try {
        const query = SELECT.one.from('A_ProductionOrder_2').where({ ManufacturingOrder: id });
        const data = await s4.run(query);

        if (!data) continue;

        let etag = "*";
        if (data.LastChangeDateTime) etag = `W/"'${data.LastChangeDateTime}'"`;

        await s4.send({
          method: 'PATCH',
          path: `A_ProductionOrder_2('${id}')`,
          data: { GoodsRecipientName: neuerName },
          headers: { "If-Match": etag }
        });

        successCount++;
        console.log(`✅ ${id} erledigt`);
      } catch (e) {
        console.error(`❌ Fehler bei ${id}:`, e.message);
      }
    }

    console.timeEnd("Batch Gesamtzeit");
    return `Erfolg: ${successCount} von ${ids.length} aktualisiert!`;
  });
});