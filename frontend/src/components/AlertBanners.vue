<template>
<div class="container">
    <Banner v-for="(banner, index) in banners"
        :icon="banner.icon"
        :text="banner.text"
        :color="banner.color"
        @close="close(index)"
    />
</div>
</template>

<script lang="ts">
import AlertCore, { getBanners, removeBanner, setBanners } from "../AlertCore";
import { Options, Vue } from "vue-class-component";
import Banner from "./Banner.vue";

@Options({
    components: {
        Banner,
    }
})
export default class AlertBanners extends Vue {
    public readonly banners: Banner[] = [];
    created() {
        setBanners(this.banners);
        AlertCore.error('this is an error');
        AlertCore.warning('this is a warning');
        AlertCore.info('this is an info');
        AlertCore.success('this is a success');
    }

    public close(index: number) {
        removeBanner(index);
    }
}
</script>

<style scoped>
.container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>