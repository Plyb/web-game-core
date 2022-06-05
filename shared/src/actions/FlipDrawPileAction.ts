import DrawPile from "../model/gameState/pieces/DrawPile";
import BoardGameState from "../model/gameState/BoardGameState";
import Piece, { PieceId } from "../model/gameState/pieces/Piece";
import { PlayerId } from "../model/player";
import Action from "./Action";

export default class FlipDrawPileAction extends Action {
    public readonly name = "FlipDrawPileAction";
    private drawPile: DrawPile<Piece>;

    constructor(
        public readonly gameState: BoardGameState,
        public readonly boardId: PlayerId,
        public readonly drawPileId: PieceId,
    ) {
        super(gameState);

        this.drawPile = this.findDrawPile();
    }

    private findDrawPile() {
        const board = this.gameState.getBoard(this.boardId);
        if (!board) {
            throw new Error(`Could not find board ${this.boardId} while drawing piece ${this.drawPileId}`);
        }
        const drawPile = board.pieces.find(drawPile => drawPile.piece.id === this.drawPileId)?.piece;
        if (!drawPile || !(drawPile instanceof DrawPile)) {
            throw new Error(`Could not find draw pile ${this.drawPileId}`);
        }
        return drawPile;
    }

    public execute(): void {
        this.drawPile.flip();
    }

    public undo(): void {
        this.drawPile.flip();
    }
}