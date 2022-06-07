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
    private intervalId: number = -1;
    private updateRate: number = 1000;
    constructor() {
        super([]);
    }

    public async setUpdateRate(updateRate: number) {
        this.updateRate = updateRate;
        clearInterval(this.intervalId);
        const result = await this.load();
        this.intervalId = window.setInterval(
            () => {},
            updateRate
        );
        return result;
    }

    public async load() {
        const response = await axios.get(`api/game/state/${Core.getGameId()}`);
        const originalGameState = JSON.parse(response.data.originalGameState);
        const actions = response.data.actions;
        const timestamp = response.data.timestamp;
        this.updateFromPlain(originalGameState);
        this.applyActions(actions, timestamp, true);
    }

    public getInventory(): Piece[] {
        return this._inventories.get(Core.getUserId() || "") || [];
    }

    public async executeAndSendAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        clearInterval(this.intervalId);
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
                action.undo();
                this.applyActions(ancestors, 0, true);
                action.execute();
            }
        } catch (e) {
            AlertCore.warning('Reloading game state...', 3000);
            await this.load();
        }
        // this.intervalId = window.setInterval(
        //     () => this.update(),
        //     this.updateRate
        // );
        return action;
    }

    // public async executeAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
    //     clearInterval(this.intervalId);
    //     const lastGotten = this.actionHistory.getLastTimestamp();
    //     const action = await super.executeAction(actionType, ...args);
    //     try {
    //         const response = await axios.post('api/game/state/action', {
    //             gameId: Core.getGameId(),
    //             actionType: action.name,
    //             actionArgs: args,
    //             lastGotten
    //         });
    //         // remove our local version and use the server's
    //         this.actionHistory.removeLast();
    //         this.applyActions(response.data.actions, response.data.timestamp, true);
    //     } catch (e) {
    //         AlertCore.warning('Reloading game state...', 3000);
    //         await this.load();
    //     }
    //     this.intervalId = window.setInterval(
    //         () => this.update(),
    //         this.updateRate
    //     );
    //     return action;
    // }

    private async update() {
        try {
            const response = await axios.get(`api/game/state/actions/${Core.getGameId()}/${this.lastActionGottenTimestamp}`);
            this.applyActions(response.data.actions, response.data.timestamp, true);
        } catch (e: any) {
            AlertCore.warning('Reloading game state...', 3000);
            await this.load();
        }
    }

    // TODO: simplify this, we don't need the timestamp and such anymore
    private applyActions(actions: ActionDefinition[], timestamp: number, addToHistory = false) {
        this.lastActionGottenTimestamp = timestamp;
        actions.forEach((actionDef: ActionDefinition) => {
            const action = new (ActionTypes.actionTypes[actionDef.type])(this, ...actionDef.args);
            action.id = actionDef.id;
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