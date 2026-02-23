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

  //  NEU: Echte Massen-Action (Liegt jetzt frei im Service, NICHT in der Entity)
  action changeReceiverBatch(
    ManufacturingOrders : array of String,
    newName             : String
  ) returns String; // Für die  Einfachheit halber nur einen Text zurückgeben
}