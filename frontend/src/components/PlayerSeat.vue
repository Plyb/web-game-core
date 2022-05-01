<template>
<div>
    <Board
        :model="mat"
        @cell-mouse-up="onCellMouseUp($event)"
    />
    <p><strong>{{player.username}}</strong>: {{inventory.length}} item(s)</p>
</div>
</template>

<script lang="ts">
import { Board, Piece, Player, Vec2 } from "../index";
import { Options, prop, Vue } from "vue-class-component";
import BoardComponent from "./Board.vue";

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
}

</script>