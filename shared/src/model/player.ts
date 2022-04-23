import { newUUID } from "../../../backend/src/model/utils";

export type PlayerId = string;
export default class Player {
    public readonly id: PlayerId;
    public readonly username: string;

    constructor(username: string) {
        this.id = newUUID(Player.name);
        this.username = username;
    }
}