package fr.umontpellier.iut.gui;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/")
public class WebSocketClient {
    @OnOpen
    public void onOpen(Session session) {
        GameServer.addClient(session);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        GameServer.addInput(message);
    }

    @OnClose
    public void onClose(Session session) {
        GameServer.removeClient(session);
    }

    @OnError
    public void onError(Throwable exception, Session session) {
        exception.printStackTrace();
        System.err.println("Error for client: " + session.getId());
    }
}