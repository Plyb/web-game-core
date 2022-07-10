import axios from "axios";
import Core, { sendRequest, setSocketListener } from "./index";
import SocketListener from "./socketListener";

export default class Lobby {
    private playerNames: string[];
    private timeoutId: number = -1;
    private loaded = false;
    private started = false;
    private listeners: LobbyListener[] = [];

    constructor() {
        this.playerNames = [];
        const socketListener = new SocketListener();

        socketListener.message('/lobby/player-joined', (body) => {
            const playerName = body.playerName;
            this.playerNames.push(playerName);
        })

        setSocketListener(socketListener);
        this.load();
    }

    private async load() {
        try {
            const response = await sendRequest('/lobby/get-players');
            this.playerNames = response.body.players;
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