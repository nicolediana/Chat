Ext.define('Chat.view.menu.Menu' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.menuimpostazioni',
    autoShow: true,
    border: true,
    margins: '0 0 0 0',

    initComponent: function() {

        this.tbar= [
            {
                xtype: 'label',
                text: 'Chat SiRio | '
            },
            {
                xtype: 'button',
                text: 'Impostazioni'
                //action: ''
            },
            {
                xtype: 'button',
                text: 'Video chiamata'
                //action: ''
            },
            {
                xtype: 'button',
                text: 'Audio'
                //action: ''
            },
            {
                xtype: 'button',
                text: 'Chat'
                //action: ''
            },
            {
                xtype: 'button',
                text: 'Logout',
                action: 'logout'
            }
        ];

        this.callParent(arguments);
    }
});
