<template>
<div :class="['piece click-hit-box', {'click-through': clickThrough}]" 
    :style="[clipPathStyle, rotationStyle, heightStyle]"
    v-mouseup-outside="() => onMouseupOutside()"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseLeave"
    @click="onClick"
    ref="piece"
>
    <template v-if="overlay && (!isBeingDragged || dragPiece)">
        <component  :is="overlay" class="overlay"
            :style="clipPathStyle"
            :piece="piece"
        />
    </template>

    <svg :viewBox="`0 0 ${size.x} ${size.y}`" class="overlay" preserveAspectRation="none">
        <path fill="transparent" stroke="black" stroke-width="5" :d="svgBorderPath"></path>
    </svg>
</div>
</template>

<script lang="ts">
import PieceMixin from "../mixins/PieceMixin";
import { Piece, ShapeSpace, Vec2 } from "../index";
import StateStore from "../StateStore";
import { MoveLocation } from "@plyb/web-game-core-shared/src/actions/MovePieceAction";
import { mixins, prop, Vue } from "vue-class-component";
import PieceOverlays from "./pieceOverlays/PieceOverlays";

class Props {
    piece: Piece = prop({
        required: true
    })

    location?: MoveLocation = undefined;

    dragPiece: boolean = false;
}

export default class PieceComponent extends mixins(PieceMixin, Vue.with(Props)) {
    private pressing: boolean = false;
    public size: Vec2 = {x: 0, y: 0};
    private resizeObserver!: ResizeObserver;

    $refs!: {
        piece: HTMLElement
    }

    mounted() {
        this.resizeObserver = new ResizeObserver(() => {
            this.size = {
                x: this.$refs.piece.offsetWidth,
                y: this.$refs.piece.offsetHeight,
            }
        });
        this.resizeObserver.observe(this.$refs.piece);
    }

    get overlay() {
        return PieceOverlays.getOverlay(this.piece);
    }

    beforeUnmount() {
        this.resizeObserver.disconnect();
    }

    get colStyle() {
        return `grid-template-columns: repeat(${this.pieceSize.width}, 1fr);`
    }

    get color() {
        return 'green';
    }

    getCellColorStyle(cell: ShapeSpace) {
        return cell === ShapeSpace.Filled ? `background-color: ${this.color};` : "";
    }

    public onMouseDown() {
        this.pressing = true;
        const longPressLength = 500;
        setTimeout(() => {
            if (this.pressing) {
                this.onLongPress();
            }
            this.pressing = false;
        }, longPressLength);
    }

    public onLongPress() {
        if (!this.location) {
            return;
        }
        StateStore.state.draggingPiece = {
            piece: this.piece,
            from: this.location
        };
    }

    public onMouseLeave() {
        this.pressing = false;
    }

    public async onMouseUp(event: MouseEvent) {
        this.pressing = false;
    }

    public onClick() {
        this.$emit('select', this.piece);
    }

    public get rotationStyle() {
        const pivotPercents = this.piece.getPivotPercents();
        const xOffset = 50 - (pivotPercents.x * 100); // / 2 because rotate uses the center of the element
        const yOffset = 50 - (pivotPercents.y * 100);
        return `transform: translate(${-xOffset}%, ${-yOffset}%) rotate(${-this.piece.rotation}deg) translate(${xOffset}%, ${yOffset}%)`
    }

    get clickThrough() {
        return StateStore.state.draggingPiece;
    }

    get isBeingDragged() {
        return StateStore.state.draggingPiece && StateStore.state.draggingPiece.piece === this.piece;
    }

    async onMouseupOutside() {
        if (StateStore.state.draggingPiece && StateStore.state.draggingPiece.piece === this.piece) {
            await this.$nextTick();
            StateStore.state.draggingPiece = null;
        }
    }

    get corners(): Vec2[] {
        class Vec2 {
            constructor(public x: number, public y: number) {
            }

            rotateClockwise() {
                return new Vec2(-this.y, this.x);
            }

            rotateCounterClockwise() {
                return new Vec2(this.y, -this.x);
            }

            move(dir: Vec2) {
                this.x += dir.x;
                this.y += dir.y;
            }

            add(other: Vec2) {
                return new Vec2(this.x + other.x, this.y + other.y);
            }

            equals(other: Vec2) {
                return this.x === other.x && this.y === other.y;
            }
        }

        const corners: Vec2[] = [];
        let finished = false;

        const self = this;
        const firstCell: Vec2 | undefined = (function getFirstCell() {
            for (let r = 0; r < self.pieceSize.height; r++) {
                for (let c = 0; c < self.pieceSize.width; c++) {
                    if (self.piece.shape[r][c] === ShapeSpace.Filled) {
                        return new Vec2(c, r);
                    }
                }
            }
        })();

        if (!firstCell) {
            return [];
        }

        let cell = new Vec2(firstCell.x, firstCell.y);
        let dir = new Vec2(1, 0);

        function filled(cell: Vec2) {
            if (dir.equals(new Vec2(0, 1)) || dir.equals(new Vec2(-1, 0))) {
                cell = cell.add(new Vec2(-1, 0));
            }
            if (dir.equals(new Vec2(-1, 0) || dir.equals(new Vec2(0, -1)))) {
                cell = cell.add(new Vec2(0, -1));
            }

            return self.piece.shape[cell.y] && self.piece.shape[cell.y][cell.x] === ShapeSpace.Filled;
        }

        while (!finished) {
            corners.push(new Vec2(cell.x, cell.y));
            if (filled(cell.add(dir.rotateCounterClockwise()))) {
                dir = dir.rotateCounterClockwise();
            } else if (!filled(cell)) {
                dir = dir.rotateClockwise();
            }
            cell.move(dir);
            if (cell.equals(firstCell)) {
                finished = true;
            }
        }

        return corners;
    }

    get clipPathStyle() {
        const corners = this.corners;
        return `clip-path: polygon(${corners.map(c => `${c.x * 100 / this.pieceSize.width}% ${c.y * 100 / this.pieceSize.height}%`).join(', ')});`;
    }

    get svgBorderPath() {
        const corners = this.corners;
        const scaleX = this.size.x;
        const scaleY = this.size.y;
        return corners.slice(1).reduce((acc, c) => {
            return acc + `L${c.x * scaleX / this.pieceSize.width},${c.y * scaleY / this.pieceSize.height} `;
        }, `M${corners[0].x * scaleX / this.pieceSize.width},${corners[0].y * scaleY / this.pieceSize.height} `) + 'Z';
    }

    get heightStyle() {
        return `height: ${this.size.x * this.pieceSize.height / this.pieceSize.width}px;`
    }
}
</script>

<style scoped>
.piece {
    width: 100%;
    display: grid;
    grid-gap: 0;
}

.cell {
    height: 0;
    padding-bottom: 100%;
}

.click-hit-box {
    cursor: pointer;
    pointer-events: all;
}

.click-through {
    pointer-events: none;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>