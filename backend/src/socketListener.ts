import { json, Request } from "express";
import * as ws from 'ws';

type MessageHandler = (msg: any, send: (responseBody: any) => void, userId: string) => void

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

export default class SocketServer extends SocketRouter {
    // TODO: set up deletion on disconnect
    // TODO: we'll need to figure out middleware

    public connect(ws: ws, req: Request) {
        const [path, params] = req.url.split('?');
        const connectionParams = new URLSearchParams(params);
        const userId = connectionParams.get('user'); // TODO constantize this
        if (!userId) {
            throw new Error('Must include user in connection parameters')
        }
        
        ws.on('message', (msg) => {
            const parsedMessage = JSON.parse(msg.toString());
            const path = parsedMessage.path; // TODO constantize this
            const reqBody = parsedMessage.body;
            if (!this.handlers[path]) {
                throw new Error('Unknown path');
            }
            this.handlers[path](
                reqBody,
                (resBody) => ws.send(resBody),
                userId
            );
        })
    }
}