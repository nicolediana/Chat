Ext.define('Chat.store.token', {
    extend: 'Ext.data.Store',
    autoLoad: true,

    proxy: {
     //use sessionstorage if need to save data for that specific session only
     type: 'localstorage',
        id  : 'myProxyKey'
    }
});
