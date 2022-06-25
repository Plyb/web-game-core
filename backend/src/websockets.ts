import WebSocket from 'ws';
import { Server } from 'http';

export default (expressServer: Server) => {
    const websocketServer = new WebSocket.Server({
        noServer: true,
        path: '/websockets'
    });

    expressServer.on('upgrade', (req, socket, head) => {
        websocketServer.handleUpgrade(req, socket, head, (websocket) => {
            websocketServer.emit('connection', websocket, req);
        })
    })

    websocketServer.on('connection', (websocketConnection, connectionRequest) => {
        if (!connectionRequest.url?.split) {
            return; // TODO: better error handling here
        }
        const [path, params] = connectionRequest.url?.split('?');
        const connectionParams = new URLSearchParams(params);

        websocketConnection.on('message', (message) => {
            const parsedMessage = JSON.parse(message.toString());
            websocketConnection.send('Echoing "' + parsedMessage + '" from ' + connectionParams.get('user'))
        })
    })

    return websocketServer;
}