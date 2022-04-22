import Piece from "./Piece";

type PieceLocation = {
    x: number;
    y: number;
    piece: Piece;
};

export default class Board {
    public readonly pieces: PieceLocation[] = [];

    public placePiece(piece: Piece, x: number, y: number): void {
        this.pieces.push({
            x,
            y,
            piece,
        });
    }
}