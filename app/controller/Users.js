Ext.define('Chat.controller.Users', {
    extend: 'Ext.app.Controller',
    stores: ['UsersStore'],
    models: ['Users'],
    views: ['Chat.view.menu.Menu', 'Chat.view.utenti.Utenti','Chat.view.chat.SchermoChat','Chat.view.chat.TastieraChat','Chat.view.audiovideo.SchermoVideo','Chat.view.login.Login'],

    refs: [{
        ref: 'text',
        selector: 'tastieraChat textareafield[name=message]'
    },{
        ref: 'textarea',
        selector: 'areaChat textareafield[name=message]'
    },
        {
            ref: 'panelarea',
            selector: 'areaChat'
        }

        //-------------parte nuova-----------------------------------
        ,
         {
         ref: 'password',
         selector: 'login textfield[name=password]'
         },
         {
         ref: 'user',
         selector: 'login textfield[name=username]'
         },
         {
         ref: 'login',
         selector: 'login'
         } ,
        {
            ref: 'listaconnessi',
            selector: 'listaUtenti'
        } ,
        {
            ref: 'panelvideo',
            selector: 'areaVideo'
        }
        //-------------------------------------------------------------
    ],

    init: function() {

        this.connesso=false;            //Ã¨ lo stesso di this.ws.readyState==0
        var me=this;

        //--------------------------parte nuova------------------------------------

        this.token=localStorage.getItem('token_localStorage');
        if(!this.token){
            this.finestraLogin=Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [{
                        xtype: 'login',
                        title: 'Login'
                    }]
            });
        this.init=this.finestraLogin;
        }
        else this.caricaFinestraDiChat();

        //-----------------------------------------------------------------------

        //------------------------WEB SOCKET-------------------------------------
        //this.ws=new WebSocket('ws://siriovoismart.herokuapp.com:80/');

        this.ws=new WebSocket('ws://192.168.1.126:9000/');

        this.ws.onopen=function(){
            me.onOpen.apply(me,[]);
        }

        this.ws.onmessage=function(json){
            me.onMessage.apply(me,[json]);
        };

        this.ws.onclose=function(){
            me.onClose.apply(me,[]);
        };

        this.ws.onerror=function(){
            console.log('errore');
        };

        //------------------------FINE WEB SOCKET-------------------------------------

        // Gestione bottoni

        this.control({

            'tastieraChat button[action=invia]': {
                click: this.updateChat
            },

            'menuimpostazioni button[action=logout]': {
                click: this.logoutChat
            },

            'login  button[action=login]': {
                click: this.loginChat
            },

            'areaVideo button[action=apriWebcam]': {
                click: this.avvioWebcam
            } ,

            'areaVideo button[action=chiudiWebcam]': {
                click: this.terminaWebcam
            }
        });

    },

    caricaFinestraDiChat: function(){
        Ext.create('Ext.container.Viewport', {

            layout: 'border',
            items: [{
                xtype: 'menuimpostazioni',
                region: 'north'
            },{
                xtype: 'listaUtenti',
               // xtype: 'griglia',
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
    },

    loginChat: function(button) {
        var pwd =this.getPassword().getValue( );
        var user =this.getUser().getValue( );
        var jsonData= {
            type : "login",
            value : {username:user, password:pwd}
        };
        //this.jsonvar=Ext.JSON.encode(jsonData);
        this.ws.send(JSON.stringify(jsonData));
        console.log('Invio richiesta di login con username e password: ',JSON.stringify(jsonData));
    },

    logoutChat: function(button) {
        var jsonData= {
            type : "logout",
            token : this.token,
            value : ""
        };
        this.ws.send(JSON.stringify(jsonData));
        console.log('messaggio di logout: ',JSON.stringify(jsonData));
   },

    updateChat: function(button) {
        var stringa = this.getText().getSubmitValue();
        if(this.connesso){
            var jsonData= {
                type : "chat_msg",
                token : this.token,
                value : stringa
            };
            this.jsonvar=Ext.JSON.encode(jsonData);
            this.ws.send(this.jsonvar);
            console.log('messaggio inviato');
        }
        else{ this.schermo +='\n Connessione non attiva '; }
        //console.log(me.jsonvar); //console.log(Ext.JSON.decode(me.jsonvar)); //console.log('Invia messaggio :'+me.stringa+" connessione:  "+this.connesso );
        this.getTextarea().setValue(this.schermo);
        this.getText().setValue("");
    },

    //----------------------------------------------------------------------------------

    onOpen:function(){
        this.connesso=true;
        var me=this;
        var jsonData= {
            type : "reconnect",
            token : this.token,
            value : ""
        };
        this.ws.send(JSON.stringify(jsonData));
        console.log('messaggio di reconnect ');

        Ext.TaskManager.start({
            run:function(){
                me.Heartbeat.apply(me,[])} ,
            interval: 50000
        });
    },

    Heartbeat: function(){
        var jsonData= {
            type : "heartbeat",
            value : "clock"
        };
        var jsonvar=Ext.JSON.encode(jsonData);
        try{
            this.ws.send(jsonvar);
            console.log('invio messaggio ogni 50sec');
        }
        catch(e){
            console.error('',e.message);
        }
    },

    onMessage:function(json){
        var risposta=Ext.JSON.decode(json.data);        //oppure var risposta = JSON.parse(json.data);
        console.log(risposta.value, risposta.token);

        if(risposta.type.toString() == "chat_msg"){
            console.log("messaggio di chat");
            this.getPanelarea().accoda(risposta.value);
        }

        if(risposta.type.toString() == "login"){
            //{type:"login", token:123/null,value:null}
            if(risposta.token.toString() != "null"){
                localStorage.setItem("token_localStorage", risposta.token);            //memorizza token
                this.token=risposta.token;
                this.caricaFinestraDiChat();
                this.finestraLogin.destroy();
            }
            else Ext.Msg.alert("  ACCESSO  NEGATO  ");
        }

        if(risposta.type.toString() == "userlist"){
            //{type:"login", token:123/null,value:null}

            var store =this.getUsersStoreStore();          //recupera lo store con nomedellostore e Store finale
            store.removeAll();
            var list=risposta.value;
            for (var i=0; i<list.length; i++) {
                var utente=new Chat.model.Users({name:list[i]});
                store.add(utente);
            }
        }

        if(risposta.type.toString() == "logout"){
            //{type:"logout", token:null, value:true/false}  false se token non valido
            if(risposta.value.toString() == "True"){
                console.log("ok Logout, torna alla pag di login");
                this.token="";  //resetto il token
                localStorage.setItem("token_localStorage", "");
                window.location.reload();
                //history.go(0);
                //window.location.href=window.location.href;
            }
            else Ext.Msg.alert(" Logout non riuscito -> token non corretto");
        }
    } ,

    onClose:function(){
        this.connesso=false;
        console.log('\nchiusa connessione\n');
        Ext.TaskManager.destroy( );
    }  ,

    avvioWebcam: function(button) {
        var pannello=this.getPanelvideo();
        this.cam='';
        var me=this;
         navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        if (navigator.getUserMedia) {
            navigator.getUserMedia
            (
                { video: true,  audio: true },
                function (localMediaStream) {
                    me.cam=localMediaStream;                //flusso audio-video
                    var urlcam= window.URL.createObjectURL(localMediaStream);
                    pannello.update('<video whidth="auto" height="auto" autoplay src='+urlcam+' ></video>');
                }, onFailure);
        }
        else {
            alert('OOPS No browser Support');
        }
        function onFailure(err) {
            alert("The following error occured: " + err.name);
        }
    },

    terminaWebcam: function(button) {
        var pannello=this.getPanelvideo();
        this.cam.stop();
        var urlcam= '';
        pannello.update('<video src='+urlcam+' ></video>');
    }

});
