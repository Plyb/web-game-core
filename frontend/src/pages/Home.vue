<template>
<div>
  <div>
    <label>Username: </label>
    <input v-model="username"/>
  </div>
  <div>
    <button :disabled="!readyToStart" @click="startGame">start new game</button>
  </div>
  <div>
    <label>Game code: </label>
    <input v-model="gameId"/>
    <button :disabled="!readyToJoin" @click="joinGame">join game</button>
  </div>
  <div>
    <p class="error">{{inputErrorMessage}}</p>
    <p class="error">{{serverErrorMessage}}</p>
  </div>
</div>
</template>

<script lang="ts">
import Core from '../index';
import { AxiosError } from 'axios'
import { Vue, Options } from 'vue-class-component';

@Options({})
export default class Home extends Vue {
  gameId: string = Core.getGameId() || '';
  username: string = Core.getUsername() || '';
  serverErrorMessage: string = '';

  async startGame() {
    try {
      await Core.startGame(this.username);
      this.goToLobby();
    } catch (e: any) {
      const error: Error = e;
      this.serverErrorMessage = error.message;
    }
  }

  async joinGame() {
    try {
      await Core.joinGame(this.gameId, this.username);
      this.goToLobby();
    } catch (e: any) {
      const error: AxiosError = e;
      this.serverErrorMessage = error.response?.data;
    }
  }

  goToLobby() {
    this.$router.push('/lobby');
  }

  get inputErrorMessage(): string {
    const startMessage = this.readyToStart ? '' : 'Must input a username to start or join a game.';
    const joinMessage = this.gameIdValid ? '' : 
      this.gameId ? 'Invalid game id. Must enter a valid game id to join a game' : 'Must enter game code to join a game.'
    return startMessage + ' ' + joinMessage;
  }

  get readyToStart(): boolean {
    return !!this.username;
  }

  get gameIdValid() {
    return this.gameId.length === 4 && /^[a-z0-9]+$/i.test(this.gameId);
  }

  get readyToJoin(): boolean {
    return this.readyToStart && this.gameIdValid;
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.error {
  color: red;
}
</style>
