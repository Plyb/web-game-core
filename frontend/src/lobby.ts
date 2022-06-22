import axios from "axios";
import Core from "./index";

export default class Lobby {
    private playerNames: string[];
    private timeoutId: number = -1;
    private loaded = false;
    private started = false;
    private listeners: LobbyListener[] = [];

    constructor() {
        this.playerNames = [];
        this.update();
    }

    public setUpdateRate(updateRate: number) {
        clearTimeout(this.timeoutId);
        this.timeoutId = window.setTimeout(
            async () => {
                await this.update();
                this.setUpdateRate(updateRate);
            },
            updateRate
        );
    }

    private async update() {
        try {
            const response = await axios.get(`/api/lobby/${Core.getGameId()}`);
            this.playerNames = response.data.players;
            this.loaded = true;
            this.started = response.data.started;
            if (this.started) {
                this.onGameStarted();
            }
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

    public async leave() {
        this.kick(Core.getUsername() || "");
        this.stopUpdate();
    }

    public async startGame() {
        try {
            await axios.post(`/api/game/start`, {
                gameId: Core.getGameId(),
            });
            this.onGameStarted();
        } catch (e) {
            console.error(e);
        }
    }

    private onGameStarted() {
        this.stopUpdate();
        this.listeners.forEach((listener) => listener.onGameStarted());
    }

    public isStarted(): boolean {
        return this.started;
    }

    public listen(listener: LobbyListener) {
        this.listeners.push(listener);
    }

    private stopUpdate() {
        clearTimeout(this.timeoutId);
    }
}

export interface LobbyListener {
    onGameStarted(): void;
}