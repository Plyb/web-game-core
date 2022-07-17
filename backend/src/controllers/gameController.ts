import Game from '../model/game'
import express from "express";
import ActionTypes from '@plyb/web-game-core-shared/src/actions/ActionTypes';
import { StateConstructor } from '..';
import { logAction } from '../logger';
import SocketClientProxy, { SocketRouter } from '../socketServer';

export function getGameController(GameStateType: StateConstructor) {
    const router = new SocketRouter();

    // TODO: constantize routes
    router.message('/get-game-info', ({send, userId, game}) => {
        send({
            gameId: game.id,
            userId,
        });
    })

    router.message('/start', ({game, send, sendAll}) => {
        game.start(GameStateType);
        send();
        sendAll('/lobby/game-started', undefined, false);
    })

    function getLoadResponse(game: Game, error: boolean = false) {
        return {
            originalGameState: game.originalGameStateJson,
            actions: game.gameState.actionHistory.getAllActions(),
            error,
        };
    }

    router.message('/load-state', ({send, game}) => {
        send(getLoadResponse(game))
    })

    router.message('/do-action', async ({body, game, send, sendAll}) => {
        const { id, parentId, actionType, actionArgs } = body;
        try {
            await game.gameState.executeAction(parentId, id, ActionTypes.actionTypes[actionType], ...actionArgs); // TODO: this doesn't need to be async
            logAction(game, actionType, actionArgs);
            sendAll('/game/action-done', {
                action: {
                    type: actionType,
                    args: actionArgs,
                    id,
                },
                parentId,
            }, false);
        } catch (e) {
            if (e instanceof TypeError) {
                throw new Error(e.message + ", did you forget to add it using ActionTypes.addActionType(...)?");
            } else {
                send(getLoadResponse(game, true));
            }
        }
    })

    return router;
}