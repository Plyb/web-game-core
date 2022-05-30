<template>
<div class="board">
    <!--BG grid-->
    <div class="bg-grid" :style="gridStyle">
        <div v-for="(_, i) in numGridCells" :key="_"
            class="bg-grid-cell"
            @click="onCellSelect(i)"
        ></div>
    </div>

    <PlacedPiece v-for="(piece, i) in model.pieces" :key="i"
        :model="piece"
        :numSpaces="{
            x: model.size.x,
            y: model.size.y
        }"
        :boardId="model.id"
    />

    <PlacedPiece v-if="pieceConfirmation" 
        @click.stop="confirmPlacement"
        class="confirmation-piece"
        :model="confirmationPieceLocation"
        :numSpaces="{
            x: model.size.x,
            y: model.size.y
        }"
        :boardId="model.id"
        :interactable="false"
    />
</div>
</template>

<script lang="ts">
import { Board } from "../index";
import StateStore from "../StateStore";
import MovePieceAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePieceAction";
import { Options, prop, Vue } from "vue-class-component";
import PlacedPiece from "./PlacedPiece.vue";
import { Piece, PieceLocation } from "@plyb/web-game-core-shared";

class Props {
    model: Board = prop({
        required: true
    })
}

type PieceIndex = {
    piece: Piece,
    index: number
}

@Options({
    components: {
        PlacedPiece
    }
})
export default class BoardComponent extends Vue.with(Props) {
    pieceConfirmation: PieceIndex | null = null;

    get gridStyle() {
        return `grid-template-columns: repeat(${this.model.size.x}, 1fr);` +
            `grid-template-rows: repeat(${this.model.size.y}, 1fr);`
    }

    get numGridCells() {
        return this.model.size.x * this.model.size.y;
    }

    onCellSelect(index: number) {
        if (StateStore.state.selectedPieces.length > 0) {
            this.pieceConfirmation = {
                piece: StateStore.state.selectedPieces[0].piece,
                index
            };
        }
    }

    confirmPlacement() {
        if (this.pieceConfirmation) {
            const pieceConfirmation = this.pieceConfirmation;
            StateStore.state.selectedPieces.forEach((selectedPiece) => {
                StateStore.state.executeAction(
                    MovePieceAction,
                    selectedPiece.piece.id,
                    selectedPiece.from,
                    {
                        containerId: this.model.id,
                        index: pieceConfirmation.index,
                        containerType: ContainerType.Board,
                    },
                );
            })
            StateStore.state.selectedPieces.splice(0);
            this.pieceConfirmation = null;
        }
    }

    get confirmationPieceLocation() {
        if (this.pieceConfirmation) {
            return {
                piece: this.pieceConfirmation.piece,
                x: this.pieceConfirmation.index % this.model.size.x,
                y: Math.floor(this.pieceConfirmation.index / this.model.size.x),
            };
        }
    }
}
</script>

<style scoped>
.board {
    position: relative;
}

.bg-grid {
    display: grid;
    grid-gap: 1px;
    border: 1px solid black;
}

.bg-grid-cell {
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid black;
    height: 0;
    padding-bottom: calc(100% - 2px); /* 100% - 2px for border */
}

.confirmation-piece {
    opacity: 0.5;
    cursor: pointer;
}
</style>