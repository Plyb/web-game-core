<template>
<div class="overlay" :style="colStyle">
    <template v-for="(row, r) in piece.shape" :key="r">
        <template v-for="(cell, c) in row" :key="c">
            <div class="cell">
                <i class="fas fa-question"></i>
            </div>
        </template>
    </template>
</div>
</template>

<script lang="ts">
import PieceMixin from "../../mixins/PieceMixin";
import Piece from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import { mixins } from "vue-class-component";
import PieceOverlay from "./PieceOverlay.mixin";

export default class UnknownPieceOverlay extends mixins(PieceOverlay<Piece>(), PieceMixin) {

    get colStyle() {
        return `grid-template-columns: repeat(${this.pieceSize.width}, 1fr);`
    }

}
</script>

<style scoped>
.overlay {
    display: grid;
    background-color: white;
}

.cell {
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>