import { PlayerId } from "../../player";
import DrawPieceAction from "../../../actions/DrawPieceAction";
import { BoardId } from "../Board";
import Piece, { Interaction, ShapeSpace } from "./Piece";
import { Type } from "class-transformer";
import { PieceTypes } from "./PieceTypes";
import ShuffleAction from "../../../actions/ShuffleAction";
import FlipDrawPileAction from "../../../actions/FlipDrawPileAction";
import { MoveLocation } from "../../../actions/MovePieceAction";
import BoardGameState from "../BoardGameState";

export enum Interactions {
    Draw = "Draw",
    Shuffle = "Shuffle",
    Flip = "Flip",
}
export default class DrawPile<PieceType extends Piece> extends Piece {
    @Type(() => Piece, {
        discriminator: PieceTypes.getClassTransformerDiscriminator(),
    })
    public readonly pieces: PieceType[];
    
    constructor(pieces: PieceType[], private showTopPiece: boolean = false) {
        super();
        this.pieces = pieces;
    }

    public getBoardInteractions(boardId: BoardId, interactingPlayer: PlayerId): Interaction[] {
        const interactions =  super.getBoardInteractions(boardId, interactingPlayer);
        if (this.pieces.length > 0) {
            interactions.push({
                label: 'Draw',
                action: (gameState) => {
                    gameState.executeAction(DrawPieceAction, boardId, this.id, interactingPlayer);
                    return Interactions.Draw;
                }
            }, {
                label: 'Shuffle',
                action: (gameState) => {
                    gameState.executeAction(ShuffleAction, boardId, this.id);
                    return Interactions.Shuffle;
                }
            }, {
                label: 'Flip',
                action: (gameState) => {
                    gameState.executeAction(FlipDrawPileAction, boardId, this.id);
                    return Interactions.Flip;
                }
            });
        }
        return interactions;
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