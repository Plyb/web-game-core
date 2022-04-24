import Piece from "./Piece";

export type PieceLocation = Vec2 & {
    piece: Piece;
};

export type Vec2 = {
    x: number;
    y: number;
}

export default class Board {
    public readonly pieces: PieceLocation[] = [];
    public readonly size: Vec2;

    constructor(x: number, y: number) {
        this.size = {
            x,
            y,
        };
    }

    public placePiece(piece: Piece, x: number, y: number): void {
        this.pieces.push({
            x,
            y,
            piece,
        });
    }

    public static copy(board: Board): Board {
        const newBoard = new Board(board.size.x, board.size.y);
        board.pieces.forEach((piece) => {
            newBoard.placePiece(piece.piece, piece.x, piece.y);
        });
        return newBoard;
    }
}