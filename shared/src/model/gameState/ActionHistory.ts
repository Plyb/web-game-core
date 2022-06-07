import UndoAction from "../../actions/UndoAction";
import Action from "../../actions/Action";
import RedoAction from "../../actions/RedoAction";

export class ActionNode {
    public readonly timestamp = Date.now();

    constructor(
        public action: Action,
        public constructorArgs: any[] = [],
        public next: ActionNode | null = null,
        public prev: ActionNode | null = null,
    ) {}
}

export type ActionDefinition = {
    type: string,
    args: any[],
    id: string
}

export default class ActionHistory {
    private last: ActionNode | null = null;
    private first: ActionNode | null = null;

    add(action: Action, constructorArgs: any[]): ActionNode {
        const node = new ActionNode(action, constructorArgs);
        if (this.first === null || this.last === null) {
            this.last = node;
            this.first = node;
        } else {
            this.last.next = node;
            node.prev = this.last;
            this.last = node;
        }
        return node;
    }

    getById(id: string): ActionNode | null {
        let node = this.last;
        while (node) {
            if (node.action.id === id) {
                return node;
            }
        }
        return null;
    }

    getLast() : ActionNode | null {
        return this.last;
    }

    getSince(timestamp: number): ActionDefinition[] { //TODO: remove this
        const actions: ActionDefinition[] = [];
        let node = this.last;
        while (node !== null) {
            if (node.timestamp > timestamp) {
                actions.push({
                    type: node.action.constructor.name,
                    args: node.constructorArgs,
                    id: node.action.id,
                });
            } else {
                break;
            }
            node = node.prev;
        }
        return actions.reverse();
    }

    getAllActions(): ActionDefinition[] {
        return this.getSince(0);
    }

    getLastTimestamp() {
        return this.last ? this.last.timestamp : 0;
    }

    getNextUndoRedoAction(redo = false): Action | null {
        let previousUndos = 0;
        let currentAction = this.last;
        while (currentAction !== null) {
            if (currentAction.action.constructor === UndoAction) {
                if (redo && previousUndos >= 0) {
                    return currentAction.action;
                }
                previousUndos++;
            } else {
                if (!redo && previousUndos === 0) {
                    return currentAction.action;
                } else {
                    previousUndos--;
                    if (redo && currentAction.action.constructor !== RedoAction) {
                        return null;
                    }
                }
            }
            currentAction = currentAction.prev;
        }
        return null;
    }

    clear() {
        this.last = null;
        this.first = null;
    }

    removeLast() {
        if (this.last) {
            this.last.action.undo();
            if (this.last.prev) {
                this.last.prev.next = null;
            }
            this.last = this.last.prev;
            if (!this.last) {
                this.first = null;
            }
        }
    }
}