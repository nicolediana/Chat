Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'Chat',

    appFolder: 'app',
    controllers: ['Chat.controller.Users'],
    stores: ['UsersStore'],

    launch: function() {
        /*
        //spostato nel controller.Users

        Ext.create('Ext.container.Viewport', {

            layout: 'border',    //  'border',
            items: [{
                    xtype: 'menuimpostazioni',
                    region: 'north'
                },{
                    xtype: 'listaUtenti',
                    region: 'west'
                },{
                    xtype: 'areaChat',
                    region: 'center'
                },{
                    xtype: 'areaVideo',
                    region: 'east'
                },{
                    xtype: 'tastieraChat',
                    region: 'south'
            }]
        });
        */
    }
});
