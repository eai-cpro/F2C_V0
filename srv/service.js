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

    console.log(`\n STARTE HARDCORE BATCH-AUFBAU: ${ids.length} Aufträge...`);
    console.time(" Batch Gesamtzeit");

    // Wir definieren die Trennlinien für den Multipart-Body
    const batchBoundary = "batch_" + Date.now();
    const changesetBoundary = "changeset_" + Date.now();
    
    // Hier wird unser reiner Text-Payload gespeichert
    let batchBody = "";

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

        console.log(` ETag für ${id} geholt.`);

        // 1. Wir schreiben den Changeset-Block für diese ID exakt mit \r\n
        batchBody += `--${changesetBoundary}\r\n`;
        batchBody += `Content-Type: application/http\r\n`;
        batchBody += `Content-Transfer-Encoding: binary\r\n\r\n`;
        batchBody += `PATCH A_ProductionOrder_2('${id}') HTTP/1.1\r\n`;
        batchBody += `Content-Type: application/json\r\n`;
        batchBody += `If-Match: ${etag}\r\n\r\n`;
        batchBody += JSON.stringify({ GoodsRecipientName: neuerName }) + `\r\n`;

      } catch (e) {
        console.error(`❌ Fehler beim ETag für ${id}:`, e.message);
      }
    }

    // 2. Wenn wir Text im Body haben, verpacken wir ihn in den Haupt-Batch
    if (batchBody.length > 0) {
        let finalPayload = `--${batchBoundary}\r\n`;
        finalPayload += `Content-Type: multipart/mixed; boundary=${changesetBoundary}\r\n\r\n`;
        finalPayload += batchBody;
        finalPayload += `--${changesetBoundary}--\r\n`;
        finalPayload += `--${batchBoundary}--\r\n`;

        try {
            console.log(`\n FEUERE ECHTEN TEXT-$batch AN S/4HANA AB (1 EINZIGER CALL)!`);
            
            // 3. Wir rufen S4 direkt über den /$batch Endpunkt auf und zwingen den Text durch
            await s4.send({
                method: 'POST',
                path: '/$batch',
                headers: {
                    'Content-Type': `multipart/mixed; boundary=${batchBoundary}`
                },
                data: finalPayload
            });
            
            console.log(` S/4HANA echter Massen-Batch erfolgreich!\n`);
        } catch (err) {
            console.error(`❌ Fehler beim S/4HANA Batch:`, err.message);
            return req.error(500, "Fehler beim S/4HANA Batch.");
        }
    }

    console.timeEnd(" Batch Gesamtzeit");
    return `Erfolg: ${ids.length} Aufträge im echten OData $batch aktualisiert!`;
  });
});