import { PlayerId } from "../../player";
import DrawPieceAction from "../../../actions/DrawPieceAction";
import { BoardId } from "../Board";
import Piece, { Interaction, ShapeSpace } from "./Piece";
import { Type } from "class-transformer";
import { PieceTypes } from "./PieceTypes";
import ShuffleAction from "../../../actions/ShuffleAction";

export enum Interactions {
    Draw = "Draw",
    Shuffle = "Shuffle",
}
export default class DrawPile<PieceType extends Piece> extends Piece {
    @Type(() => Piece, {
        discriminator: PieceTypes.getClassTransformerDiscriminator(),
    })
    public readonly pieces: PieceType[];

    constructor(pieces: PieceType[]) {
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
            });
        }
        return interactions;
    }

    public readonly shape = [
        [ShapeSpace.Filled, ShapeSpace.Filled],
        [ShapeSpace.Filled, ShapeSpace.Filled],
    ]
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