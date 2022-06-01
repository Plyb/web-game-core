import { MoveLocation } from "../../../actions/MovePiecesAction";
import { newUUID } from "../../utils";
import BoardGameState from "../BoardGameState";
import { Vec2 } from "../types";

export enum ShapeSpace {
    None,
    Filled,
}

export type PieceId = string;

export type DragPiece = {
    piece: Piece,
    from: MoveLocation,
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];
    public readonly __type: string = this.constructor.name;
    public abstract readonly pivot: Vec2;

    public rotation: number = 0;

    constructor(public readonly id: PieceId = newUUID(Piece.name, 16)) {}

    public abstract getName(): string;
    public abstract getDescription(): string;

    public getPivotPercents(): Vec2 {
        const { x, y } = this.pivot;
        const width = this.shape[0].length;
        const height = this.shape.length;
        return {
            x: (x + 0.5) / width,
            y: (y + 0.5) / height,
        };
    }

    /**
     * 
     * @returns whether the piece should be placed
     */
    public onPlacedOnAction(otherPiece: Piece, from: MoveLocation, to: MoveLocation, gameState: BoardGameState): boolean {
        return true;
    }

    public onUndoPlacedOnAction(otherPiece: Piece, from: MoveLocation, to: MoveLocation, gameState: BoardGameState): void {
        return;
    }
}