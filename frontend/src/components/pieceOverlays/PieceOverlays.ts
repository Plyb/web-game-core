import Piece from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import { Component } from "vue";
import UnknownPieceOverlay from "./UnknownPieceOverlay.vue";
import PlayingCardOverlay from "./PlayingCardOverlay.vue";
import DrawPileOverlay from "./DrawPileOverlay.vue";
import { Props } from "./PieceOverlay.mixin";
import PlayingCard from "@plyb/web-game-core-shared/src/model/gameState/pieces/PlayingCardPiece";
import DrawPile from "@plyb/web-game-core-shared/src/model/gameState/pieces/DrawPile";

export default class PieceOverlays {
    private static typeMap: Map<typeof Piece, Component> = new Map();

    static getOverlay<T extends Piece>(piece: T): Component<Props<T>> {
        const pieceType = piece.constructor as typeof Piece;
        return PieceOverlays.typeMap.get(pieceType) || (UnknownPieceOverlay as unknown as Component<Props<T>>);
    }

    static addOverlay(PieceType: new (...args: any) => Piece, overlay: Component<Props<Piece>>) {
        PieceOverlays.typeMap.set(PieceType, overlay);
    }
}


PieceOverlays.addOverlay(PlayingCard, PlayingCardOverlay);
PieceOverlays.addOverlay(DrawPile, DrawPileOverlay);