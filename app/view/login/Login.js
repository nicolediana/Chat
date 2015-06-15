Ext.define('Chat.view.login.Login',{
    extend: 'Ext.window.Window',
    alias : 'widget.login',
    requires: [ 'Ext.form.Panel'],
    controller: 'login',
    bodyPadding: 10,
    title: 'Login Window',
    closable: false,
    autoShow: true,
    width: 370,

    initComponent: function() {
        this.tbar=[
            {
            xtype: 'form',
            reference: 'form',

            items: [{
                xtype: 'textfield',
                name: 'username',
                fieldLabel: 'Username',
                labelWidth :60,
                margin:'20 20 20 40',
                allowBlank: false
            }, {
                xtype: 'textfield',
                name: 'password',
                inputType: 'password',
                fieldLabel: 'Password',
                labelWidth :60,
                margin:'20 20 20 40',
                allowBlank: false
            }] },{
                xtype: 'button',
                text: 'Login',
                formBind: true,
                margin:'10 10 10 10',
                wight: 60,
                height:30,
                action : 'login'
        }] ;

        this.callParent(arguments);
    }
});
