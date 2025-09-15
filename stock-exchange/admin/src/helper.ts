export function parseDollar(value: string): number {
    return Number(value.split('$')[1]);
}