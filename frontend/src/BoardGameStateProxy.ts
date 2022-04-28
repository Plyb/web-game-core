import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { PieceTypes } from "@plyb/web-game-core-shared/src/model/gameState/PieceTypes";
import { ActionDefinition } from "@plyb/web-game-core-shared/src/model/gameState/ActionHistory";
import ActionTypes from "@plyb/web-game-core-shared/src/actions/ActionTypes";

export default class BoardGameStateProxy extends BoardGameState {
    private intervalId: number = -1;
    constructor() {
        super({x: 0, y: 0}, [], {x: 0, y: 0});
    }

    public async setUpdateRate(updateRate: number) {
        clearInterval(this.intervalId);
        const result = await this.load();
        this.intervalId = window.setInterval(
            () => this.update(),
            updateRate
        );
        return result;
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
        const response = await axios.post('api/game/state/action', {
            gameId: Core.getGameId(),
            actionType: actionType.name,
            actionArgs: args,
        })
        this.applyActions(response.data.actions, response.data.timestamp);
        return action;
    }

    private async update() {
        const response = await axios.get(`api/game/state/actions/${Core.getGameId()}/${this.lastActionGottenTimestamp}`);
        this.applyActions(response.data.actions, response.data.timestamp, true);
    }

    private applyActions(actions: ActionDefinition[], timestamp: number, addToHistory = false) {
        this.lastActionGottenTimestamp = timestamp;
        actions.forEach((actionDef: ActionDefinition) => {
            const action = new (ActionTypes.actionTypes[actionDef.type])(this, ...actionDef.args);
            action.execute();
            if (addToHistory) {
                this.actionHistory.add(action, actionDef.args);
            }
        });

    }

    private updateFromPlain(plain: BoardGameState) {
        this._hub = Board.copy(plain.hub);
        this._mats = new Map((Object.entries(plain.mats) as [BoardId, Board][])
            .map(([id, board]: [BoardId, Board]) => [id, Board.copy(board)]));
        this._players = plain.players;
        this._inventories = new Map(Object.entries(plain.inventories)
            .map(([id, pieces]: [string, Piece[]]) => [id, pieces.map(PieceTypes.copy)]));
        this.lastActionGottenTimestamp = plain.lastActionGottenTimestamp;
    }
}