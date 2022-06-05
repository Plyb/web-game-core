<template>
<div class="piece">
    <fit-text v-if="!isJoker">{{numberDisplay}}</fit-text>
    <fit-text :class="{'red-suit': isRedSuit}">{{icon}}</fit-text>
</div>
</template>

<script lang="ts">
import PieceOverlay from "./PieceOverlay.mixin";
import PlayingCardPiece, { Suit } from "@plyb/web-game-core-shared/src/model/gameState/pieces/PlayingCardPiece";

export default class PlayingCardOverlay extends PieceOverlay<PlayingCardPiece>() {
    get icon() {
        const suitToIcon = {
            [Suit.Clubs]: "♣",
            [Suit.Diamonds]: "♦",
            [Suit.Hearts]: "♥",
            [Suit.Spades]: "♠",
            [Suit.Joker]: "😜",
        }
        return suitToIcon[this.piece.suit];
    }

    get isRedSuit() {
        return this.piece.suit === Suit.Hearts || this.piece.suit === Suit.Diamonds;
    }

    get isJoker() {
        return this.piece.suit === Suit.Joker;
    }

    get numberDisplay() {
        if (this.piece.number === 1) {
            return "A";
        } else if (this.piece.number === 11) {
            return "J";
        } else if (this.piece.number === 12) {
            return "Q";
        } else if (this.piece.number === 13) {
            return "K";
        } else {
            return this.piece.number.toString();
        }
    }
}
</script>

<style scoped>
.piece {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: white;
}

.red-suit {
    color: red;
}

h2 {
    text-align: center;
    font-size: 2vw;
}
</style>