import Player from "./player";
import { newUUID } from "./utils";

export default class Game {
    public static games : {[key: string]: (Game | undefined)} = {};

    public readonly id : string
    private players: {[username: string]: Player | undefined} = {};

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
}