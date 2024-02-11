export function add(a: number, b: number): number {
    return a + b;
}

export function sub(a: number, b: number, c: boolean): number {
    if (c) {
        return a - b;
    } else {
        return b - a;
    }
}
