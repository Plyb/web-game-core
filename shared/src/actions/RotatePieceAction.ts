import Piece from "../model/gameState/pieces/Piece";
import { BoardId } from "../model/gameState/Board";
import BoardGameState from "../model/gameState/BoardGameState";
import { PlayerId } from "../model/player";
import Action from "./Action";

export default class RotatePieceAction extends Action {
    public readonly name = "RotatePieceAction";
    
    constructor(
        public readonly gameState: BoardGameState,
        public readonly pieceId: string,
        public readonly locationId: PlayerId | BoardId, // The id of the player who owns the piece or 'hub'
        public readonly rotation: number,
        public readonly onBoard: boolean = false,
    ) {
        super(gameState);
    }

    private getLocation(): Piece[] | undefined {
        if (this.onBoard) {
            return this.gameState.getBoard(this.locationId)?.pieces
                .map((pieceLocation) => pieceLocation.piece);
        } else {
            return this.gameState.inventories.get(this.locationId);
        }
    }

    public execute(): void {
        const location = this.getLocation();
        if (!location) {
            throw new Error(`Could not find location ${this.locationId} for piece`);
        }
        const pieceIndex = location.findIndex((piece) => piece.id === this.pieceId);
        if (pieceIndex === -1) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        const piece = location[pieceIndex];
        piece.rotation += this.rotation;
    }

    public undo(): void {
        const location = this.getLocation();
        if (!location) {
            throw new Error(`Could not find location ${this.locationId} for piece`);
        }
        const pieceIndex = location.findIndex((piece) => piece.id === this.pieceId);
        if (pieceIndex === -1) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        const piece = location[pieceIndex];
        piece.rotation -= this.rotation;
    }
}