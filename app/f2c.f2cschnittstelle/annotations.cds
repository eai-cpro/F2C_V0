using FeliosService as service from '../../srv/service';

annotate service.ProductionOrders with @(
    // 1. Das ist für die Detailseite (wenn man auf eine Zeile klickt)
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'ManufacturingOrder', Value : ManufacturingOrder },
            { $Type : 'UI.DataField', Label : 'MfgOrderPlannedStartDate', Value : MfgOrderPlannedStartDate },
            { $Type : 'UI.DataField', Label : 'MfgOrderPlannedEndDate', Value : MfgOrderPlannedEndDate },
            { $Type : 'UI.DataField', Label : 'GoodsRecipientName', Value : GoodsRecipientName },
            { $Type : 'UI.DataField', Label : 'BasicSchedulingType', Value : BasicSchedulingType }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],

    // 2. DAS IST DEINE TABELLE (Hier haben die Daten gefehlt!)
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Auftragsnummer',
            Value : ManufacturingOrder,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Aktueller Empfänger',
            Value : GoodsRecipientName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Startdatum',
            Value : MfgOrderPlannedStartDate,
        }
        // WICHTIG: Hier ist KEIN Button mehr! Der Massen-Button kommt über die Page Map rein.
    ]
);