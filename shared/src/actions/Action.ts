import { newUUID } from "../model/utils";
import BoardGameState from "../model/gameState/BoardGameState";

export default abstract class Action {
    public readonly abstract name: string;
    public id: string;

    constructor(public readonly gameState: BoardGameState) {
        this.id = newUUID('action');
    }

    public abstract execute(): void;
    public abstract undo(): void;
}