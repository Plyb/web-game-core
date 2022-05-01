<template>
<div class="board">
    <!--BG grid-->
    <div class="bg-grid" :style="gridStyle">
        <div v-for="(_, i) in numGridCells" :key="_"
            class="bg-grid-cell"
            @mouseup="onCellMouseUp(i)"
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
</div>
</template>

<script lang="ts">
import { Board } from "../index";
import StateStore from "../StateStore";
import MovePieceAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePieceAction";
import { Options, prop, Vue } from "vue-class-component";
import PlacedPiece from "./PlacedPiece.vue";

class Props {
    model: Board = prop({
        required: true
    })
}

@Options({
    components: {
        PlacedPiece
    }
})
export default class BoardComponent extends Vue.with(Props) {

    get gridStyle() {
        return `grid-template-columns: repeat(${this.model.size.x}, 1fr);` +
            `grid-template-rows: repeat(${this.model.size.y}, 1fr);`
    }

    get numGridCells() {
        return this.model.size.x * this.model.size.y;
    }

    async onCellMouseUp(index: number) {
        if (StateStore.state.draggingPiece) {
            await StateStore.state.executeAction(
                MovePieceAction,
                StateStore.state.draggingPiece.piece.id,
                StateStore.state.draggingPiece.from,
                {
                    containerId: this.model.id,
                    containerType: ContainerType.Board,
                    index,
                }
            );
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
</style>