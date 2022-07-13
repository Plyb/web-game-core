import express from "express";
import Game from "../model/game";
import { SocketRouter } from "../socketServer";

// const router = express.Router();

// router.get('/:gameId', (req, res) => {
//     const gameId = req.params.gameId;
//     const game = Game.getGame(gameId);
//     if (!game) {
//         throw new Error("Game does not exist");
//     };
//     res.send({
//         players: game.getPlayerNames(),
//         started: game.isStarted(),
//     });
// })

// router.delete('/kick/:gameId/:username', (req, res) => {
//     const {gameId, username} = req.params;
//     const game = Game.getGame(gameId);
//     if (!game) {
//         throw new Error("Game does not exist");
//     }
//     game.leave(username);
//     res.send();
// })

// export const LobbyController = {
//     routes: router
// }

const router = new SocketRouter();

router.message('/get-players', ({send, game}) => {
    send({
        players: game.getPlayerNames(),
        started: game.isStarted(),
    })
});

router.message('/remove-player', ({body, game, sendAll}) => {
    game.leave(body.username);
    sendAll('/lobby/player-left', {
        playerName: body.username
    });
})

export default router;