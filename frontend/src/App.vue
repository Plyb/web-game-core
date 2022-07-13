<template>
  <router-view v-if="loaded"/>
  <p v-else>loading...</p>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import Core, { reconnect } from "./core";

export default class App extends Vue {
    loaded = false;

    async created() {
        const currentRoute = document.location.hash;
        if (Core.getUserId() && currentRoute) { // Check that we aren't on the homepage
            await reconnect();
        }
        this.loaded = true;
    }
}
</script>
