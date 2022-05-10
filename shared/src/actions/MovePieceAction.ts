import { BoardId } from "../model/gameState/Board";
import { PlayerId } from "../model/player";
import BoardGameState from "../model/gameState/BoardGameState";
import Piece, { PieceId } from "../model/gameState/pieces/Piece";
import Action from "./Action";
import DrawPile from "../model/gameState/pieces/DrawPile";

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
    public readonly name = "MovePieceAction";
    private intersectedPiece: PieceId | undefined;
    private piece?: Piece;

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

    private addPiece(location: MoveLocation, piece: Piece, placeOnDrawPile = false) {
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
                const intersectedPieces = board.getIntersectionsAtIndex(piece, location.index);
                if (intersectedPieces.length > 0 && placeOnDrawPile) {
                    for (const intersectedPiece of intersectedPieces) {
                        if (!intersectedPiece.piece.onPlacedOnAction(piece, this.to, this.from, this.gameState)) {
                            this.intersectedPiece = intersectedPiece.piece.id;
                            return;
                        }
                    }
                }
                if (!this.intersectedPiece || !placeOnDrawPile) {
                    board.placePieceCellIndex(piece, location.index);
                }
                break;
            }
    }

    private removeFromDrawPile(): Piece {
        const board = this.gameState.getBoard(this.to.containerId);
        if (!board) {
            throw new Error(`Could not find board ${this.to.containerId} while moving piece ${this.pieceId}`);
        }
        const intersectedPiece = board.pieces.find((pieceLocation) => pieceLocation.piece.id === this.intersectedPiece);
        if (!intersectedPiece) {
            throw new Error(`Could not find piece ${this.intersectedPiece} on board ${this.to.containerId}`);
        }
        if (!this.piece) {
            throw new Error(`Could not find piece ${this.pieceId} on board ${this.to.containerId}`);
        }
        intersectedPiece.piece.onUndoPlacedOnAction(this.piece, this.from, this.to, this.gameState);
        return this.piece
    }

    public execute(): void {
        this.piece = this.removePiece(this.from);
        this.addPiece(this.to, this.piece, true);
    }

    public undo(): void {
        const piece = this.intersectedPiece
            ? this.removeFromDrawPile()
            : this.removePiece(this.to);
        this.addPiece(this.from, piece);
    }
}