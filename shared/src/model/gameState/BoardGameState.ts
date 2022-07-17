import Action from "../../actions/Action";
import Player, { PlayerId } from "../player";
import ActionHistory, { ActionDefinition, ActionNode } from "./ActionHistory";
import Board, { BoardId } from "./Board";
import Piece, { PieceId } from "./pieces/Piece";
import { Vec2 } from "./types";

export type ParametersExceptFirst<F> = 
    F extends new (arg0: BoardGameState, ...rest: infer R) => any ? R : never;
export type ActionConstructor = new (gameState: BoardGameState, ...args: any[]) => Action;
export default class BoardGameState {
    public readonly actionHistory: ActionHistory = new ActionHistory();

    protected _hub: Board;
    public get hub(): Board {
        return this._hub;
    }

    protected _mats: Map<PlayerId, Board> = new Map();
    public get mats(): Map<PlayerId, Board> {
        return this._mats;
    }

    protected _inventories: Map<PlayerId, Piece[]> = new Map();
    public get inventories(): Map<PlayerId, Piece[]> {
        return this._inventories;
    }

    protected _players: Player[] = [];
    public get players(): Player[] {
        return this._players;
    };

    private actionPromises: Map<string, ActionNodePromise> = new Map();

    public constructor(players: Player[], hubSize: Vec2 = {x: 10, y: 10}, matSize: Vec2 = {x: 10, y: 10}) {
        this._hub = new Board(hubSize.x, hubSize.y, 'hub');

        players.forEach((player) => {
            this._mats.set(player.id, new Board(matSize.x, matSize.y, player.id));
            this._inventories.set(player.id, []);
        })

        this._players = players.sort((a, b) => Math.random() - 0.5);
    }

    public toJSON(): string {
        const mats = Object.fromEntries(this._mats.entries());
        const inventories = Object.fromEntries(this._inventories.entries());
        return JSON.stringify({
            hub: this._hub,
            players: this._players,
            mats,
            inventories,
        });
    }

    public async executeAction<T extends ActionConstructor>(parentId: string | undefined, id: string, actionType: T, ...args: ParametersExceptFirst<T>): Promise<ActionDefinition[]> {
        const actionInstance = new actionType(this, ...args);
        actionInstance.id = id;
        const parent = parentId === undefined ? null : 
            (this.actionHistory.getById(parentId) || await this.waitForActionWithId(parentId));
        const node = this.applyActionInOrder(actionInstance, args, parentId);
        const descendants: ActionDefinition[] = this.actionHistory.getDescendants(parent);
        this.actionPromises.get(actionInstance.id)?.resolve(node);
        return descendants;
    }

    protected async waitForActionWithId(id: string) {
        const promise = new ActionNodePromise();
        this.actionPromises.set(id, promise);
        return promise.promise;
    }

    // Intended to be overridden in Proxy
    protected applyActionInOrder(action: Action, constructorArgs: any[], parentId?: string): ActionNode {
        action.execute();
        return this.actionHistory.add(action, constructorArgs);
    }

    public getBoard(boardId: BoardId) {
        if (boardId === 'hub') {
            return this.hub;
        } else {
            return this.mats.get(boardId);
        }
    }
}

class ActionNodePromise {
    public resolve: (value: ActionNode | PromiseLike<ActionNode>) => void;
    private reject: () => void;
    public readonly promise: Promise<ActionNode>
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        })
        this.resolve = () => {};
        this.reject = () => {};
        setTimeout(() => {
            this.reject();
        }, 10000);
    }
}