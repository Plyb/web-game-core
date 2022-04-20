import axios from "axios";
import Core from "./index";

export default class Lobby {
    private playerNames: string[];
    private intervalId: number = -1;
    private loaded = false;

    constructor() {
        this.playerNames = [];
        this.updatePlayerNames();
    }

    public setUpdateRate(updateRate: number) {
        clearInterval(this.intervalId);
        this.intervalId = window.setInterval(
            () => this.updatePlayerNames(),
            updateRate
        );
    }

    private async updatePlayerNames() {
        try {
            const response = await axios.get(`/api/lobby/players/${Core.getGameId()}`);
            this.playerNames = response.data;
            this.loaded = true;
        } catch (e) {
            console.error(e);
        }
    }

    public getPlayerNames(): string[] {
        return this.playerNames;
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    public async kick(username: string) {
        try {
            await axios.delete(`/api/lobby/kick/${Core.getGameId()}/${username}`);
        } catch (e) {
            console.error(e);
        }
    }
}