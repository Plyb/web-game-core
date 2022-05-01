<template>
<div class="piece">
    <h2 v-if="!isJoker">{{piece.number}}</h2>
    <h2 :class="{'red-suit': isRedSuit}">{{icon}}</h2>
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