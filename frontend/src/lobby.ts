import axios from "axios";
import Core, { sendRequest, setSocketListener } from "./core";
import SocketListener from "./socketListener";

export default class Lobby {
    private playerNames: string[] = [];
    private timeoutId: number = -1;
    private loaded = false;
    private started = false;
    private listeners: LobbyListener[] = [];

    public startListening() {
        const socketListener = new SocketListener();

        socketListener.message('/lobby/player-joined', (body) => {
            const playerName = body.playerName;
            this.playerNames.push(playerName);
        })

        socketListener.message('/lobby/player-left', (body) => {
            const playerName = body.playerName;
            const playerIndex = this.playerNames.findIndex((player) => player === playerName)
            this.playerNames.splice(playerIndex, 1);
        })

        setSocketListener(socketListener);
        this.load();
    }

    private async load() {
        try {
            const response = await sendRequest('/lobby/get-players');
            this.playerNames.push(...response.body.players);
            this.loaded = true;
            this.started = response.body.started;
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
            await sendRequest('/lobby/remove-player', {username});
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
            await sendRequest('/game/start');
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

    public addListener(listener: LobbyListener) {
        this.listeners.push(listener);
    }

    private stopUpdate() {
        clearTimeout(this.timeoutId);
    }
}

export interface LobbyListener {
    onGameStarted(): void;
}