import { Player } from "@plyb/web-game-core-shared";
import { json, Request } from "express";
import * as ws from 'ws';
import Game from "./model/game";

type MessageHandler = (
    body: any,
    send: (responseBody: any) => void,
    userId: string,
    game: Game
) => void

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
    private connectHandler: ConnectHandler;
    private connectedSockets: ws[] = [];

    public connect(ws: ws, req: Request, player: Player, game: Game) {
        const connectionParams = parseReqParams(req);
        
        ws.on('message', (msg) => {
            const parsedMessage = JSON.parse(msg.toString());
            const path = parsedMessage.path; // TODO constantize this
            const reqBody = parsedMessage.body;
            if (!this.handlers[path]) {
                throw new Error('Unknown path');
            }
            this.handlers[path](
                reqBody,
                (resBody) => ws.send(JSON.stringify({ id: parsedMessage.id, body: resBody})),
                player.id,
                game
            );
        });

        this.connectHandler((path, responseBody) => {
            this.connectedSockets.forEach((otherSocket: ws) => {
                otherSocket.send(JSON.stringify({ path, body: responseBody }))
            })
        }, player, game);

        this.connectedSockets.push(ws);
    }

    public onConnect(handler: ConnectHandler) {
        this.connectHandler = handler;
    }
}

type ConnectHandler = (
    sendAll: (path: string, responseBody: any) => void,
    player: Player,
    game: Game,
) => void;