import { newUUID } from "../utils";
import { Vec2 } from "./Board";

export enum ShapeSpace {
    None,
    Filled,
}

export type PieceId = string;
export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];

    public abstract readonly pivot: Vec2;

    constructor(public readonly id: PieceId = newUUID(Piece.name, 16)) {}
}