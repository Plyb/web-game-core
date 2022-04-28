import RotatePieceAction from "../../actions/RotatePieceAction";
import { PlayerId } from "../player";
import { newUUID } from "../utils";
import { BoardId } from "./Board";
import BoardGameState from "./BoardGameState";
import { Vec2 } from "./types";

export enum ShapeSpace {
    None,
    Filled,
}

export type PieceId = string;
export type Interaction = {
    label: string,
    action: (gameState: BoardGameState) => void
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];
    public readonly __type: string = this.constructor.name;

    public abstract readonly pivot: Vec2;

    public rotation: number = 0;

    constructor(public readonly id: PieceId = newUUID(Piece.name, 16)) {}

    public getInventoryInteractions(inventoryId: PlayerId): Interaction[] {
        return [
            { label: 'Rotate left', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, inventoryId, 90);
            }},
            { label: 'Rotate right', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, inventoryId, -90);
            }},
        ];
    }

    public getBoardInteractions(boardId: BoardId): Interaction[] {
        return [
            { label: 'Rotate left', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, boardId, 90, true);
            }},
            { label: 'Rotate right', action: (gameState) => {
                gameState.executeAction(RotatePieceAction, this.id, boardId, -90, true);
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
}