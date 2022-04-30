import DrawPile from "./DrawPile";
import { PieceTypes, TestPiece } from "./PieceTypes";
import PlayingCard from "./PlayingCardPiece";


const defaultPieceTypes = {
    TestPiece,
    PlayingCard,
    DrawPile,
};

PieceTypes.addPieceTypes(defaultPieceTypes);