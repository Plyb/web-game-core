<template>
<div class="holder" :style="[sizeStyle, positionStyle]">

    <BubbleMenu v-if="interactable" class="trigger"
        :options="interactions"
        @click.stop
        @option-selected="onInteractionSelected"
        rightClick="true"
    >
        <Piece
            :piece="model.piece"
            :location="moveLocation"
        />
    </BubbleMenu>
    <Piece v-else
        class="uninteractable"
        :piece="model.piece"
        :location="moveLocation"
    />

    <InspectPieceModal v-if="interactionModalOpen"
        :piece="model.piece"
        class="inspect-piece-modal"
        @close="interactionModalOpen = false"
    />
</div>
</template>

<script lang="ts">
import PieceMixin from "../mixins/PieceMixin";
import Core, { PieceLocation } from "../index";
import { BoardId } from "@plyb/web-game-core-shared/src/model/gameState/Board";
import { mixins, Options, prop, Vue, WithDefault } from "vue-class-component";
import BubbleMenu from "./BubbleMenu.vue";
import PieceComponent from "./Piece.vue";
import InspectPieceModal from "./InspectPieceModal.vue";
import { ContainerType, MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePiecesAction";
import StateStore from "../StateStore";
import { getBoardInteractions, Interactions } from "../pieceInteractions";

class Props {
    model: PieceLocation = prop({
        required: true
    })

    numSpaces: {x: number, y: number} = prop({
        required: true
    })

    boardId: BoardId = prop({
        required: true
    })

    interactable: WithDefault<boolean> = prop({
        default: true
    });
}

@Options({
    components: {
        Piece: PieceComponent,
        BubbleMenu,
        InspectPieceModal,
    },
})
export default class PlacedPiece extends mixins(PieceMixin, Vue.with(Props)) {
    interactionModalOpen = false;

    get piece() {
        return this.model.piece;
    }

    get sizeStyle() {
        return `width: ${this.pieceSize.width * 100 / this.numSpaces.x}%;` +
            `height: ${this.pieceSize.height * 100 / this.numSpaces.y}%;`;
    }

    get positionStyle() {
        return `left: ${(this.model.x - this.model.piece.pivot.x) * 100 / this.numSpaces.x}%;` +
            `top: ${(this.model.y - this.model.piece.pivot.y) * 100 / this.numSpaces.y}%;`;
    }

    onInteractionSelected(interaction: string) {
        if (interaction === Interactions.Inspect) {
            this.interactionModalOpen = true;
        }
    }

    get interactions() {
        return getBoardInteractions(this.piece, this.boardId, this.playerId, this.selectedPieces);
    }

    get moveLocation(): MoveLocation {
        return {
            containerId: this.boardId,
            index: this.numSpaces.y * this.model.y + this.model.x,
            containerType: ContainerType.Board,
        };
    }

    get playerId() {
        return Core.getUserId() || "";
    }

    get selectedPieces() {
        return StateStore.state.selectedPieces;
    }
}
</script>

<style scoped>
.holder {
    position: absolute;
}

.trigger {
    width: 100%;
}

.cell {
    position: absolute;
}

.inspect-piece-modal {
    pointer-events: all;
}

.uninteractable {
    pointer-events: none;
}
</style>