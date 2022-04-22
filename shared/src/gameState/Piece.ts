
export enum ShapeSpace {
    None,
    Pivot,
    Filled,
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];
}