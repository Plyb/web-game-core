import Interaction from "../model/gameState/Piece";
import Board, { PieceLocation } from "../model/gameState/Board";
import BoardGameState from "../model/gameState/BoardGameState";
import { PlayerId } from "../model/player";
import Action from "./Action";

export default class PickUpItemAction extends Action {
    public readonly board: Board;
    public readonly pieceIndex: number;
    public readonly pieceLocation: PieceLocation;
    public readonly inventory: Interaction[];

    constructor(
        public readonly gameState: BoardGameState,
        public readonly playerId: PlayerId,
        public readonly pieceId: string
    ) {
        super(gameState);

        const allBoards = [
            this.gameState.hub,
            ...this.gameState.mats.values(),
        ];
        const board = allBoards.find((board) => board.pieces.find(
            (pieceLocation) => pieceLocation.piece.id === this.pieceId
        ));

        if (!board) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        this.board = board;

        this.pieceIndex = this.board.pieces.findIndex(
            (pieceLocation) => pieceLocation.piece.id === this.pieceId
        );

        const inventory = this.gameState.inventories.get(this.playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${this.playerId}`);
        }
        this.inventory = inventory;

        this.pieceLocation = this.board.pieces[this.pieceIndex];
    }

    public execute(): void {
        this.inventory.push(this.pieceLocation.piece);
        this.board.pieces.splice(this.pieceIndex, 1);
    }

    public undo(): void {
        const piece = this.inventory.pop();
        if (!piece) {
            throw new Error(`Could not find piece ${this.pieceId}`);
        }
        this.board.pieces.splice(this.pieceIndex, 0, this.pieceLocation);
    }    
}