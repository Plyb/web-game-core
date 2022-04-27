import BoardGameState from "../model/gameState/BoardGameState";
import { PlayerId } from "../model/player";
import Action from "./Action";

export default class RotatePieceAction extends Action {
    constructor(
        public readonly gameState: BoardGameState,
        public readonly pieceId: string,
        public readonly playerId: PlayerId, // The id of the player who owns the piece
        public readonly rotation: number,
    ) {
        super(gameState);
    }

    public execute(): void {
        const inventory = this.gameState.inventories.get(this.playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${this.playerId}`);
        }
        const pieceIndex = inventory.findIndex((piece) => piece.id === this.pieceId);
        if (pieceIndex === -1) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        const piece = inventory[pieceIndex];
        piece.rotation += this.rotation;
    }

    public undo(): void {
        const inventory = this.gameState.inventories.get(this.playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${this.playerId}`);
        }
        const pieceIndex = inventory.findIndex((piece) => piece.id === this.pieceId);
        if (pieceIndex === -1) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        const piece = inventory[pieceIndex];
        piece.rotation -= this.rotation;
    }
}