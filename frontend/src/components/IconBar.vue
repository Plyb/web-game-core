<template>
<div class="icon-bar">
    <i :class="['fas fa-undo', {'disabled': !hasActionToUndo}]" @click="undo"></i>
    <i :class="['fas fa-redo', {'disabled': !hasActionToRedo}]" @click="redo"></i>
</div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import UndoAction from "@plyb/web-game-core-shared/src/actions/UndoAction";
import RedoAction from "@plyb/web-game-core-shared/src/actions/RedoAction";
import StateStore from "../StateStore";

export default class IconBar extends Vue {
    undo() {
        if (this.hasActionToUndo) {
            this.gameState.executeAction(UndoAction);
        }
    }

    redo() {
        if (this.hasActionToRedo) {
            this.gameState.executeAction(RedoAction);
        }
    }

    get hasActionToUndo() {
        return this.gameState.actionHistory.getNextUndoRedoAction() != null;
    }

    get hasActionToRedo() {
        return this.gameState.actionHistory.getNextUndoRedoAction(true) != null;
    }

    get gameState() {
        return StateStore.state;
    }
}
</script>

<style scoped>
.disabled {
    opacity: 0.5;
    cursor: unset;
}

.icon-bar {
    background-color: #4444;
    border-radius: 0.5em;
}

i {
    padding: 1em;
    cursor: pointer;
}

.icon-bar i:not(:last-child)::after {
    position: absolute;
    width: 0;
    height: 50%;
    content: "";
    border-left: 1px solid #111;
    top: 25%;
    margin-left: 1em;
}
</style>