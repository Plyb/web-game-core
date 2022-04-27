import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { PieceTypes } from "@plyb/web-game-core-shared/src/model/gameState/PieceTypes";

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
        this.updateFromPlain(response.data);
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

    private updateFromPlain(plain: BoardGameState) {
        this._hub = Board.copy(plain.hub);
        this._mats = new Map((Object.entries(plain.mats) as [BoardId, Board][])
            .map(([id, board]: [BoardId, Board]) => [id, Board.copy(board)]));
        this._players = plain.players;
        this._inventories = new Map(Object.entries(plain.inventories)
            .map(([id, pieces]: [string, Piece[]]) => [id, pieces.map(PieceTypes.copy)]));
    }
}