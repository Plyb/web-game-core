import RotatePieceAction from "../../../actions/RotatePieceAction";
import { PlayerId } from "../../player";
import { newUUID } from "../../utils";
import { BoardId } from "../Board";
import BoardGameState from "../BoardGameState";
import { Vec2 } from "../types";

export enum ShapeSpace {
    None,
    Filled,
}

export enum Interactions {
    RotateLeft = "RotateLeft",
    RotateRight = "RotateRight",
    Inspect = "Inspect",
}

export type PieceId = string;
export type Interaction = {
    label: string,
    action: (gameState: BoardGameState) => string
}

const inspectInteraction = {
    label: "Inspect",
    action: (gameState: BoardGameState) => {
        return Interactions.Inspect;
    }
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];
    public readonly __type: string = this.constructor.name;
    public abstract readonly pivot: Vec2;

    public rotation: number = 0;

    constructor(public readonly id: PieceId = newUUID(Piece.name, 16)) {}

    public abstract getName(): string;
    public abstract getDescription(): string;

    public getInventoryInteractions(inventoryId: PlayerId): Interaction[] {
        return [
            inspectInteraction,
            { label: 'Rotate left', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, inventoryId, 90);
                return Interactions.RotateLeft;
            }},
            { label: 'Rotate right', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, inventoryId, -90);
                return Interactions.RotateRight;
            }},
        ];
    }

    public getBoardInteractions(boardId: BoardId, interactingPlayer: PlayerId): Interaction[] {
        return [
            inspectInteraction,
            { label: 'Rotate left', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, boardId, 90, true);
                return Interactions.RotateLeft;
            }},
            { label: 'Rotate right', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, boardId, -90, true);
                return Interactions.RotateRight;
            }},
        ]
    }

    public getPivotPercents(): Vec2 {
        const { x, y } = this.pivot;
        const width = this.shape[0].length;
        const height = this.shape.length;
        return {
            x: (x + 0.5) / width,
            y: (y + 0.5) / height,
        };
    }

    public onOtherPlacedOn(otherPiece: Piece) {
        // Can be overriden by subclasses
    }

    public onPlacedOnOther(otherPiece: Piece) {
        // Can be overriden by subclasses
    }
}