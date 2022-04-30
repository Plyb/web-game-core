import Action from "./Action";
import DrawPieceAction from "./DrawPieceAction";
import FlipDrawPileAction from "./FlipDrawPileAction";
import MovePieceAction from "./MovePieceAction";
import RedoAction from "./RedoAction";
import RotatePieceAction from "./RotatePieceAction";
import ShuffleAction from "./ShuffleAction";
import UndoAction from "./UndoAction";


export type ActionConstructor = new (...args: any[]) => Action;
export default class ActionTypes {
    public static actionTypes: { [key: string]: ActionConstructor } = {};

    public static addActionType(constructor: ActionConstructor, name: string = constructor.name) {
        this.actionTypes[name] = constructor;
    }

    public static addActionTypes(constructors: {[key: string]: ActionConstructor}) {
        for (const key in constructors) {
            this.addActionType(constructors[key], key);
        }
    }
}

const defaultActionTypes = {
    RotatePieceAction,
    UndoAction,
    RedoAction,
    MovePieceAction,
    DrawPieceAction,
    ShuffleAction,
    FlipDrawPileAction,
}

ActionTypes.addActionTypes(defaultActionTypes);