import { PlayerId } from "../player";
import Piece, { ShapeSpace } from "./pieces/Piece";
import { PieceTypes } from "./pieces/PieceTypes";
import { Vec2 } from "./types";

export type PieceLocation = Vec2 & {
    piece: Piece;
};

export type BoardId = PlayerId | 'hub';

export default class Board {
    public readonly pieces: PieceLocation[] = [];
    public readonly size: Vec2;

    constructor(x: number, y: number, public readonly id: BoardId) {
        this.size = {
            x,
            y,
        };
    }

    public getIntersectionsAt(piece: Piece, x: number, y: number): PieceLocation[] {
        return this.pieces.filter((existingPiece) => {
            return piecesIntersect(existingPiece, { x, y, piece })
        });
    }

    public getIntersectionsAtIndex(piece: Piece, index: number): PieceLocation[] {
        return this.getIntersectionsAt(piece, index % this.size.x, Math.floor(index / this.size.x));
    }

    public placePiece(piece: Piece, x: number, y: number): void {
        this.pieces.push({
            x,
            y,
            piece,
        });
    }

    public placePieceCellIndex(piece: Piece, cellIndex: number): void {
        this.placePiece(piece, cellIndex % this.size.x, Math.floor(cellIndex / this.size.x));
    }

    public static copy(board: Board): Board {
        const newBoard = new Board(board.size.x, board.size.y, board.id);
        board.pieces.forEach((piece) => {
            newBoard.placePiece(PieceTypes.copy(piece.piece), piece.x, piece.y);
        });
        return newBoard;
    }
}

function getFilledSpaces(pieceLocation: PieceLocation): Vec2[] {
    const filledSpaces: Vec2[] = [];
    pieceLocation.piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === ShapeSpace.Filled) {
                filledSpaces.push({
                    x: x + pieceLocation.x - pieceLocation.piece.pivot.x,
                    y: y + pieceLocation.y - pieceLocation.piece.pivot.y,
                });
            }
        });
    })
    return filledSpaces;
}

function piecesIntersect(a: PieceLocation, b: PieceLocation): boolean {
    const aFilledSpaces = getFilledSpaces(a);
    const bFilledSpaces = getFilledSpaces(b);
    return bFilledSpaces.some((bSpace) => aFilledSpaces.some(aSpace => {
        return aSpace.x === bSpace.x && aSpace.y === bSpace.y;
    }));
}