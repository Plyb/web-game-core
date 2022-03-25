export default class Game {
    public static games : {[key: string]: Game} = {};

    public readonly id : string

    private constructor(id: string) {
        this.id = id;
    }

    public static createNewGame(): Game {
        const idLength = 4;
        const id = Math.random().toString(36).slice(4)
        const game = new Game(id);
        this.games[id] = game;
        return game;
    }
}