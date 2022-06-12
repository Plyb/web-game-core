import UndoAction from "../../actions/UndoAction";
import Action from "../../actions/Action";
import RedoAction from "../../actions/RedoAction";

export class ActionNode {
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
            node = node.prev;
        }
        return null;
    }

    getLast() : ActionNode | null {
        return this.last;
    }

    getSince(nodeId: string): ActionDefinition[] {
        const parent = this.getById(nodeId);
        return this.getDescendants(parent);
    }

    getDescendants(parent: ActionNode | null): ActionDefinition[] {
        const descendants: ActionDefinition[] = [];
        for (let node: ActionNode | null = parent ? parent?.next : this.first; node !== null; node = node.next) {
            descendants.push({
                type: node.action.name,
                args: node.constructorArgs,
                id: node.action.id,
            });
        }
        return descendants;
    }

    getAllActions(): ActionDefinition[] {
        if (!this.first) {
            return [];
        }
        return [{
            type: this.first.action.name,
            args: this.first.constructorArgs,
            id: this.first.action.id
        }, ...this.getDescendants(this.first)];
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