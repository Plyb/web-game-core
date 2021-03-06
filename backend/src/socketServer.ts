import { Player } from "@plyb/web-game-core-shared";
import { json, Request } from "express";
import * as ws from 'ws';
import { log } from "./logger";
import Game from "./model/game";

type MessageHandler = (params: {
    body: any,
    send: (responseBody?: any) => void,
    userId: string,
    game: Game,
    sendAll: (path: string, body?: any, includeRequester?: boolean) => void
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
    private connectedSockets: {[gameId: string]: {[userId: string]: ws}} = {};

    public connect(ws: ws, player: Player, game: Game) {
        ws.on('message', async (msg) => {
            const parsedMessage = JSON.parse(msg.toString());
            try {
                const path = parsedMessage.path;
                const reqBody = parsedMessage.body;
                if (!this.handlers[path]) {
                    throw new Error(`Unknown path: ${path}`);
                }
                await this.handlers[path]({
                    body: reqBody,
                    send: (resBody) => ws.send(JSON.stringify({ id: parsedMessage.id, body: resBody})),
                    userId: player.id,
                    game,
                    sendAll: (path, body, includeRequester: boolean = true) => 
                        this.sendAll(game.id, path, body, includeRequester ? undefined : player.id)
                });
            } catch(error) {
                console.log(error.message || error);
                log(Game.getGame(game.id), 'Error: ' + error);
                ws.send(JSON.stringify({id: parsedMessage.id, error: true, body: error.message || error}));
            }
            
        });

        if (this.connectedSockets[game.id]?.[player.id]) {
            this.connectedSockets[game.id]?.[player.id].close();
        }

        if (!this.connectedSockets[game.id]) {
            this.connectedSockets[game.id] = {};
        }

        this.connectedSockets[game.id][player.id] = ws;
    }
    
    public sendAll(gameIdToSendTo: string, path: string, body: any, excludeUser?: string) {
        Object.entries(this.connectedSockets).forEach((entry) => {
            const [gameId, gameEntry] = entry;
            if (gameId !== gameIdToSendTo) {
                return;
            }

            Object.entries(gameEntry).forEach((playerEntry) => {
                const [userId, otherSocket] = playerEntry;
                if (userId !== excludeUser) {
                    otherSocket.send(JSON.stringify({ path, body }));
                }
            })
        })
    }
}