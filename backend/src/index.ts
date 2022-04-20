import express, { NextFunction, Request, Response, Router } from "express"
import bodyParser from "body-parser";
import { GameController } from "./controllers/gameController";
import { LobbyController } from "./controllers/lobbyController";
export default (routes: Array<{path: string, router: Router}>) => {

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

    app.use("/api/game", GameController.routes);
    app.use("/api/lobby", LobbyController.routes);
    routes.forEach(route => {
        app.use(route.path, route.router);
    })
    app.use(function (error: any, req: Request, res: Response, next: NextFunction) {
        res.status(500).send(error.message);
    })

    app.listen(3000, () => console.log('Server listening on port 3000!'));
}