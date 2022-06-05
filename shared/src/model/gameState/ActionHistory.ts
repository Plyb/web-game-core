import UndoAction from "../../actions/UndoAction";
import Action from "../../actions/Action";

class ActionNode {
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
}

export default class ActionHistory {
    private last: ActionNode | null = null;
    private first: ActionNode | null = null;

    add(action: Action, constructorArgs: any[]): void {
        const node = new ActionNode(action, constructorArgs);
        if (this.first === null || this.last === null) {
            this.last = node;
            this.first = node;
        } else {
            this.last.next = node;
            node.prev = this.last;
            this.last = node;
        }
    }

    getSince(timestamp: number): ActionDefinition[] {
        const actions: ActionDefinition[] = [];
        let node = this.last;
        while (node !== null) {
            if (node.timestamp > timestamp) {
                actions.push({
                    type: node.action.constructor.name,
                    args: node.constructorArgs,
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
            if ((currentAction.action.constructor === UndoAction) != redo) {
                previousUndos++;
            } else {
                if (previousUndos === 0) {
                    return currentAction.action;
                } else {
                    previousUndos--;
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