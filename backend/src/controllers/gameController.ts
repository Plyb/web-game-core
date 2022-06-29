import Game from '../model/game'
import express from "express";
import ActionTypes from '@plyb/web-game-core-shared/src/actions/ActionTypes';
import { StateConstructor } from '..';
import { logAction } from '../logger';
import SocketClientProxy, { SocketRouter } from '../socketServer';

export function getGameController(GameStateType: StateConstructor) {
    const router = new SocketRouter();

    // TODO: constantize routes
    router.message('/get-game-info', (msg, send, userId, game) => {
        send({
            gameId: game.id,
            userId,
        });
    })

    // router.post('/', (req, res) => {
    //     const username = req.body.username;
    //     const game = Game.createNewGame();
    //     const player = game.join(username);
    //     res.send({gameId: game.id, playerId: player.id});
    // })
    
    // router.put('/', (req, res) => {
    //     const {id: gameId, username} = req.body;
    //     const game = Game.getGame(gameId);
    //     const player = game.join(username);
    //     res.send({id: player.id});
    // })
    
    // router.post('/start', (req, res) => {
    //     const {gameId} = req.body;
    //     const game = Game.getGame(gameId);
    //     game.start(GameStateType);
    //     res.send();
    // })
    
    // router.get('/state/:gameId', (req, res) => {
    //     const gameId = req.params.gameId;
    //     const game = Game.getGame(gameId);
    //     res.send({
    //         originalGameState: game.originalGameStateJson,
    //         actions: game.gameState.actionHistory.getAllActions(),
    //     });
    // })
    
    // router.get('/state/actions/:gameId/:lastGotten', (req, res) => {
    //     const gameId = req.params.gameId;
    //     const lastGotten = req.params.lastGotten;
    //     const game = Game.getGame(gameId);
    //     const actions = game.gameState.actionHistory.getSince(lastGotten);
    //     res.send({ actions });
    // })
    
    // router.post('/state/action', async (req, res, next) => {
    //     const gameId = req.body.gameId;
    //     const parentId = req.body.parentId;
    //     const id = req.body.id;
    //     const game = Game.getGame(gameId);
    //     try {
    //         const actions = await game.gameState.executeAction(parentId, id, ActionTypes.actionTypes[req.body.actionType], ...req.body.actionArgs);
    //         logAction(game, req.body.actionType, req.body.actionArgs);
    //         res.send({ actions });
    //     } catch (e: any) {
    //         if (e instanceof TypeError) {
    //             next(new Error(e.message + ", did you forget to add it using ActionTypes.addActionType(...)?"));
    //         } else {
    //             next(e);
    //         }
    //         return;
    //     }
    // })

    return router;
}