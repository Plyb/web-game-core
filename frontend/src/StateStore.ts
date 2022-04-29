import BoardGameStateProxy from "./BoardGameStateProxy";

export function StateStore<T extends BoardGameStateProxy>() {
    return class StateStore {
        public static state: T;
    }
}

export default StateStore<BoardGameStateProxy>();