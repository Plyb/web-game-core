import { newUUID } from "./utils";

export default class Player {
    public readonly id: string;
    public readonly username: string;

    constructor(username: string) {
        this.id = newUUID(Player.name);
        this.username = username;
    }
}