import { BoardGameState, Piece } from "@plyb/web-game-core-shared";
import CollectIntoDrawPileAction from "@plyb/web-game-core-shared/src/actions/CollectIntoDrawPileAction";
import DrawPieceAction from "@plyb/web-game-core-shared/src/actions/DrawPieceAction";
import FlipDrawPileAction from "@plyb/web-game-core-shared/src/actions/FlipDrawPileAction";
import MovePiecesAction, { ContainerType, MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import RotatePieceAction from "@plyb/web-game-core-shared/src/actions/RotatePieceAction";
import ShuffleAction from "@plyb/web-game-core-shared/src/actions/ShuffleAction";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import DrawPile from "@plyb/web-game-core-shared/src/model/gameState/pieces/DrawPile";
import { DragPiece } from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import { PlayerId } from "@plyb/web-game-core-shared/src/model/player";

export type Interaction = {
    label: string,
    action: (gameState: BoardGameState) => string
}

export enum Interactions {
    RotateLeft = "RotateLeft",
    RotateRight = "RotateRight",
    Inspect = "Inspect",
    PlaceOn = "PlaceOn",
    Draw = "Draw",
    Shuffle = "Shuffle",
    Flip = "Flip",
}

const inspectInteraction = {
    label: "Inspect",
    action: (gameState: BoardGameState) => {
        return Interactions.Inspect;
    }
}

function getDrawPileBoardInteractions(piece: DrawPile<Piece>, boardId: BoardId, interactingPlayer: PlayerId, selectedPieces: DragPiece[]): Interaction[] {
    const interactions: Interaction[] = [];
    if (piece.pieces.length > 0) {
        interactions.push({
            label: 'Draw',
            action: (gameState) => {
                gameState.executeAction(DrawPieceAction, boardId, piece.id, interactingPlayer);
                return Interactions.Draw;
            }
        }, {
            label: 'Shuffle',
            action: (gameState) => {
                gameState.executeAction(ShuffleAction, boardId, piece.id, Date.now());
                return Interactions.Shuffle;
            }
        }, {
            label: 'Flip',
            action: (gameState) => {
                gameState.executeAction(FlipDrawPileAction, boardId, piece.id);
                return Interactions.Flip;
            }
        });
    }
    return interactions;
}

export function getBoardInteractions(piece: Piece, boardId: BoardId, interactingPlayer: PlayerId, selectedPieces: DragPiece[]): Interaction[] {
    // TODO: implement a way for consumers to add interactions
    const interactions: Interaction[] = [
        inspectInteraction,
        { label: 'Rotate left', action: (gameState) => {
            gameState.executeAction(RotatePieceAction, piece.id, boardId, 90, true);
            return Interactions.RotateLeft;
        }},
        { label: 'Rotate right', action: (gameState) => {
            gameState.executeAction(RotatePieceAction, piece.id, boardId, -90, true);
            return Interactions.RotateRight;
        }},
        { label: 'Collect', action: (gameState) => {
            gameState.executeAction(CollectIntoDrawPileAction, piece.id, boardId);
            return ''
        }}
    ];

    if (selectedPieces.length) {
        interactions.push({
            label: 'Place On', action: (gameState) => {
                const board = gameState.getBoard(boardId);
                if (!board) {
                    throw new Error(`Board ${boardId} not found`);
                }
                const pieceLocation = board.pieces.find(p => p.piece.id === piece.id);
                if (!pieceLocation) {
                    throw new Error(`Piece ${piece.id} not found on board ${boardId}`);
                }
                const to: MoveLocation = {
                    containerId: boardId,
                    containerType: ContainerType.Board,
                    index: pieceLocation.x + pieceLocation.y * board.size.x,
                };
                gameState.executeAction(MovePiecesAction, to, selectedPieces.map(p => ({
                    pieceId: p.piece.id,
                    from: p.from,
                })));
                return Interactions.PlaceOn;
            }
        });
    }

    if (piece instanceof DrawPile) {
        interactions.push(...getDrawPileBoardInteractions(piece, boardId, interactingPlayer, selectedPieces));
    }

    return interactions;
}

export function getInventoryInteractions(piece: Piece, inventoryId: PlayerId): Interaction[] {
    return [
        inspectInteraction,
        { label: 'Rotate left', action: (gameState) => {
            gameState.executeAction(RotatePieceAction, piece.id, inventoryId, 90);
            return Interactions.RotateLeft;
        }},
        { label: 'Rotate right', action: (gameState) => {
            gameState.executeAction(RotatePieceAction, piece.id, inventoryId, -90);
            return Interactions.RotateRight;
        }},
    ];
}