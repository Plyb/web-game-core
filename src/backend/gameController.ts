import Game from './model/game'
import express from "express";

const router = express.Router();

// router.get('/', async (req, res) => {
//     res.send({game: Game.instance});
// })

router.post('/', async (req, res) => {
    const game = Game.createNewGame();
    res.send({id: game.id});
})

// router.put('/start', async(req, res) => {
//     Game.instance.startGame();
//     res.sendStatus(200);
// })

export const GameController = {
    routes: router
}