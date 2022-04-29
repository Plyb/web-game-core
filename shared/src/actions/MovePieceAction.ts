import { BoardId } from "../model/gameState/Board";
import { PlayerId } from "../model/player";
import BoardGameState from "../model/gameState/BoardGameState";
import Piece, { PieceId } from "../model/gameState/Piece";
import Action from "./Action";

export enum ContainerType {
    Inventory,
    Board,
}
export type MoveLocation = {
    containerId: PlayerId | BoardId,
    index: number,
    containerType: ContainerType,
};
export default class MovePieceAction extends Action {
    constructor(
        public readonly gameState: BoardGameState,
        public readonly pieceId: PieceId,
        public readonly from: MoveLocation,
        public readonly to: MoveLocation
    ) {
        super(gameState);
    }

    private removePiece(location: MoveLocation) {
        switch (location.containerType) {
            case ContainerType.Inventory:
                const inventory = this.gameState.inventories.get(location.containerId);
                if (!inventory) {
                    throw new Error(`Could not find inventory for player ${location.containerId} while moving piece ${this.pieceId}`);
                }
                return inventory.splice(location.index, 1)[0];
            case ContainerType.Board:
                const board = this.gameState.getBoard(location.containerId);
                if (!board) {
                    throw new Error(`Could not find board ${location.containerId} while moving piece ${this.pieceId}`);
                }
                const pieceIndex = board.pieces.findIndex((pieceLocation) => pieceLocation.piece.id === this.pieceId);
                if (pieceIndex === -1) {
                    throw new Error(`Could not find piece ${this.pieceId} on board ${location.containerId}`);
                }
                return board.pieces.splice(pieceIndex, 1)[0].piece;
            }
    }

    private addPiece(location: MoveLocation, piece: Piece) {
        switch (location.containerType) {
            case ContainerType.Inventory:
                const inventory = this.gameState.inventories.get(location.containerId);
                if (!inventory) {
                    throw new Error(`Could not find inventory for player ${location.containerId} while moving piece ${this.pieceId}`);
                }
                inventory.splice(location.index, 0, piece);
                break;
            case ContainerType.Board:
                const board = this.gameState.getBoard(location.containerId);
                if (!board) {
                    throw new Error(`Could not find board ${location.containerId} while moving piece ${this.pieceId}`);
                }
                board.placePieceCellIndex(piece, location.index);
                break;
            }
    }

    public execute(): void {
        const piece = this.removePiece(this.from);
        this.addPiece(this.to, piece);
    }

    public undo(): void {
        const piece = this.removePiece(this.to);
        this.addPiece(this.from, piece);
    }
}