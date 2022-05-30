<template>
<div v-click-outside="() => close()"
    :class="['container', {'container-open': open}]"
>
    <div :class="['trigger', open ? 'trigger-open' : 'trigger-closed']"
        @click="open = !open"
    >
        <i :class="['fas', open ? 'fa-caret-down' : 'fa-caret-up']"></i>
    </div>
    <div v-show="open" class="inventory">
        <template  v-for="(piece, i) in pieces" :key="i">
            <BubbleMenu
                :options="piece.getInventoryInteractions(playerId)"
                @option-selected="onInteractionSelected($event, piece)"
            >
                <Piece
                    :piece="piece"
                    :location="{
                        containerType: ContainerType.Inventory,
                        containerId: playerId,
                        index: i,
                    }"
                    @select="onPieceSelect(i)"
                />
            </BubbleMenu>
        </template>
    </div>

    <InspectPieceModal v-if="inspectingPiece"
        class="inspect-piece-modal"
        :piece="inspectingPiece"
        @close="inspectingPiece = null"
    />
</div>
</template>

<script lang="ts">
import Core, { Piece } from "../index";
import { Options, prop, Vue } from "vue-class-component";
import PieceComponent from "./Piece.vue";
import BubbleMenu from "./BubbleMenu.vue";
import { Interactions } from "@plyb/web-game-core-shared/src/model/gameState/pieces/Piece";
import InspectPieceModal from "./InspectPieceModal.vue";
import StateStore from "../StateStore";
import MovePieceAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePieceAction";

class Props {
    pieces: Piece[] = prop({
        required: true
    })
}

@Options({
    components: {
        Piece: PieceComponent,
        BubbleMenu,
        InspectPieceModal,
    }
})
export default class Inventory extends Vue.with(Props) {
    public readonly ContainerType = ContainerType;

    public open = false;
    public selectedPieceIndex = -1;
    public inspectingPiece: Piece | null = null;
    public draggedOverPieceIndex = -1;

    onPieceSelect(pieceIndex: number) {
        this.selectedPieceIndex = pieceIndex;
    }

    get playerId() {
        return Core.getUserId() || "";
    }

    onInteractionSelected(interaction: string, piece: Piece) {
        if (interaction === Interactions.Inspect) {
            this.inspectingPiece = piece;
        }
    }

    close() {
        this.open = false;
        this.$emit('open-close', false);
    }
}
</script>

<style scoped>
.container {
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.container-open {
    height: 75vh;
}

.trigger {
    cursor: pointer;
    padding: 0.5rem 2rem 0.5rem 2rem;
    border-radius: 0.5rem 0.5rem 0 0;
}

.trigger-open {
    background-color: #444E;
    color: white;
}
.trigger-closed {
    background-color: #4444;
    bottom: 0;
}

.inventory {
    height: 100%;
    width: 100%;
    background-color: #444E;

    display: grid;
    grid-template-columns: repeat(auto-fit, 5rem);
    grid-gap: 2rem;
    padding: 2rem;
    box-sizing: border-box;

    overflow-y: auto;
}
</style>