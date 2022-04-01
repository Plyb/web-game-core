import Game from './model/game'
import express from "express";

const router = express.Router();

// router.get('/', async (req, res) => {
//     res.send({game: Game.instance});
// })

router.post('/', async (req, res) => {
    const username = req.body.username;
    const game = Game.createNewGame();
    const player = game.join(username);
    res.send({gameId: game.id, playerId: player.id});
})

router.put('/', async (req, res) => {
    const {id: gameId, username} = req.body;
    const player = Game.games[gameId].join(username);
    res.send({id: player.id});
})

// router.put('/start', async(req, res) => {
//     Game.instance.startGame();
//     res.sendStatus(200);
// })

export const GameController = {
    routes: router
}