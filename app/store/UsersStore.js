Ext.define('Chat.store.UsersStore', {
    extend: 'Ext.data.Store',
    model: 'Chat.model.Users',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'users'
        }
    }

});
