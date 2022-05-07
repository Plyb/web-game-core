import Action from "../../actions/Action";
import Player, { PlayerId } from "../player";
import ActionHistory from "./ActionHistory";
import Board, { BoardId } from "./Board";
import Piece, { PieceId } from "./pieces/Piece";
import { Vec2 } from "./types";

export type ParametersExceptFirst<F> = 
    F extends new (arg0: BoardGameState, ...rest: infer R) => any ? R : never;
export type ActionConstructor = new (gameState: BoardGameState, ...args: any[]) => Action;
export default class BoardGameState {
    public readonly actionHistory: ActionHistory = new ActionHistory();
    public lastActionGottenTimestamp: number = 0;

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
            timestamp: this.lastActionGottenTimestamp,
        });
    }

    public async executeAction<T extends ActionConstructor>(actionType: T, ...args: ParametersExceptFirst<T>): Promise<Action> {
        const actionInstance = new actionType(this, ...args);
        actionInstance.execute();
        this.actionHistory.add(actionInstance, args);
        this.lastActionGottenTimestamp = Date.now();
        return actionInstance;
    }

    public getBoard(boardId: BoardId) {
        if (boardId === 'hub') {
            return this.hub;
        } else {
            return this.mats.get(boardId);
        }
    }
}