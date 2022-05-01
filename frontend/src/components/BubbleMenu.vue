<template>
<div v-click-outside="() => open = false">
    <div class="trigger" @click="open = !open">
        <slot></slot>
    </div>
    <div class="menu" v-if="open">
        <p v-for="option in options" :key="option.label"
            class="option"
            @click="onClickOption(option)"
        >{{option.label}}</p>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";
import { Interaction } from "../index"
import StateStore from "../StateStore";

export type MenuOption = Interaction;

class Props {
    options: MenuOption[] = prop({
        required: true
    })
}

export default class BubbleMenu extends Vue.with(Props) {
    public open = false;

    public onClickOption(option: MenuOption) {
        this.$emit('option-selected', option.action(StateStore.state));
        this.open = false;
    }
}
</script>

<style scoped>
.trigger {
    text-align: left;
}

.menu {
    position: relative;
    top: 0;
    left: 0;
    user-select: none;
    pointer-events: all;
    width: fit-content;

    background-color: #222C;
    border-radius: 0.5em;
    border: 1px solid #000;
    z-index: 90;
}

.option {
    color: white;
    cursor: pointer;
    padding-left: 0.5em;
    padding-right: 0.5em;
}
</style>