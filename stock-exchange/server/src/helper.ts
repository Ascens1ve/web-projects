/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const parseDollar = (value: string): number => {
    return parseFloat(value.split('$')[1]);
};

export const mapToObject = (map) => {
    const obj = {};
    for (const [key, value] of map) {
        if (value instanceof Map) {
            obj[key] = mapToObject(value); // рекурсия для вложенного Map
        } else {
            obj[key] = value;
        }
    }
    return obj;
};

export const mapHasValue = (map: Map<any, any>, v): boolean => {
    for (const value of map.values()) {
        // Object.is — корректно сравнивает NaN, -0 и др.
        if (Object.is(value, v)) return true;
    }
    return false;
};
