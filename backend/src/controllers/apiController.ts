import express from "express";
import Game from "../model/game";
import SocketServer, { parseReqParams } from "../socketServer";

export function apiController(socketServer: SocketServer) {
    const router = express.Router();

    router.ws('', (ws, req) => { // TODO: it seems like we might need to do the parts besides connection in the socket server
        const parsedReq = parseReqParams(req);
        const username = parsedReq.get('username');
        if (!username) {
            throw new Error('Missing parameter: username')
        }

        const game = parsedReq.get('newGame')
            ? Game.createNewGame()
            : Game.getGame(parsedReq.get('gameId') || '');
        const player = game.join(username);

        socketServer.connect(ws, req, player.id);
        ws.send(JSON.stringify({gameId: game.id, playerId: player.id}))
    });

    return router;
}