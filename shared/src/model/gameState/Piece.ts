import { Vec2 } from "./Board";

export enum ShapeSpace {
    None,
    Filled,
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];

    public abstract readonly pivot: Vec2;
}