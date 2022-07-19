import BoardGameState from "../model/gameState/BoardGameState";
import { PieceId } from "../model/gameState/pieces/Piece";
import { PlayerId } from "../model/player";
import Action from "./Action";
import FlippablePiece from "../model/gameState/pieces/FlippablePiece";
import { PieceLocation } from "../model/gameState/Board";
import { ContainerType, MoveLocation } from "./MovePiecesAction";

export type FlipLocation = {
    containerType: ContainerType,
    containerId: string,
}

export default class FlipPieceAction extends Action {
    public readonly name = "FlipPieceAction";
    private piece: FlippablePiece;

    constructor(
        public readonly gameState: BoardGameState,
        public readonly pieceLocation: FlipLocation,
        public readonly pieceId: PieceId,
    ) {
        super(gameState);

        this.piece = this.findPiece();
    }

    private findPiece() {
        const container = this.pieceLocation.containerType === ContainerType.Board
            ? this.gameState.getBoard(this.pieceLocation.containerId)?.pieces.map((pieceLocation) => pieceLocation.piece)
            : this.gameState.inventories.get(this.pieceLocation.containerId);
        if (!container) {
            throw new Error(`Could not find container ${this.pieceLocation.containerId} of type ${this.pieceLocation.containerType} while flipping piece ${this.pieceId}`);
        }
        const piece = container.find(piece => piece.id === this.pieceId);
        if (!piece || !(piece instanceof FlippablePiece)) {
            throw new Error(`Could not find draw pile ${this.pieceId}`);
        }
        return piece;
    }

    public execute(): void {
        this.piece.flip();
    }

    public undo(): void {
        this.piece.flip();
    }
}