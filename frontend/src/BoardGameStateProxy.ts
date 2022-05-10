import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { PieceTypes } from "@plyb/web-game-core-shared/src/model/gameState/pieces/PieceTypes";
import ActionHistory, { ActionDefinition } from "@plyb/web-game-core-shared/src/model/gameState/ActionHistory";
import ActionTypes from "@plyb/web-game-core-shared/src/actions/ActionTypes";
import { MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePieceAction";

type DragPiece = {
    piece: Piece,
    from: MoveLocation,
}
export default class BoardGameStateProxy extends BoardGameState {
    public draggingPiece: DragPiece | null = null;
    private intervalId: number = -1;
    constructor() {
        super([]);
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
        this.actionHistory.clear();
    }

    public getInventory(): Piece[] {
        return this._inventories.get(Core.getUserId() || "") || [];
    }

    public async executeAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        const action = await super.executeAction(actionType, ...args);
        try {
            const response = await axios.post('api/game/state/action', {
                gameId: Core.getGameId(),
                actionType: action.name,
                actionArgs: args,
            })
            this.applyActions(response.data.actions, response.data.timestamp);
        } catch (e) {
            await this.load();
        }
        return action;
    }

    private async update() {
        try {
            const response = await axios.get(`api/game/state/actions/${Core.getGameId()}/${this.lastActionGottenTimestamp}`);
            this.applyActions(response.data.actions, response.data.timestamp, true);
        } catch (e: any) {
            await this.load();
        }
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