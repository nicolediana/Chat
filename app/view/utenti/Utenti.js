Ext.define('Chat.view.utenti.Utenti' ,{
    extend: 'Ext.grid.Panel',
    alias: 'widget.listaUtenti',
    store: 'UsersStore',
    autoShow: true,
    title: 'Utenti disponibili',
    collapsible: true,
    collapseDirection :'left',
    //autoScroll: true,
    split: true,
    width: 150,

    initComponent: function() {
        this.columns = [
            {
                header: ' ',
                dataIndex: 'name',
                flex: 1
            }
        ];
        this.callParent(arguments);
    }
});
