import Piece, { ShapeSpace } from "./Piece";
import { Type } from "class-transformer";
import { PieceTypes } from "./PieceTypes";
import { MoveLocation } from "../../../actions/MovePiecesAction";
import BoardGameState from "../BoardGameState";


export default class DrawPile<PieceType extends Piece> extends Piece {
    @Type(() => Piece, {
        discriminator: PieceTypes.getClassTransformerDiscriminator(),
    })
    public readonly pieces: PieceType[];
    
    constructor(pieces: PieceType[], private showTopPiece: boolean = false, id?: string) {
        super(id);
        this.pieces = pieces;
    }

    public shouldShowTopPiece(): boolean {
        return this.showTopPiece && this.pieces.length > 0;
    }

    public flip() {
        this.showTopPiece = !this.showTopPiece;
        this.pieces.reverse();
    }

    public merge(other: PieceType | DrawPile<PieceType>) {
        if (other instanceof DrawPile) {
            this.pieces.push(...other.pieces);
        } else {
            this.pieces.push(other);
        }
    }

    public onPlacedOnAction(otherPiece: PieceType, from: MoveLocation, to: MoveLocation, gameState: BoardGameState): boolean {
        this.merge(otherPiece);
        return false;
    }

    public onUndoPlacedOnAction(otherPiece: Piece, from: MoveLocation, to: MoveLocation, gameState: BoardGameState) {
        if (otherPiece instanceof DrawPile) {
            this.pieces.splice(this.pieces.length - otherPiece.pieces.length, otherPiece.pieces.length);
        } else {
            this.pieces.pop();
        }
    }

    public get shape() {
        if (this.shouldShowTopPiece()) {
            return this.pieces[this.pieces.length - 1].shape;
        } else {
            return [
                [ShapeSpace.Filled, ShapeSpace.Filled],
                [ShapeSpace.Filled, ShapeSpace.Filled],
            ]
        }
    }

    get rawPieces(): Piece[] {
        return this.pieces;
    }

    public readonly pivot = {
        x: 0,
        y: 0,
    }

    public getDescription(): string {
        return 'A collection of pieces to draw from.';
    }

    public getName(): string {
        return 'Draw pile';
    }
}