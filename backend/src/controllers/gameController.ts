import Game from '../model/game'
import express from "express";

const router = express.Router();

router.post('/', (req, res) => {
    const username = req.body.username;
    const game = Game.createNewGame();
    const player = game.join(username);
    res.send({gameId: game.id, playerId: player.id});
})

router.put('/', (req, res) => {
    const {id: gameId, username} = req.body;
    const game = Game.games[gameId];
    if (!game) {
        throw new Error("Game does not exist, did you type the code in correctly?");
    }
    const player = game.join(username);
    res.send({id: player.id});
})

export const GameController = {
    routes: router
}