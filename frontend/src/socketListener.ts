import { Listener } from 'chnl/types/general';

type MessageHandler = (
    body: any
) => void

export default class SocketListener {
    protected handlers: {[path: string]: MessageHandler} = {};

    public message(path: string, handler: MessageHandler) {
        this.handlers[path] = handler;
    }

    public getWebsocketAsPromisedListener(): (callback: Listener, context?: any) => void {
        return (msg) => {
            const parsedMessage = JSON.parse(msg.toString());
            if (parsedMessage.id) { // is a WebsocketAsPromised response
                return;
            }

            const path = parsedMessage.path;
            const reqBody = parsedMessage.body;

            if (!this.handlers[path]) {
                throw new Error(`Unknown path: ${path}`);
            }
            this.handlers[path](reqBody);
        }
    }
}