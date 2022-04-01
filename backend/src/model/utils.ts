const uuids: {
    [category: string]: Set<string> | undefined
} = {};

function generateAlphanumericString(length: number) {
    return Math.random().toString(36).slice(-length);
}

export function newUUID(category: string, length: number = 4) {
    let id = generateAlphanumericString(length);
    while (uuids[category]?.has(id)) {
        id = generateAlphanumericString(length);
    }
    return id;
}