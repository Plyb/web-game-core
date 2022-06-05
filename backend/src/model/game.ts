import { BoardGameState, Player } from '@plyb/web-game-core-shared';
import { newUUID } from "@plyb/web-game-core-shared/src/model/utils";
import { StateConstructor } from '..';

export default class Game {
    public static games : {[key: string]: (Game | undefined)} = {};

    public readonly id : string
    private players: {[username: string]: Player | undefined} = {};
    private started = false;
    private _gameState: BoardGameState;
    public get gameState(): BoardGameState {
        return this._gameState;
    }
    private _originalGameStateJson: string;
    public get originalGameStateJson(): string {
        return this._originalGameStateJson;
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
        const game = this.games[gameId.toLowerCase()];
        if (!game) {
            throw new Error("Game does not exist");
        }
        return game;
    }

    public start(GameType: StateConstructor): void {
        this.started = true;
        this._gameState = GameType(Object.values(this.players));
        this._originalGameStateJson = this._gameState.toJSON();
    }

    public isStarted(): boolean {
        return this.started;
    }
}