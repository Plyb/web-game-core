import DrawPile from "../model/gameState/pieces/DrawPile";
import BoardGameState from "../model/gameState/BoardGameState";
import Piece, { PieceId } from "../model/gameState/pieces/Piece";
import { PlayerId } from "../model/player";
import Action from "./Action";

type SortOrder = {[key: PieceId]: number}
export default class ShuffleAction extends Action {
    private drawPile: DrawPile<Piece>;
    private preSortOrder: SortOrder;
    private postSortOrder?: SortOrder;

    constructor(
        public readonly gameState: BoardGameState,
        public readonly boardId: PlayerId,
        public readonly drawPileId: PieceId,
    ) {
        super(gameState);

        this.drawPile = this.findDrawPile();
        this.preSortOrder = this.getSortOrder();
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

    private getSortOrder(): SortOrder {
        return this.drawPile.pieces.reduce((acc, piece, i) => {
            acc[piece.id] = i;
            return acc;
        }, {} as SortOrder);
    }

    public execute(): void {
        const { drawPile } = this;
        const pieces = drawPile.pieces;
        const postSortOrder = this.postSortOrder;
        if (postSortOrder === undefined) {
            pieces.sort((a, b) => Math.random() - 0.5);
            this.postSortOrder = this.getSortOrder();
            return;
        }
        pieces.sort((a, b) => postSortOrder[a.id] - postSortOrder[b.id]);
    }

    public undo(): void {
        const { drawPile } = this;
        const pieces = drawPile.pieces;
        const preSortOrder = this.preSortOrder;
        pieces.sort((a, b) => preSortOrder[a.id] - preSortOrder[b.id]);
    }
}