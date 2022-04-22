import express from "express";
import Game from "../model/game";

const router = express.Router();

router.get('/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const game = Game.games[gameId];
    if (!game) {
        throw new Error("Game does not exist");
    };
    res.send({
        players: game.getPlayerNames(),
        started: game.isStarted(),
    });
})

router.delete('/kick/:gameId/:username', (req, res) => {
    const {gameId, username} = req.params;
    const game = Game.games[gameId];
    if (!game) {
        throw new Error("Game does not exist");
    }
    game.leave(username);
    res.send();
})

export const LobbyController = {
    routes: router
}