import BoardGameState from "../model/gameState/BoardGameState";

export default abstract class Action {
    constructor(public readonly gameState: BoardGameState) {}

    public abstract execute(): void;
    public abstract undo(): void;
}