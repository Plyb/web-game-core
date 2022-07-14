import { Player } from "@plyb/web-game-core-shared";
import { json, Request } from "express";
import * as ws from 'ws';
import { log } from "./logger";
import Game from "./model/game";

type MessageHandler = (params: {
    body: any,
    send: (responseBody: any) => void,
    userId: string,
    game: Game,
    sendAll: (path: string, body?: any) => void
}) => void

export class SocketRouter {
    protected handlers: {[path: string]: MessageHandler} = {};

    public message(path: string, handler: MessageHandler) {
        this.handlers[path] = handler;
    }

    public use(path: string, controller: SocketRouter) {
        Object.entries(controller.handlers).forEach(([controllerPath, handler]) => {
            this.message(path + controllerPath, handler);
        })
    }
}

export function parseReqParams(req: Request) {
    const [path, params] = req.url.split('?');
    return new URLSearchParams(params);
}

export default class SocketServer extends SocketRouter {
    // TODO: set up deletion on disconnect
    // TODO: we'll need to figure out middleware
    private connectedSockets: {[userId: string]: ws} = {};

    public connect(ws: ws, player: Player, game: Game) {
        ws.on('message', (msg) => {
            const parsedMessage = JSON.parse(msg.toString());
            try {
                const path = parsedMessage.path;
                const reqBody = parsedMessage.body;
                if (!this.handlers[path]) {
                    throw new Error(`Unknown path: ${path}`);
                }
                this.handlers[path]({
                    body: reqBody,
                    send: (resBody) => ws.send(JSON.stringify({ id: parsedMessage.id, body: resBody})),
                    userId: player.id,
                    game,
                    sendAll: (path, body) => this.sendAll(path, body)
                });
            } catch(error) {
                console.log(error.message || error);
                log(Game.getGame(game.id), 'Error: ' + error);
                ws.send(JSON.stringify({id: parsedMessage.id, error: true, body: error.message || error}));
            }
            
        });

        if (this.connectedSockets[player.id]) {
            this.connectedSockets[player.id].close();
        }

        this.connectedSockets[player.id] = ws;
    }
    
    public sendAll(path: string, body: any) {
        Object.values(this.connectedSockets).forEach((otherSocket: ws) => {
            otherSocket.send(JSON.stringify({ path, body }))
        })
    }
}