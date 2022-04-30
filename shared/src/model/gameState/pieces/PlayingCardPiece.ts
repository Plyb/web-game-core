import Piece, { ShapeSpace } from "./Piece"

export enum Suit {
    Clubs = "Clubs",
    Diamonds = "Diamonds",
    Hearts = "Hearts",
    Spades = "Spades",
    Joker = "Joker",
}
export default class PlayingCard extends Piece {
    public readonly shape = [
        [ShapeSpace.Filled],
        [ShapeSpace.Filled],
    ];
    public readonly pivot = { x: 0, y: 0 };

    constructor(
        public readonly number: number,
        public readonly suit: Suit,
    ) {
        super();
    }
    
    public getName(): string {
        if (this.suit === Suit.Joker) {
            return "Joker";
        }
        return `${this.number} of ${this.suit}`;
    }

    public getDescription(): string {
        return "";
    }
}