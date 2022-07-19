<template>
<div class="piece">
    <div v-if="!isJoker && !piece.flipped" class="cell">
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 75 75"
            preserveAspectRatio="xMinYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
        >
            <text
                x="50%"
                y="50%"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="75"
                fill="black"
                font-family="Helvetica"
            >{{value}}</text>
        </svg>
    </div>
    <div class="cell"><img :src="suitAssetSource"/></div>
    
</div>
</template>

<script lang="ts">
import PieceOverlay from "./PieceOverlay.mixin";
import PlayingCardPiece, { Suit } from "@plyb/web-game-core-shared/src/model/gameState/pieces/PlayingCardPiece";

export default class PlayingCardOverlay extends PieceOverlay<PlayingCardPiece>() {
    get isJoker() {
        return this.piece.suit === Suit.Joker;
    }

    get value() {
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

    get suitAssetSource() {
        const suitAssetNames = {
            [Suit.Clubs]: "club",
            [Suit.Diamonds]: "diamond",
            [Suit.Hearts]: "heart",
            [Suit.Spades]: "spade",
            [Suit.Joker]: "joker",
        };

        const suitAssetName = this.piece.flipped
            ? "flipped"
            : suitAssetNames[this.piece.suit];
        return require(`../../assets/cards/${suitAssetName}.svg`);
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

.cell {
    padding: 15%;
    width: 70%;
    display: flex; /* I don't know why setting this to flex gets the two to play nicely, but it does */
}

img {
    width: 100%;
}
</style>