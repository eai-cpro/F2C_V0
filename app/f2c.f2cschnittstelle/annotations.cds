using FeliosService as service from '../../srv/service';
annotate service.ProductionOrders with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'ManufacturingOrder',
                Value : ManufacturingOrder,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MfgOrderPlannedStartDate',
                Value : MfgOrderPlannedStartDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MfgOrderPlannedEndDate',
                Value : MfgOrderPlannedEndDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'GoodsRecipientName',
                Value : GoodsRecipientName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'BasicSchedulingType',
                Value : BasicSchedulingType,
            },
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
);

