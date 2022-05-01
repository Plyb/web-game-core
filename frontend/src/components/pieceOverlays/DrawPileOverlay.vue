<template>
<div v-if="piece.shouldShowTopPiece()">
    <component :is="overlay" class="overlay"
        :piece="piece.pieces[piece.pieces.length - 1]"
    />
</div>
<div v-else>
    <h2>{{piece.pieces.length}} items(s) remaining</h2>
</div>
</template>

<script lang="ts">
import PieceOverlayMixin from "./PieceOverlay.mixin";
import DrawPile from "@plyb/web-game-core-shared/src/model/gameState/pieces/DrawPile";
import { Piece } from "@plyb/web-game-core-shared";
import PieceComponent from "../Piece.vue";
import { Options } from "vue-class-component";
import PieceOverlays from "./PieceOverlays";
import UnknownPieceOverlay from "./UnknownPieceOverlay.vue";

@Options({
    components: {
        Piece: PieceComponent,
    }
})
export default class DrawPileOverlay extends PieceOverlayMixin<DrawPile<Piece>>() {
    get overlay() {
        if (this.piece.shouldShowTopPiece()) {
            return PieceOverlays.getOverlay(this.piece.pieces[this.piece.pieces.length - 1]);
        }
        return UnknownPieceOverlay;
    }
}
</script>

<style scoped>
div {
    background-color: white;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

h2 {
    text-align: center;
    font-size: 1.6vw;
}
</style>