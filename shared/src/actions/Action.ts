import BoardGameState from "../model/gameState/BoardGameState";

export default abstract class Action {
    public readonly abstract name: string;

    constructor(public readonly gameState: BoardGameState) {}

    public abstract execute(): void;
    public abstract undo(): void;
}