import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { PieceTypes } from "@plyb/web-game-core-shared/src/model/gameState/pieces/PieceTypes";
import { ActionDefinition } from "@plyb/web-game-core-shared/src/model/gameState/ActionHistory";
import ActionTypes from "@plyb/web-game-core-shared/src/actions/ActionTypes";
import { MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import { DragPiece } from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import AlertCore from "./AlertCore";

export default class BoardGameStateProxy extends BoardGameState {
    public selectedPieces: DragPiece[] = [];
    private timeoutId: number = -1;
    private updateRate: number = 1000;
    constructor() {
        super([]);
    }

    public async setUpdateRate(updateRate: number) {
        this.updateRate = updateRate;
        const result = await this.load();
        this.setUpdateTimeout();
        return result;
    }

    private setUpdateTimeout() {
        clearTimeout(this.timeoutId);
        this.timeoutId = window.setTimeout(
            async () => {
                try {
                    await this.update();
                } catch(e) {
                    AlertCore.warning('Reloading game state...', 3000);
                }
                this.setUpdateTimeout();
            },
            this.updateRate
        );
    }

    public async load() {
        const response = await axios.get(`api/game/state/${Core.getGameId()}`);
        const originalGameState = JSON.parse(response.data.originalGameState);
        const actions = response.data.actions;
        this.updateFromPlain(originalGameState);
        this.applyActions(actions);
    }

    public getInventory(): Piece[] {
        return this._inventories.get(Core.getUserId() || "") || [];
    }

    public async executeAndSendAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        clearTimeout(this.timeoutId);
        const action = new actionType(this, ...args);
        action.execute();
        const parent = this.actionHistory.getLast();
        this.actionHistory.add(action, args);
        try {
            const response = await axios.post('api/game/state/action', {
                gameId: Core.getGameId(),
                actionType: action.name,
                actionArgs: args,
                id: action.id,
                parentId: parent?.action.id
            });
            const ancestors: ActionDefinition[] = response.data.actions;
            if (ancestors.length) {
                const numActionsToRemove = this.actionHistory.getSince(action.id).length + 1;
                for (let i = 0; i < numActionsToRemove; i++) {
                    this.actionHistory.removeLast();
                }
                this.applyActions(ancestors);
                action.execute();
            }
        } catch (e) {
            AlertCore.warning('Reloading game state...', 3000);
            await this.load();
        }
        this.setUpdateTimeout();
        return action;
    }


    private async update() {
        try {
            const response = await axios.get(`api/game/state/actions/${Core.getGameId()}/${this.actionHistory.getLast()?.action.id}`);
            this.applyActions(response.data.actions);
        } catch (e: any) {
            AlertCore.warning('Reloading game state...', 3000);
            await this.load();
        }
    }

    private applyActions(actions: ActionDefinition[]) {
        actions.forEach((actionDef: ActionDefinition) => {
            const action = new (ActionTypes.actionTypes[actionDef.type])(this, ...actionDef.args);
            action.id = actionDef.id;
            action.execute();
            this.actionHistory.add(action, actionDef.args);
        });

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