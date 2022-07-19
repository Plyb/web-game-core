import { BoardGameState, Piece } from "@plyb/web-game-core-shared";
import CollectIntoDrawPileAction from "@plyb/web-game-core-shared/src/actions/CollectIntoDrawPileAction";
import DrawPieceAction from "@plyb/web-game-core-shared/src/actions/DrawPieceAction";
import FlipDrawPileAction, { FlipLocation } from "@plyb/web-game-core-shared/src/actions/FlipPieceAction";
import MovePiecesAction, { ContainerType, MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import RotatePieceAction from "@plyb/web-game-core-shared/src/actions/RotatePieceAction";
import ShuffleAction from "@plyb/web-game-core-shared/src/actions/ShuffleAction";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import DrawPile from "@plyb/web-game-core-shared/src/model/gameState/pieces/DrawPile";
import FlippablePiece from "@plyb/web-game-core-shared/src/model/gameState/pieces/FlippablePiece";
import { DragPiece } from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import PlayingCardPiece from "@plyb/web-game-core-shared/src/model/gameState/pieces/PlayingCardPiece";
import { PlayerId } from "@plyb/web-game-core-shared/src/model/player";
import BoardGameStateProxy from "./BoardGameStateProxy";

export type Interaction = {
    label: string,
    action: (gameState: BoardGameStateProxy) => string
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

function getFlipAction(location: FlipLocation, piece: Piece) {
    return {
        label: 'Flip',
        action: (gameState: BoardGameStateProxy) => {
            gameState.executeAndSendAction(FlipDrawPileAction, location, piece.id);
            return Interactions.Flip;
        }
    }
}

function getDrawPileBoardInteractions(piece: DrawPile<Piece>, boardId: BoardId, interactingPlayer: PlayerId, selectedPieces: DragPiece[]): Interaction[] {
    const interactions: Interaction[] = [];
    if (piece.pieces.length > 0) {
        interactions.push({
            label: 'Draw',
            action: (gameState) => {
                gameState.executeAndSendAction(DrawPieceAction, boardId, piece.id, interactingPlayer);
                return Interactions.Draw;
            }
            }, {
                label: 'Shuffle',
                action: (gameState) => {
                    gameState.executeAndSendAction(ShuffleAction, boardId, piece.id, Date.now());
                    return Interactions.Shuffle;
                }
            },
        );
    }
    return interactions;
}

export function getBoardInteractions(piece: Piece, boardId: BoardId, interactingPlayer: PlayerId, selectedPieces: DragPiece[]): Interaction[] {
    // TODO: implement a way for consumers to add interactions
    const interactions: Interaction[] = [
        inspectInteraction,
        { label: 'Rotate left', action: (gameState) => {
            gameState.executeAndSendAction(RotatePieceAction, piece.id, boardId, 90, true);
            return Interactions.RotateLeft;
        }},
        { label: 'Rotate right', action: (gameState) => {
            gameState.executeAndSendAction(RotatePieceAction, piece.id, boardId, -90, true);
            return Interactions.RotateRight;
        }},
        { label: 'Collect', action: (gameState) => {
            gameState.executeAndSendAction(CollectIntoDrawPileAction, piece.id, boardId);
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
                gameState.executeAndSendAction(MovePiecesAction, to, selectedPieces.map(p => ({
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

    if (piece instanceof FlippablePiece) {
        interactions.push(getFlipAction({containerType: ContainerType.Board, containerId: boardId}, piece));
    }

    return interactions;
}

export function getInventoryInteractions(piece: Piece, inventoryId: PlayerId): Interaction[] {
    const interactions: Interaction[] = [
        inspectInteraction,
        { label: 'Rotate left', action: (gameState) => {
            gameState.executeAndSendAction(RotatePieceAction, piece.id, inventoryId, 90);
            return Interactions.RotateLeft;
        }},
        { label: 'Rotate right', action: (gameState) => {
            gameState.executeAndSendAction(RotatePieceAction, piece.id, inventoryId, -90);
            return Interactions.RotateRight;
        }},
    ];

    if (piece instanceof FlippablePiece) {
        interactions.push(getFlipAction({containerType: ContainerType.Inventory, containerId: inventoryId}, piece));
    }

    return interactions;
}