<template>
<div class="banner" :style="'border-color: ' + color">
    <i :class="['main-icon fas', 'fa-' + icon]" :style="'color: ' + color"></i>
    <span>{{text}}</span>
    <i class="fas fa-times close-icon" @click="$emit('close')"></i>
</div>
</template>

<script lang="ts">import { prop, Vue } from "vue-class-component";

class Props {
    icon: string = prop({
        required: true
    });

    text: string = prop({
        required: true
    });

    color: string = prop({
        required: true
    });
}

export default class Banner extends Vue.with(Props) {}
</script>

<style scoped>
.banner {
    width: 80%;
    max-width: 600px;
    margin: auto;
    padding: 1em;

    border: 2px solid;
    border-radius: 0.5em;
    background-color: #fff;
}

.main-icon {
    margin-right: 0.5em;
}

.close-icon {
    float: right;
    cursor: pointer;
}
</style>