import BoardGameState from "../model/gameState/BoardGameState";
import Action from "./Action";

export default class UndoAction extends Action {
    public readonly actionToUndo: Action;

    constructor(
        public readonly gameState: BoardGameState,
    ) {
        super(gameState);
        const actionToUndo = this.gameState.actionHistory.getNextUndoRedoAction();
        if (!actionToUndo) {
            throw new Error("No action to undo");
        }
        this.actionToUndo = actionToUndo;
    }

    public execute(): void {
        this.actionToUndo.undo();
    }

    public undo(): void {
        this.actionToUndo.execute();
    }
}