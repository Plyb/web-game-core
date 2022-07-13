import express from "express";
import Game from "../model/game";
import SocketServer, { parseReqParams } from "../socketServer";

export function apiController(socketServer: SocketServer) {
    const router = express.Router();

    router.ws('', (ws, req) => {
        const parsedReq = parseReqParams(req);
        const username = parsedReq.get('username');
        if (!username) {
            throw new Error('Missing parameter: username')
        }

        const game = parsedReq.get('newGame') === 'true'
            ? Game.createNewGame()
            : Game.getGame(parsedReq.get('gameId') || '');
        const player = game.join(username);

        socketServer.connect(ws, player, game);
        socketServer.sendAll('/lobby/player-joined', {
            playerName: player.username
        })
    });

    router.ws('/reconnect', (ws, req) => {
        const parsedReq = parseReqParams(req);
        const userId = parsedReq.get('userId');
        if (!userId) {
            throw new Error('Missing parameter: userId');
        }

        const game = Game.getGame(parsedReq.get('gameId') || '');
        const player = Object.values(game.players).find((p) => p.id === userId);
        socketServer.connect(ws, player, game);
    })

    return router;
}