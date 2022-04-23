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
    const game = Game.getGame(gameId);
    const player = game.join(username);
    res.send({id: player.id});
})

router.post('/start', (req, res) => {
    const {gameId} = req.body;
    const game = Game.getGame(gameId);
    game.start();
    res.send();
})

router.get('/state/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const game = Game.getGame(gameId);
    res.send(game.gameState.toJSON());
})

export const GameController = {
    routes: router
}