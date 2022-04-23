import Player, { PlayerId } from "../player";
import Board, { Vec2 } from "./Board";

export default class BoardGameState {
    protected _hub: Board;
    public get hub(): Board {
        return this._hub;
    }

    protected _mats: Map<PlayerId, Board> = new Map();
    public get mats(): Map<PlayerId, Board> {
        return this._mats;
    }

    protected _players: Player[] = [];
    public get players(): Player[] {
        return this._players;
    };

    public constructor(hubSize: Vec2, players: Player[], matSize: Vec2) {
        this._hub = new Board(hubSize.x, hubSize.y);

        players.forEach((player) => {
            this._mats.set(player.id, new Board(matSize.x, matSize.y));
        })

        this._players = players.sort((a, b) => Math.random() - 0.5);
    }

    public toJSON(): string {
        const mats = Object.fromEntries(this._mats.entries());
        return JSON.stringify({
            hub: this._hub,
            players: this._players,
            mats,
        });
    }
}