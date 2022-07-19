<template>
<div>
    <Board
        :model="mat"
        @cell-mouse-up="onCellMouseUp($event)"
    />
    <p><strong>{{player.username}}</strong>: {{inventory.length}} item(s)</p>
    <div :class="['pass-to', { 'hidden': !placing }]" @click.stop="passTo">Pass To</div>
</div>
</template>

<script lang="ts">
import { Board, Piece, Player, Vec2 } from "@plyb/web-game-core-shared";
import { Options, prop, Vue } from "vue-class-component";
import BoardComponent from "./Board.vue";
import StateStore from "../StateStore";
import MovePiecesAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";

class Props {
    player: Player = prop({
        required: true
    })

    mat: Board = prop({
        required: true
    })

    inventory: Piece[] = prop({
        required: true
    })
}

@Options({
    components: {
        Board: BoardComponent
    }
})
export default class PlayerSeat extends Vue.with(Props) {
    onCellMouseUp(cell: Vec2) {
        this.$emit('cell-mouse-up', cell);
    }

    passTo() {
        if (!this.placing) {
            return;
        }

        const fromPieces = StateStore.state.selectedPieces.map((selectedPiece) =>({
            pieceId: selectedPiece.piece.id,
            from: selectedPiece.from
        }));
        StateStore.state.executeAndSendAction(
            MovePiecesAction,
            {
                containerId: this.player.id,
                index: 0,
                containerType: ContainerType.Inventory,
            },
            fromPieces
        );
        StateStore.state.selectedPieces.splice(0);
    }

    get placing() {
        return StateStore.state.selectedPieces.length > 0;
    }
}

</script>

<style scoped>
.pass-to {
    background-color: aqua;
    border-radius: 1em;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    line-height: 2em;
    margin-top: 0.5em;
    cursor: pointer;
}

.hidden {
    opacity: 0;
    cursor: auto;
}
</style>