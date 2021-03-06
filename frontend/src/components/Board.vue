<template>
<div class="board" v-click-outside="() => pieceConfirmation = null">
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

    <PlacedPiece v-if="showPlaceConfirmation" 
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
import StateStore from "../StateStore";
import MovePiecesAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import { Options, prop, Vue } from "vue-class-component";
import PlacedPiece from "./PlacedPiece.vue";
import { Piece, PieceLocation, Board } from "@plyb/web-game-core-shared";

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
    pieceConfirmation: number | null = null;

    get gridStyle() {
        return `grid-template-columns: repeat(${this.model.size.x}, 1fr);` +
            `grid-template-rows: repeat(${this.model.size.y}, 1fr);`
    }

    get numGridCells() {
        return this.model.size.x * this.model.size.y;
    }

    onCellSelect(index: number) {
        if (StateStore.state.selectedPieces.length > 0) {
            this.pieceConfirmation = index;
        }
    }

    confirmPlacement() {
        if (this.pieceConfirmation !== null) {
            const fromPieces = StateStore.state.selectedPieces.map((selectedPiece) =>({
                pieceId: selectedPiece.piece.id,
                from: selectedPiece.from
            }));
            StateStore.state.executeAndSendAction(
                MovePiecesAction,
                {
                    containerId: this.model.id,
                    index: this.pieceConfirmation,
                    containerType: ContainerType.Board,
                },
                fromPieces
            );
            StateStore.state.selectedPieces.splice(0);
            this.pieceConfirmation = null;
        }
    }

    get confirmationPieceLocation() {
        if (this.pieceConfirmation !== null) {
            return {
                piece: StateStore.state.selectedPieces[StateStore.state.selectedPieces.length - 1].piece,
                x: this.pieceConfirmation % this.model.size.x,
                y: Math.floor(this.pieceConfirmation / this.model.size.x),
            };
        }
    }

    get showPlaceConfirmation() {
        return this.pieceConfirmation !== null && StateStore.state.selectedPieces.length;
    }
}
</script>

<style scoped>
.board {
    position: relative;
}

.bg-grid {
    display: grid;
    border: 1px solid black;
}

.bg-grid-cell {
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid lightgrey;
    height: 0;
    padding-bottom: calc(100% - 2px); /* 100% - 2px for border */
}

.confirmation-piece {
    opacity: 0.5;
    cursor: pointer;
}
</style>