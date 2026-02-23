using {API_PRODUCTION_ORDER_2_SRV_0001 as external} from './external/API_PRODUCTION_ORDER_2_SRV_0001';

service FeliosService {


  entity ProductionOrders as
    projection on external.A_ProductionOrder_2 {
      key ManufacturingOrder,
          MfgOrderPlannedStartDate,
          MfgOrderPlannedEndDate,
          GoodsRecipientName,
          BasicSchedulingType
    }

    // HIER IST DEINE NEUE FUNKTION:
    actions {
     
      // Sie verlangt einen Parameter "newName" für den neuen Empfänger.
      action changeReceiver(newName: String @title: 'Neuer Name' ) returns ProductionOrders;

    };

}

// DAS UI (User Interface)
annotate FeliosService.ProductionOrders with @(UI: {
 // Die Tabelle konfigurieren
  LineItem: [
  {
    Value: ManufacturingOrder,
    Label: 'Auftragsnummer'
  },
  {
    Value: GoodsRecipientName,
    Label: 'Aktueller Empfänger'
  },
  {
    Value: MfgOrderPlannedStartDate,
    Label: 'Startdatum'
  },

  // DAS HIER IST DER BUTTON IN DER TABELLE:
  {
    $Type : 'UI.DataFieldForAction',
    Action: 'FeliosService.changeReceiver',
    Label : 'Empfänger ändern' // So heißt der Button im Browser F
  }
]});


