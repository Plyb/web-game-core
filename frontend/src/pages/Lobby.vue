<template>
<div v-if="isKicked">
    <p>You have been kicked from the game.</p>
    <button @click="goHome">Go Back</button>
</div>
<div v-else>
    <p>Game code: {{gameId}}</p>
    <p>Players:</p>
    <div v-for="playerName in model.getPlayerNames()" :key="playerName"
        class="player"
    >
        <p :class="{ 'me': playerName === username }">{{playerName}}</p>
        <button class="kick-button" @click="kick(playerName)">kick</button>
    </div>
    <div class="button-holder">
        <button @click="startGame">Start Game</button>
        <button class="kick-button" @click="leaveGame">Leave Game</button>
    </div>
</div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import LobbyModel, { LobbyListener } from "../lobby";
import Core from "../index";

// TODO: move this to a mixin
export default class Lobby extends Vue implements LobbyListener {
    model = new LobbyModel();
    gameId: string = Core.getGameId() || '';
    username: string = Core.getUsername() || '';

    mounted() {
        this.model.setUpdateRate(1000);
        this.model.listen(this);
    }

    async kick(username: string) {
        await this.model.kick(username);
    }

    goHome() {
        this.$router.push('/');
    }

    leaveGame() {
        this.model.leave();
        this.goHome();
    }

    async startGame() {
        this.model.startGame();
    }

    onGameStarted() {
        this.$router.push('/game');
    }

    get playerNames(): string[] {
        return this.model.getPlayerNames();
    }

    get isKicked(): boolean {
        return !this.playerNames.includes(this.username) && this.model.isLoaded();
    }
}

</script>

<style>
.player {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.kick-button {
    color: red;
    margin: 15px;
}

.button-holder {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.me {
    font-weight: bold;
}
</style>