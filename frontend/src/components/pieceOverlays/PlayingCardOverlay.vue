<template>
<div class="piece">
    <img v-if="!isJoker" :src="numberAssetSource">
    <img :src="suitAssetSource">
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

    get numberAssetName() {
        if (this.piece.number === 1) {
            return "a";
        } else if (this.piece.number === 11) {
            return "j";
        } else if (this.piece.number === 12) {
            return "q";
        } else if (this.piece.number === 13) {
            return "k";
        } else {
            return this.piece.number.toString();
        }
    }

    get numberAssetSource() {
        return require(`../../assets/cards/${this.numberAssetName}.svg`);
    }

    get suitAssetSource() {
        const suitAssetName = {
            [Suit.Clubs]: "club",
            [Suit.Diamonds]: "diamond",
            [Suit.Hearts]: "heart",
            [Suit.Spades]: "spade",
            [Suit.Joker]: "joker",
        }
        return require(`../../assets/cards/${suitAssetName[this.piece.suit]}.svg`);
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

img {
    width: 70%;
    padding: 15%;
}
</style>