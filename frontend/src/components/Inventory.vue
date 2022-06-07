<template>
<div v-click-outside="() => close()"
    :class="['container', {'container-open': open}]"
>
    <div :class="['trigger', open ? 'trigger-open' : 'trigger-closed']"
        @click="open = !open"
    >
        <i :class="['fas', open ? 'fa-caret-down' : 'fa-caret-up']"></i>
    </div>
    <div v-show="open" :class="['inventory', {placing}]">
        <div v-if="placing" class="place-between" @click="placeAt(0)">+</div>
        <template v-for="(piece, i) in pieces" :key="i">
            <BubbleMenu
                :options="getInventoryInteractions(piece)"
                @option-selected="onInteractionSelected($event, piece)"
                rightClick="true"
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
            <div v-if="placing" class="place-between" @click="placeAt(i + 1)">+</div>
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
import InspectPieceModal from "./InspectPieceModal.vue";
import StateStore from "../StateStore";
import MovePiecesAction, { ContainerType } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import { getInventoryInteractions, Interactions } from "../pieceInteractions";

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

    get placing() {
        return StateStore.state.selectedPieces.length > 0;
    }

    placeAt(pieceIndex: number) {
        const fromPieces = StateStore.state.selectedPieces.map((selectedPiece) =>({
            pieceId: selectedPiece.piece.id,
            from: selectedPiece.from
        }));
        StateStore.state.executeAndSendAction(
            MovePiecesAction,
            {
                containerId: this.playerId,
                index: pieceIndex,
                containerType: ContainerType.Inventory,
            },
            fromPieces,
        );
        StateStore.state.selectedPieces.splice(0);
    }

    getInventoryInteractions(piece: Piece) {
        return getInventoryInteractions(piece, this.playerId);
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
    pointer-events: none;
}

.container-open {
    height: 75vh;
    pointer-events: all;
}

.trigger {
    cursor: pointer;
    padding: 0.5rem 2rem 0.5rem 2rem;
    border-radius: 0.5rem 0.5rem 0 0;
    pointer-events: all;
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

.placing {
    grid-gap: 0;
    grid-template-columns: repeat(auto-fit, 2rem 5rem);
}

.place-between {
    background-color: aqua;
    border-radius: 1em;
    height: 2em;
    width: 2em;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    line-height: 2em;
}
</style>