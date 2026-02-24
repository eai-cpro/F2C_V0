using { API_PRODUCTION_ORDER_2_SRV_0001 as external } from './external/API_PRODUCTION_ORDER_2_SRV_0001';

service FeliosService {

  @Capabilities : { Updatable : true }
  entity ProductionOrders as projection on external.A_ProductionOrder_2 {
    key ManufacturingOrder,
        MfgOrderPlannedStartDate,
        MfgOrderPlannedEndDate,
        GoodsRecipientName,
        BasicSchedulingType
  }

  // ✅ Echte Massen-Action (Freistehend, erwartet ein Array von IDs)
  action changeReceiverBatch(
    ManufacturingOrders : array of String, //
    newName             : String
  ) returns String; 
}

// Standard-Tabelle konfigurieren (OHNE Action-Button, da dieser über die Page Map als Custom Action eingefügt wird)
annotate FeliosService.ProductionOrders with @(
    UI : {
        LineItem : [
            { Value : ManufacturingOrder, Label : 'Auftragsnummer' },
            { Value : GoodsRecipientName, Label : 'Aktueller Empfänger' },
            { Value : MfgOrderPlannedStartDate, Label : 'Startdatum' }
        ]
    }
);