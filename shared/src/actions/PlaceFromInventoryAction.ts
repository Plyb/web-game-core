import BoardGameState from "../model/gameState/BoardGameState";
import { BoardId } from "../model/gameState/Board";
import Action from "./Action";
import { PlayerId } from "../model/player";
import { Vec2 } from "../model/gameState/types";

export default class PlaceFromInventoryAction extends Action {
    public readonly name = "PlaceFromInventoryAction";
    public readonly pieceIndex: number;

    constructor(
        public readonly gameState: BoardGameState,
        public readonly playerId: PlayerId,
        public readonly pieceId: string,
        public readonly boardId: BoardId,
        public readonly location: Vec2
    ) {
        super(gameState);
        const pieceIndex = this.gameState.inventories.get(playerId)
            ?.findIndex((piece) => piece.id === pieceId) ?? -1;
        if (pieceIndex === -1) {
            throw new Error(`Could not find piece ${pieceId}`);
        }
        this.pieceIndex = pieceIndex;
    }

    public execute(): void {
        const inventory = this.gameState.inventories.get(this.playerId)!;
        const piece = inventory[this.pieceIndex];
        if (!piece) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        const board = this.gameState.getBoard(this.boardId);
        if (!board) {
            throw new Error(`Could not find board ${this.boardId}`);
        }
        board.placePiece(piece, this.location.x, this.location.y);
        inventory.splice(this.pieceIndex, 1);
    }

    public undo(): void {
        const inventory = this.gameState.inventories.get(this.playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${this.playerId}`);
        }
        const board = this.gameState.getBoard(this.boardId);
        if (!board) {
            throw new Error(`Could not find board ${this.boardId}`);
        }
        const piece = board.pieces.find((pieceLocation) => pieceLocation.piece.id === this.pieceId);
        if (!piece) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        inventory.splice(this.pieceIndex, 0, piece.piece);
        board.pieces.splice(board.pieces.indexOf(piece), 1);
    }
}