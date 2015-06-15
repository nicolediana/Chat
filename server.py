from twisted.web.server import Site
from twisted.web.static import File
from autobahn.twisted.websocket import WebSocketServerProtocol, \
    WebSocketServerFactory


class MyServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        print("Client connecting: {0}".format(request.peer))


    def onOpen(self):
        print("WebSocket connection open.")
       # self.factory.register(self)

  #  def onRegister(self, request):
  #      print("Registra: {0}".format(request.peer))
  #      dovrebbe salvare in listaUtenti un nuovo utente


    def onMessage(self, payload, isBinary):
    #{type:"chat_msg", token:"123",value:{msg:"aaaa"}}
    #eseguire onMessage solo se token valido
        #print("Text message received: {0}".format(payload.decode('utf8')))
        if isBinary:
            print("Binary message received: {0} bytes".format(len(payload)))
        else:
            print("Text message received: {0}".format(payload.decode('utf8')))
            print("------------messaggio--------------")
            print payload
            #decodifica della json
            msgjson = json.loads(payload)
            print msgjson
            print msgjson['value']
            tipo = msgjson['type']
            messaggio = msgjson['value']
            utentecertificato = False
            token = 0
            if(tipo == 'heartbeat' or tipo == 'login'):
                utentecertificato = True
            if(tipo == 'logout' or tipo == 'chat_msg'):
                token= msgjson['token']
                for utente in listaUtenti:
                    if utente['token'] == token:
                        utentecertificato = True
            if(tipo == 'reconnect'):
                print('---------------------RICONNESSIONE------------------------------------')
                token= msgjson['token']
                print('token di riconnessione %s' %token)
                if(token):
                    if token !="null":
                        riconnesso = False
                        for utente in listaUtenti:
                            if utente['token'] == token:
                                self.name=utente['username']
                                self.factory.register(self)
                                self.factory.broadcast('userlist')
                                riconnesso = True
                        if(riconnesso == False):    
                            body = { 'type' : 'logout', 'token' : 'null', 'value' : 'True'}
                            payload = json.dumps(body)
                            self.sendMessage(payload, isBinary)


            print( utentecertificato)
            if utentecertificato == False:
                if tipo == 'logout':
                    body = { 'type' : tipo, 'token' : 'null', 'value' : 'False'}
                    payload = json.dumps(body)
                    self.sendMessage(payload, isBinary)
                else: print("-----------UTENTE NON CERTIFICATO / TIPO MESSAGGIO NON CORRETTO------------")
            else:
                if tipo == 'chat_msg':
                    print("----------------------Messaggio di Chat-----------------------------")
                  #  user = 'Anonimo'
                  #  for utente in listaUtenti:
                  #      if utente['token'] == token:
                  #          user = utente['username']
                    user=self.name     #c.name
                    print('messaggio da parte di %s' %(self.name))
                    timestamp = time.time()

                    body = { 'type' : tipo, 'token' : 'null', 'value' : {'username' : user, 'ts' : timestamp, 'msg' : messaggio}}
                    payloadRx = json.dumps(body)
                    self.factory.broadcast(payloadRx)
                    print payloadRx
                #utente1 = listaUtenti[0]
                #print("utente 1")
                #print utente1['username']

                if tipo == 'login':
                    print('--------------------------LOGIN----------------------------------')
                    # controlla username e psw
                    usernameRx =str(messaggio['username'])
                    psw =str(messaggio['password'])
                    stringa = usernameRx + ' '+ psw
                    # creazione di un token statico in base a username e psw
                    tokenUsr = uuid.uuid5(uuid.NAMESPACE_DNS, stringa).hex
                    
                    logok=False
                    for utente in listaUtenti:
                        if(usernameRx == utente['username'] and tokenUsr == utente['token']):
                            logok=True
                            body = { 'type' : tipo, 'token' : tokenUsr, 'value' : 'null'}
                    
                    if logok==False:
                        body = { 'type' : tipo, 'token' : 'null', 'value' : 'null'}
                    else:
                        self.name = usernameRx
                        self.factory.register(self)
                        self.factory.broadcast('userlist')
                    payload = json.dumps(body)
                    print payload
                    self.sendMessage(payload, isBinary)
                
                if tipo == 'logout':
		    #controllo se token valido: se token corrisponde a ip che ha mandato la richieste, se si:
# lo tolgo da clients =lista di clienti attivi
                    print("--------------------------LOGOUT----------------------------------")
# il controllo del token lo fa con utentecertificato all inizio di onMessage
# se non valido il token invio sopra il messaggio di logout non valido
                    body = { 'type' : tipo, 'token' : 'null', 'value' : 'True'}
                    payload = json.dumps(body)
                    self.sendMessage(payload, isBinary)
                    self.factory.unregister(self)
                    # messaggio di userlist
                    self.factory.broadcast('userlist')
    #**{type:"chat_msg", token:null,value:{username:"fff",ts:timestamp in utc, msg:"aaaa"}}

   # def onLogout(self, request):
   #     print("Logout: {0}".format(reason))


    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {0}".format(reason))
        print("--------------CHIUSURA CONNESSIONE---------------")
        self.factory.unregister(self)
        self.factory.broadcast('userlist')


class BroadcastServerFactory(WebSocketServerFactory):

    def __init__(self, url, debug=False, debugCodePaths=False):
        WebSocketServerFactory.__init__(self, url, debug=debug, debugCodePaths=debugCodePaths)
        self.clients = []
        #self.tickcount = 0
        #self.tick()

    #def tick(self):
    #    self.tickcount += 1
    #    self.broadcast("tick %d from server" % self.tickcount)
    #    reactor.callLater(1, self.tick)

    def register(self, client):
        if client not in self.clients:
           # print("registered client {}".format(client.peer))
            self.clients.append(client)
            print("client aggiunto %s" %(client.peer) )
            print('client name : %s' %(client.name))
           
    def unregister(self, client):
       # if client in self.clients:
        #---------------------------------------
        #confronto per prova ip senza porta
        if client in self.clients:
            self.clients.remove(client)
            print("client rimosso")
        #---------------------------------------
           # self.clients.remove(client)

    def broadcast(self, msg):
        print("------broadcast------")
        if msg == "userlist":
            listaNick = []
            for cliente in self.clients:
               # ip = cliente.peer[0:18]
               # for utente in listaUtenti:
               #     if ip == utente['ip']:
               #         listaNick.append( utente['username'])
                listaNick.append(cliente.name)
            body = {'type' : 'userlist', 'token' : 'null', 'value' : listaNick}
            msg = json.dumps(body)
            print listaNick
        for c in self.clients:
            c.sendMessage(msg)
            print('--------------userlist inviata---------')
        print('se userlist vuota puo essere che e variato l ip in listaUtenti e non riconosce l utente')



if __name__ == '__main__':

    import sys
    import json
    import time
    import uuid

    from twisted.python import log
    from twisted.internet import reactor
    
    #username: Nicole psw:123, Thomas psw:456
    #uuid.uuid5(uuid.NAMESPACE_DNS, 'Nicole 123')
    listaUtenti=[{ 'username' : 'Nicole', 'token' : '5a2829b9ccd75002a5953a39d4954f3f' } , { 'username' : 'Thomas' , 'token' : '556f7f884cb05f35b9c98f9626f73e26'}, { 'username' : 'Nicola', 'token' :'fe76517d01ac50d4880bb7bb10001789' } , { 'username' : 'Amalia', 'token' : 'dc5049862c5c5a79bd435a72c353d550' } , { 'username' : 'AleR' , 'token' : '6a411beb3688531f88b06b98a8475e5b'} , { 'username' : 'Stefania' , 'token' : 'ebe4f80195b65a3e9780863cb6da05a7'},{ 'username' : 'AleP', 'token' :'6de9f554651e5161a9697ec610a54720'}]
    listaNick=[]    

    log.startLogging(sys.stdout)

   # factory = WebSocketServerFactory("ws://localhost:9000", debug=False)
    ServerFactory = BroadcastServerFactory
    factory = ServerFactory("ws://localhost:9000",
                            debug=False,
                            debugCodePaths=False)


    factory.protocol = MyServerProtocol
    # factory.setProtocolOptions(maxConnections=2)

    #factory.setProtocolOptions(allowHixie76=True)
    #listenWS(factory)

    webdir = File(".")
    web = Site(webdir)
    
    reactor.listenTCP(9000, factory)
    reactor.run()
