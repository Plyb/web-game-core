import Piece from "./Piece";

export default abstract class FlippablePiece extends Piece {
    public abstract flip(): void;
}