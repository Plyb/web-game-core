import { BoardGameState } from "@plyb/web-game-core-shared";
import Core from "./index"
import axios from "axios";

export default class BoardGameStateProxy extends BoardGameState {
    constructor() {
        super({x: 0, y: 0}, [], {x: 0, y: 0});
    }

    public async load() {
        const response = await axios.get(`api/game/state/${Core.getGameId()}`);
        this._hub = response.data.hub;
        this._mats = new Map(Object.entries(response.data.mats));
        this._players = response.data.players;
    }
}