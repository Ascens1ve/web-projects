export interface IUser {
  name: string;
  surname: string;
  alias: string;
}

export interface IBroker {
  name: string;
  surname: string;
  alias: string;
  baseMoney: string;
  password: string;
}

export interface IStocks {
  Date: string;
  Open: string;
}

export enum StocksCompanies {
  AAPL = 'AAPL',
  AMD = 'AMD',
  AMZN = 'AMZN',
  CSCO = 'CSCO',
  SBUX = 'SBUX',
  META = 'META',
  MSFT = 'MSFT',
  TSLA = 'TSLA',
  QCOM = 'QCOM',
  NFLX = 'NFLX',
}

export interface IStart {
  currentDate: string;
  bidSpeed: number;
  choosedCompanies: StocksCompanies[];
}

export interface IResponse {
  success: boolean;
  message: string;
}

export interface IAuth {
  token: string;
  name: string;
  surname: string;
  alias: string;
}

export type NotificationType = 'success' | 'error' | 'warn';
