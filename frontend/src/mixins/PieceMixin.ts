import { Piece } from "@plyb/web-game-core-shared";
import { prop, Vue } from "vue-class-component";

export default abstract class PieceMixin extends Vue {
    get pieceSize() {
        return {
            width: this.piece.shape[0].length,
            height: this.piece.shape.length
        }
    }

    abstract piece: Piece;
}