import { plainToInstance } from "class-transformer";
import { PlayerId } from "../../player";
import Piece, { Interaction, ShapeSpace } from "../pieces/Piece";


export class TestPiece extends Piece {
    public readonly shape = [
        [ShapeSpace.Filled, ShapeSpace.None],
        [ShapeSpace.Filled, ShapeSpace.None],
        [ShapeSpace.Filled, ShapeSpace.Filled],
    ];

    public readonly pivot = { x: 0, y: 2 };

    public getInventoryInteractions(inventoryId: PlayerId): Interaction[] {
        return super.getInventoryInteractions(inventoryId);
    }

    public getName(): string {
        return "Test Piece";
    }

    public getDescription(): string {
        return "A test piece";
    }
}

type PieceConstructor = new (...args: any) => Piece;
export class PieceTypes {
    public static pieceTypes: { [key: string]: PieceConstructor } = {};

    public static addPieceType(constructor: PieceConstructor, name: string = constructor.name) {
        this.pieceTypes[name] = constructor;
    }

    public static addPieceTypes(constructors: {[key: string]: PieceConstructor}) {
        for (const key in constructors) {
            this.addPieceType(constructors[key], key);
        }
    }

    public static copy(piece: Piece): Piece {
        return plainToInstance(PieceTypes.pieceTypes[piece.__type], piece);
    }
}

const defaultPieceTypes = {
    TestPiece,
};

PieceTypes.addPieceTypes(defaultPieceTypes);