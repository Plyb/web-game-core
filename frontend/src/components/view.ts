import Player from "@plyb/web-game-core-shared/src/model/player";

export enum ViewType {
    overall,
    player,
    hub,
}
export type View = (
        { type: ViewType.overall } 
        | { type: ViewType.player, player: Player }
        | { type: ViewType.hub }
    )