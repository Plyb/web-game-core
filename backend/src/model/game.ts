import { BoardGameState, Player } from '@plyb/web-game-core-shared';
import { newUUID } from "@plyb/web-game-core-shared/src/model/utils";

export default class Game {
    public static games : {[key: string]: (Game | undefined)} = {};

    public readonly id : string
    private players: {[username: string]: Player | undefined} = {};
    private started = false;
    private _gameState: BoardGameState;
    public get gameState(): BoardGameState {
        return this._gameState;
    }

    private constructor() {
        this.id = newUUID(Game.name);
    }

    public static createNewGame(): Game {
        const game = new Game();
        this.games[game.id] = game;
        return game;
    }

    public join(username: string): Player {
        if (this.players[username]) {
            throw new Error("That username is already taken");
        }

        const player = new Player(username);
        this.players[username] = player;
        return player;
    }

    public leave(username: string): void {
        delete this.players[username];
    }

    public getPlayerNames(): string[] {
        return Object.values(this.players).map((player) => player.username);
    }

    public static getGame(gameId: string): Game {
        const game = this.games[gameId];
        if (!game) {
            throw new Error("Game does not exist");
        }
        return game;
    }

    public start(): void {
        this.started = true;
        this._gameState = new BoardGameState(
            {x: 10, y: 10},
            Object.values(this.players),
            {x: 8, y: 8},
        );
    }

    public isStarted(): boolean {
        return this.started;
    }
}