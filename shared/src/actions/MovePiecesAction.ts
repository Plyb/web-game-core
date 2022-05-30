import Board, { BoardId } from "../model/gameState/Board";
import { PlayerId } from "../model/player";
import BoardGameState from "../model/gameState/BoardGameState";
import Piece, { PieceId } from "../model/gameState/pieces/Piece";
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
type PieceIdFrom = {
    pieceId: PieceId,
    from: MoveLocation,
}
export default class MovePiecesAction extends Action {
    public readonly name = "MovePiecesAction";
    private pieceRefs: Piece[] = [];

    constructor(
        public readonly gameState: BoardGameState,
        public readonly to: MoveLocation,
        public readonly pieces: PieceIdFrom[],
    ) {
        super(gameState);
    }

    private getInventory(playerId: PlayerId): Piece[] {
        const inventory = this.gameState.inventories.get(playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${playerId} while moving pieces`);
        }
        return inventory;
    }

    private getBoard(boardId: BoardId): Board {
        const board = this.gameState.getBoard(boardId);
        if (!board) {
            throw new Error(`Could not find board ${boardId} while moving pieces`);
        }
        return board;
    }

    private getBoardToPieces(): {[boardId: string]: PieceIdFrom[]} {
        return this.pieces.reduce((boardToPieces, pieceFrom) => {
            if (pieceFrom.from.containerType === ContainerType.Board) {
                if (!boardToPieces[pieceFrom.from.containerId]) {
                    boardToPieces[pieceFrom.from.containerId] = [];
                }
                boardToPieces[pieceFrom.from.containerId].push(pieceFrom);
            }
            return boardToPieces;
        }, {} as {[boardId: string]: PieceIdFrom[]});
    }

    private getInventoryToPieces(): {[playerId: string]: PieceIdFrom[]} {
        return this.pieces.reduce((inventoryToPieces, pieceFrom) => {
            if (pieceFrom.from.containerType === ContainerType.Inventory) {
                if (!inventoryToPieces[pieceFrom.from.containerId]) {
                    inventoryToPieces[pieceFrom.from.containerId] = [];
                }
                inventoryToPieces[pieceFrom.from.containerId].push(pieceFrom);
            }
            return inventoryToPieces;
        }, {} as {[inventoryId: string]: PieceIdFrom[]});
    }

    private locatePiece(location: MoveLocation, pieceId: PieceId) : Piece {
        switch (location.containerType) {
            case ContainerType.Inventory:
                const inventory = this.getInventory(location.containerId);
                return inventory[location.index];
            case ContainerType.Board:
                const board = this.getBoard(location.containerId);
                const piece = board.pieces.find((pieceLocation) => pieceLocation.piece.id === pieceId)?.piece;
                if (!piece) {
                    throw new Error(`Could not find piece ${pieceId} on board ${location.containerId}`);
                }
                return piece;
        }
    }

    public execute(): void {
        const boardToPieces = this.getBoardToPieces();
        switch (this.to.containerType) {
            case ContainerType.Board:
                const board = this.getBoard(this.to.containerId);

                // remove and collect all relevant pieces
                const piecesToMove: Piece[] = [];
                const inventoryToPieces = this.getInventoryToPieces();

                for (const [inventoryId, pieceFroms] of Object.entries(inventoryToPieces)) {
                    const inventory = this.gameState.inventories.get(inventoryId);
                    if (!inventory) {
                        throw new Error(`Could not find inventory for player ${inventoryId} while moving pieces`);
                    }
                    piecesToMove.push(...inventory.filter((piece) => 
                        pieceFroms.some((pieceFrom) => pieceFrom.pieceId === piece.id)
                    ));
                    this.gameState.inventories.set(inventoryId, inventory.filter((piece) => 
                        !pieceFroms.some((pieceFrom) => pieceFrom.pieceId === piece.id)
                    ));
                }
                for (const [boardId, pieceFroms] of Object.entries(boardToPieces)) {
                    const board = this.getBoard(boardId);
                    piecesToMove.push(...board.pieces.filter((pieceLocation) => 
                        pieceFroms.some((pieceFrom) => pieceFrom.pieceId === pieceLocation.piece.id)
                    ).map((pieceLocation) => pieceLocation.piece));
                    board.pieces = board.pieces.filter((pieceLocation) => 
                        !pieceFroms.some((pieceFrom) => pieceFrom.pieceId === pieceLocation.piece.id)
                    );
                }

                // add removed pieces to new location
                for (const piece of piecesToMove) {
                    board.placePieceCellIndex(piece, this.to.index);
                }
                this.pieceRefs = piecesToMove;

                break;
            case ContainerType.Inventory:
                const inventory = this.getInventory(this.to.containerId);

                // Add to inventory
                const preSlice = inventory.slice(0, this.to.index).filter((piece) => 
                    !this.pieces.some((pieceFrom) => pieceFrom.pieceId === piece.id)
                );
                const postSlice = inventory.slice(this.to.index).filter((piece) => 
                    !this.pieces.some((pieceFrom) => pieceFrom.pieceId === piece.id)
                );
                const pieces = this.pieces.map((pieceFrom) => this.locatePiece(pieceFrom.from, pieceFrom.pieceId));
                this.gameState.inventories.set(this.to.containerId, [...preSlice, ...pieces, ...postSlice]);
                this.pieceRefs = pieces;

                // Remove from boards (if any)
                for (const [boardId, pieceFroms] of Object.entries(boardToPieces)) {
                    const board = this.getBoard(boardId);
                    board.pieces = board.pieces.filter((pieceLocation) => !pieceFroms.some((pieceFrom) => pieceFrom.pieceId === pieceLocation.piece.id));
                }
                break;
        }
    }

    public undo(): void {
        // Remove placed pieces
        switch (this.to.containerType) {
            case ContainerType.Board:
                const board = this.getBoard(this.to.containerId);
                board.pieces = board.pieces.filter((pieceLocation) => 
                    !this.pieces.some((pieceFrom) => pieceFrom.pieceId === pieceLocation.piece.id)
                );
                break;
            case ContainerType.Inventory:
                const inventory = this.getInventory(this.to.containerId);
                this.gameState.inventories.set(
                    this.to.containerId, 
                    inventory.filter((piece) => !this.pieces.some((pieceFrom) => 
                        pieceFrom.pieceId === piece.id
                    ))
                );
                break;
        }

        // Replace to boards
        const boardToPieces = this.getBoardToPieces();
        for (const [boardId, pieceFroms] of Object.entries(boardToPieces)) {
            const board = this.getBoard(boardId);
            pieceFroms.forEach((pieceFrom) => {
                const piece = this.pieceRefs.find((piece) => piece.id === pieceFrom.pieceId);
                if (!piece) {
                    throw new Error(`Could not find piece ${pieceFrom.pieceId} while undoing move`);
                }
                board.placePieceCellIndex(piece, pieceFrom.from.index);
            })
        }
            
        // Replace to inventories
        const inventoryToPieces = this.getInventoryToPieces();
        for (const [inventoryId, pieceFroms] of Object.entries(inventoryToPieces)) {
            const inventory = this.getInventory(inventoryId);
            pieceFroms.sort((a, b) => a.from.index - b.from.index);
            pieceFroms.forEach((pieceFrom) => {
                const piece = this.pieceRefs.find((piece) => piece.id === pieceFrom.pieceId);
                if (!piece) {
                    throw new Error(`Could not find piece ${pieceFrom.pieceId} while undoing move`);
                }
                inventory.splice(pieceFrom.from.index, 0, piece);
            });
        }
    }
}