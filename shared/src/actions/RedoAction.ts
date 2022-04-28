import BoardGameState from "../model/gameState/BoardGameState";
import Action from "./Action";

export default class RedoAction extends Action {
    // Note that this itself must be an undo action
    public readonly actionToRedo: Action;

    constructor(
        public readonly gameState: BoardGameState,
    ) {
        super(gameState);
        const actionToRedo = this.gameState.actionHistory.getNextUndoRedoAction(true);
        if (!actionToRedo) {
            throw new Error("No action to redo");
        }
        this.actionToRedo = actionToRedo;
    }

    public execute(): void {
        this.actionToRedo.undo();
    }

    public undo(): void {
        this.actionToRedo.execute();
    }
}