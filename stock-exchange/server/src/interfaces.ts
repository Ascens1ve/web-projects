export interface ILogin {
    alias: string;
    password: string;
}

export interface IUser {
    name: string;
    surname: string;
    alias: string;
    password: string;
    role: 'broker' | 'admin';
    baseMoney?: number;
}

export interface IStocks {
    Date: string;
    Open: string;
}

export enum BidState {
    stop,
    running,
    pause,
}
