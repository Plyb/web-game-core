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

    static get52Cards(): PlayingCard[] {
        const cards: PlayingCard[] = [];
        for (const suit of Object.values(Suit)) {
            if (suit === Suit.Joker) {
                continue;
            }
            for (let number = 1; number <= 13; number++) {
                cards.push(new PlayingCard(number, suit));
            }
        }
        return cards;
    }
}