import Piece, { Interaction, ShapeSpace } from "./Piece";


export class TestPiece extends Piece {
    public readonly shape = [
        [ShapeSpace.Filled, ShapeSpace.None],
        [ShapeSpace.Filled, ShapeSpace.None],
        [ShapeSpace.Filled, ShapeSpace.Filled],
    ];

    public readonly pivot = { x: 0, y: 2 };

    public get inventoryInteractions(): Interaction[] {
        return super.inventoryInteractions
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
}

const defaultPieceTypes = {
    TestPiece,
};

PieceTypes.addPieceTypes(defaultPieceTypes);