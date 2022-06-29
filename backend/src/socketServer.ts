import { json, Request } from "express";
import * as ws from 'ws';
import Game from "./model/game";

type MessageHandler = (
        msg: any,
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

    public connect(ws: ws, req: Request, userId: string, game: Game) {
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
                userId,
                game
            );
        })
    }
}