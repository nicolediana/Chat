Ext.define('Chat.view.audiovideo.SchermoVideo' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.areaVideo',
    autoShow: true,
    title: 'Video',
    collapsible: true,
    collapseDirection :'right',
    collapsed:true,
    split: true,
    width: 500,
    html:'',

    initComponent: function() {

        this.buttons= [
            {
                xtype: 'button',
                text : 'AVVIA WEBCAM',
                action: 'apriWebcam'
            },
            {
                xtype: 'button',
                text : 'CHIUDI WEBCAM',
                action: 'chiudiWebcam'
            }
        ];

        this.callParent(arguments);
    }
});
