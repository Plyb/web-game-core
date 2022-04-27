import {  plainToInstance } from "class-transformer";
import { newUUID } from "../utils";
import { Vec2 } from "./Board";
import { PieceTypes } from "./PieceTypes";

export enum ShapeSpace {
    None,
    Filled,
}

export type PieceId = string;
export type Interaction = {
    label: string,
    action: () => void
}

export default abstract class Piece {
    public abstract readonly shape: ShapeSpace[][];
    public readonly __type: string = this.constructor.name;

    public abstract readonly pivot: Vec2;

    constructor(public readonly id: PieceId = newUUID(Piece.name, 16)) {}

    get inventoryInteractions(): Interaction[] {
        return [
            { label: 'test', action: () => console.log('test') },
        ];
    }

    public static copy(piece: Piece): Piece {
        return plainToInstance(PieceTypes.pieceTypes[piece.__type], piece);
    }
}