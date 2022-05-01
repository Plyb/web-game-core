import express, { NextFunction, Request, Response, Router } from "express"
import 'reflect-metadata';
import bodyParser from "body-parser";
import { getGameController } from "./controllers/gameController";
import { LobbyController } from "./controllers/lobbyController";
import ActionTypes, { ActionConstructor } from "@plyb/web-game-core-shared/src/actions/ActionTypes";
import { BoardGameState, Player } from "@plyb/web-game-core-shared";
type ActionList = { [key: string]: ActionConstructor };
export type StateConstructor = (players: Player[]) => BoardGameState;
export default (
    routes: Array<{path: string, router: Router}>,
    usingActions: ActionList = {},
    GameStateType: StateConstructor = (players) => new BoardGameState(players)
) => {
    ActionTypes.addActionTypes(usingActions);

    const app = express();
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

    app.use("/api/game", getGameController(GameStateType));
    app.use("/api/lobby", LobbyController.routes);
    routes.forEach(route => {
        app.use(route.path, route.router);
    })
    app.use(function (error: any, req: Request, res: Response, next: NextFunction) {
        res.status(500).send(error.message);
    })

    app.listen(3000, () => console.log('Server listening on port 3000!'));
}