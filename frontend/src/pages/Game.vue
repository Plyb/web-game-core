<template>
<div @mousemove="moveDragPiece" class="game">
    <div class="view-menu-holder floating-menu">
        <BubbleMenu
            :options="viewOptions"
        >
            <i class="view-menu-trigger fas fa-bars"></i>
        </BubbleMenu>
    </div>
    <IconBar class="floating-menu icon-bar"
    />
    <Inventory class="floating-menu"
        :pieces="pieces"
        @open-close="inventoryOpen = $event"
    />
    <PlayTable v-if="view.type === ViewType.overall"
        @focus-on="view = $event"
    />
    <PlayerSeat v-else-if="view.type === ViewType.player"
        :player="view.player"
        :mat="gameState.mats.get(view.player.id)"
        :inventory="gameState.inventories.get(view.player.id)"
    />
    <BoardComponent v-else-if="view.type === ViewType.hub"
        :model="gameState.hub"
    />
    <div v-if="StateStore.state.draggingPiece"
        :style="dragPiecePositionStyle"
        :class="['drag-piece-container', {'drag-piece-over-inventory': inventoryOpen}]"
    >
        <Piece
            :piece="StateStore.state.draggingPiece.piece"
            dragPiece="true"
        />
    </div>
</div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BoardComponent from '../components/Board.vue'
import PlayerSeat from '../components/PlayerSeat.vue'
import PieceComponent from '../components/Piece.vue'
import BubbleMenu, { MenuOption } from "../components/BubbleMenu.vue";
import PlayTable, { SelectMode } from "../components/PlayTable.vue";
import { View, ViewType } from "../components/view";
import Inventory from "../components/Inventory.vue";
import IconBar from "../components/IconBar.vue";
import BoardGameStateProxy from "../BoardGameStateProxy";
import StateStore from "../StateStore";

@Options({
    components: {
        BoardComponent,
        PlayerSeat,
        BubbleMenu,
        PlayTable,
        Inventory,
        Piece: PieceComponent,
        IconBar,
    }
})
export default class GamePage extends Vue {
    public readonly gameState = new BoardGameStateProxy();
    public readonly ViewType = ViewType;
    public readonly SelectMode = SelectMode;
    public readonly StateStore = StateStore;
    public view: View = {
        type: ViewType.overall,
        label: 'Overall'
    };
    public inventoryOpen = false;

    public dragPiecePositionStyle = '';

    public async created() {
        StateStore.state = this.gameState;
        await this.gameState.setUpdateRate(1000);
    }

    public get availableViews(): View[] {
        return [
            { type: ViewType.overall, label: 'Overall' },
            { type: ViewType.hub, label: 'Table Center' },
            ...this.gameState.players.map(p => ({
                type: ViewType.player,
                player: p,
                label: p.username,
            } as View))
        ];
    }

    public get viewOptions(): MenuOption[] {
        return this.availableViews.map(v => ({
            label: v.label,
            action: () => (this.view = v, ''),
        }));
    }

    get pieces() {
        return this.gameState.getInventory();
    }

    moveDragPiece(event: MouseEvent) {
        const draggingPiece = StateStore.state.draggingPiece;
        if (!draggingPiece) {
            return;
        }
        const piece = draggingPiece.piece;
        const pivotPercents = {
            x: (piece.pivot.x + 0.5) / piece.shape.length,
            y: (piece.pivot.y + 0.5) / piece.shape[0].length,
        }
        this.dragPiecePositionStyle = `left: ${event.clientX}px;` +
            `top: ${event.clientY}px;` +
            `transform: translate(${pivotPercents.x * -6}em, ${pivotPercents.y * -6}em);`;
    }
}
</script>

<style scoped>
.game {
    user-select: none;
}
.view-menu-holder {
    position: absolute;
    top: 1em;
    left: 1em;
}

.floating-menu {
    z-index: 100;
}

.view-menu-trigger {
    padding: 1em;
    cursor: pointer;

    background-color: #4444;
    border-radius: 0.5em;
}

.drag-piece-container {
    position: fixed;
    z-index: 210;
    height: 6em;
    width: 6rem;
    pointer-events: none;
    opacity: 0.5;
}

.icon-bar {
    position: absolute;
    top: 1em;
    right: 1em;
}
</style>