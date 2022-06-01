import DrawPile from "../model/gameState/pieces/DrawPile";
import Board, { BoardId, PieceLocation } from "../model/gameState/Board";
import { PieceId } from "../model/gameState/pieces/Piece";
import BoardGameState from "../model/gameState/BoardGameState";
import Action from "./Action"

export default class CollectIntoDrawPileAction extends Action {
    public readonly name = "CollectIntoDrawPileAction";
    private intersectedPieceLocations: PieceLocation[] = [];

    constructor(
        public readonly gameState: BoardGameState,
        public readonly pieceId: PieceId,
        public readonly boardId: BoardId,
    ) {
        super(gameState);
    }

    private getBoard(boardId: BoardId): Board {
        const board = this.gameState.getBoard(boardId);
        if (!board) {
            throw new Error(`Could not find board ${boardId} while collecting pieces`);
        }
        return board;
    }

    public execute(): void {
        const board = this.getBoard(this.boardId);
        const pieceLocation = board.pieces.find(
            (pieceLocation) => pieceLocation.piece.id === this.pieceId
        );
        if (!pieceLocation) {
            throw new Error(`Could not find piece ${this.pieceId} while collecting pieces`);
        }
        this.intersectedPieceLocations = board.getIntersectionsAt(pieceLocation.piece, pieceLocation.x, pieceLocation.y);
        board.pieces = board.pieces.filter((pieceLocation) => !this.intersectedPieceLocations.includes(pieceLocation));
        const pieces = this.intersectedPieceLocations.flatMap((pieceLocation) => {
            if (pieceLocation.piece instanceof DrawPile) {
                return pieceLocation.piece.rawPieces;
            }
            return [pieceLocation.piece];
        });
        const drawPile = new DrawPile([...pieces], true, pieceLocation.piece.id);
        board.placePiece(drawPile, pieceLocation.x, pieceLocation.y);
    }

    public undo(): void {
        // TODO implement undo
    }
}