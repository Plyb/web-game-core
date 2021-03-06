import express, { NextFunction, Request, Response, Router } from "express"
import expressWs from 'express-ws';
import 'reflect-metadata';
import bodyParser from "body-parser";
import { getGameController } from "./controllers/gameController";
import LobbyController from "./controllers/lobbyController";
import ActionTypes, { ActionConstructor } from "@plyb/web-game-core-shared/src/actions/ActionTypes";
import { BoardGameState, Player } from "@plyb/web-game-core-shared";
import { log } from "./logger";
import Game from "./model/game";
import SocketServer, { SocketRouter } from "./socketServer"
import { apiController } from "./controllers/apiController";
type ActionList = { [key: string]: ActionConstructor };
export type StateConstructor = (players: Player[]) => BoardGameState;
export default (
    routes: Array<{path: string, router: Router}>,
    usingActions: ActionList = {},
    GameStateType: StateConstructor = (players) => new BoardGameState(players)
) => {
    ActionTypes.addActionTypes(usingActions);

    const app = express();
    expressWs(app);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }))
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
    })

    //
    // testing
    //
    const socketServer = new SocketServer();
    socketServer.use("/game", getGameController(GameStateType));
    socketServer.use("/lobby", LobbyController);
    app.use('/api', apiController(socketServer));

    routes.forEach(route => {
        app.use(route.path, route.router);
    })



    app.use(function (error: any, req: Request, res: Response, next: NextFunction) {
        console.log(error.message);
        if (req.body?.gameId) {
            log(Game.getGame(req.body.gameId), error);
        } else if (req.params?.gameId) {
            log(Game.getGame(req.params.gameId), 'Error: ' + error)
        }
        res.status(500).send(error.message);
    })
    
    app.listen(3005, () => console.log('Server listening on port 3005!'));
}