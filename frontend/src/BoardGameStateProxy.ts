import { Board, BoardGameState, Piece } from "@plyb/web-game-core-shared";
import Core, { sendRequest, setSocketListener } from "./core";
import Action from "@plyb/web-game-core-shared/src/actions/Action";
import { ActionConstructor, ParametersExceptFirst } from "@plyb/web-game-core-shared/src/model/gameState/BoardGameState";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { PieceTypes } from "@plyb/web-game-core-shared/src/model/gameState/pieces/PieceTypes";
import { ActionDefinition, ActionNode } from "@plyb/web-game-core-shared/src/model/gameState/ActionHistory";
import ActionTypes from "@plyb/web-game-core-shared/src/actions/ActionTypes";
import { DragPiece } from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import AlertCore from "./AlertCore";
import SocketListener from "./socketListener";

export default class BoardGameStateProxy extends BoardGameState {
    public selectedPieces: DragPiece[] = [];
    constructor() {
        super([]);
    }

    public async load() {
        const response = await sendRequest('/game/load-state');
        this.applyLoadResponse(response.body);

        const socketListener = new SocketListener();
        socketListener.message('/game/action-done', async (body) => {
            try {
                const { action, parentId } = body;
                await this.executeAction(parentId, action.id, ActionTypes.actionTypes[action.type], ...action.args);
            } catch (e: any) {
                this.reload();
            }
        });
        setSocketListener(socketListener);
    }

    private applyLoadResponse(responseBody: {originalGameState: string, actions: ActionDefinition[]}) {
        const originalGameState = JSON.parse(responseBody.originalGameState);
        const actions = responseBody.actions;
        this.updateFromPlain(originalGameState);
        this.applyActions(actions);
    }

    private async reload() {
        AlertCore.warning('Reloading game state...', 3000);
        await this.load();
    }

    public getInventory(): Piece[] {
        return this._inventories.get(Core.getUserId() || "") || [];
    }

    public async executeAndSendAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        const action = new actionType(this, ...args);
        action.execute();
        const parent = this.actionHistory.getLast();
        this.actionHistory.add(action, args);
        try {
            const response = await sendRequest('/game/do-action', {
                gameId: Core.getGameId(),
                actionType: action.name,
                actionArgs: args,
                id: action.id,
                parentId: parent?.action.id
            });
            if (response.failed) {
                this.applyLoadResponse(response);
            }
        } catch (e) {
            // Shouldn't ever get here, but keeping it in case
            await this.reload();
        }
        return action;
    }

    private applyActions(actions: ActionDefinition[]) {
        actions.forEach((actionDef: ActionDefinition) => {
            const action = new (ActionTypes.actionTypes[actionDef.type])(this, ...actionDef.args);
            action.id = actionDef.id;
            action.execute();
            this.actionHistory.add(action, actionDef.args);
        });
    }

    protected applyActionInOrder(action: Action, constructorArgs: any[], parentId?: string): ActionNode {
        const rewound = this.actionHistory.rewindUntil(parentId);
        action.execute();
        const node = this.actionHistory.add(action, constructorArgs);
        rewound.forEach((rewoundActionDef) => {
            const type = ActionTypes.actionTypes[rewoundActionDef.type];
            const rewoundAction = new type(this, ...rewoundActionDef.args); // TODO this is very code duplicated, fix
            rewoundAction.id = rewoundActionDef.id;
            rewoundAction.execute();
            this.actionHistory.add(rewoundAction, rewoundActionDef.args);
        });
        return node;
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