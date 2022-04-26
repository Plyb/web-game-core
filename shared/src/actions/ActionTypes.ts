import Action from "./Action";
import PickUpItemAction from "./PickUpItemAction";


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
    PickUpItemAction,
}

ActionTypes.addActionTypes(defaultActionTypes);