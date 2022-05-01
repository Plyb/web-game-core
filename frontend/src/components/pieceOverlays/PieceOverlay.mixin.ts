import { Piece } from "@plyb/web-game-core-shared";
import { prop, Vue } from "vue-class-component";

export default function PieceOverlayMixin<T extends Piece>() {
    class Props {
        piece: T = prop({
            required: true,
        });
    }

    return Vue.with(Props);
}

export class Props<T extends Piece> {
    piece: T = prop({
        required: true,
    });
}