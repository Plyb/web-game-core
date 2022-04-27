import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";

export default class BoardGameStateProxy extends BoardGameState {
    private intervalId: number = -1;
    constructor() {
        super({x: 0, y: 0}, [], {x: 0, y: 0});
    }

    public async setUpdateRate(updateRate: number) {
        clearInterval(this.intervalId);
        this.intervalId = window.setInterval(
            () => this.load(),
            updateRate
        );
        return await this.load();
    }

    public async load() {
        const response = await axios.get(`api/game/state/${Core.getGameId()}`);
        this._hub = Board.copy(response.data.hub);
        this._mats = new Map((Object.entries(response.data.mats) as [BoardId, Board][])
            .map(([id, board]: [BoardId, Board]) => [id, Board.copy(board)]));
        this._players = response.data.players;
        this._inventories = new Map(Object.entries(response.data.inventories));
    }

    public getInventory(): Piece[] {
        return this._inventories.get(Core.getUserId() || "") || [];
    }

    public async executeAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        const action = super.executeAction(actionType, ...args);
        await axios.post('api/game/state/action', {
            gameId: Core.getGameId(),
            actionType: actionType.name,
            actionArgs: args,
        })
        return action;
    }
}