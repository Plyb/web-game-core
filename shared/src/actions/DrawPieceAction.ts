import { PlayerId } from "../model/player";
import BoardGameState from "../model/gameState/BoardGameState";
import { PieceId } from "../model/gameState/pieces/Piece";
import Action from "./Action";
import DrawPile from "../model/gameState/pieces/DrawPile";

export default class DrawPieceAction extends Action {
    constructor(
        public readonly gameState: BoardGameState,
        public readonly boardId: PlayerId,
        public readonly drawPileId: PieceId,
        public readonly playerId: PlayerId,
    ) {
        super(gameState);
    }

    private findItems() {
        const board = this.gameState.getBoard(this.boardId);
        if (!board) {
            throw new Error(`Could not find board ${this.boardId} while drawing piece ${this.drawPileId}`);
        }
        const drawPile = board.pieces.find(drawPile => drawPile.piece.id === this.drawPileId)?.piece;
        if (!drawPile || !(drawPile instanceof DrawPile)) {
            throw new Error(`Could not find draw pile ${this.drawPileId}`);
        }
        const inventory = this.gameState.inventories.get(this.playerId);
        if (!inventory) {
            throw new Error(`Could not find inventory for player ${this.playerId}`);
        }
        return {
            drawPile,
            inventory,
        }
    }

    public execute() {
        const { drawPile, inventory } = this.findItems();
        const piece = drawPile.pieces.pop();
        if (!piece) {
            throw new Error(`There are no pieces in draw pile ${this.drawPileId} to draw`);
        }
        inventory.push(piece);
    }

    public undo() {
        const { drawPile, inventory } = this.findItems();
        const piece = inventory.pop();
        if (!piece) {
            throw new Error(`There are no pieces in inventory ${this.playerId} to return`);
        }
        drawPile.pieces.push(piece);
    }
}