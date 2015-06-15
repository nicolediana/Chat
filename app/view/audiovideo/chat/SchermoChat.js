Ext.define('Chat.view.chat.SchermoChat' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.areaChat',
    autoShow: true,
    title: 'Chat testuale',
    //collapsible: true,
    //collapseDirection :'right',
    split: true,
    layout : 'fit',


    initComponent: function() {
        this.items= [
            {
                xtype     : 'textareafield',
                grow      : true,
                name      : 'message',
                anchor    : '100%',
                readOnly  : true
            }
        ];

        this.callParent(arguments);
    },

    accoda:function(payload){
        //{type:"chat_msg", token:null,value:{username:"fff", ts:timestamp in utc, msg:"aaaa"}}
        var datamsg=Ext.Date.format(new Date(payload.ts*1000), 'd/m/y H:i');
        if(!this.schermo)
        {
            this.schermo =datamsg + " " + payload.username + " : " + payload.msg;
        }
        else
        {
            this.schermo +='\n' + datamsg + " " + payload.username + " : " + payload.msg;
        }
        this.query('textareafield[name="message"]')[0].setValue(this.schermo);
    }
});
