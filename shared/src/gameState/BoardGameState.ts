import Board, { Vec2 } from "./Board";

export default class BoardGameState {
    public readonly hub: Board;

    public constructor(hubSize: Vec2) {
        this.hub = new Board(hubSize.x, hubSize.y);
    }
}