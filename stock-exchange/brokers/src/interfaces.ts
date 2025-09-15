export interface IBroker {
  name: string;
  surname: string;
  alias: string;
  role: 'admin' | 'broker';
  baseMoney: number;
}

export interface ILogin extends IBroker {
  token: string;
}

export enum StockSymbols {
  AAPL = 'AAPL',
  SBUX = 'SBUX',
  MSFT = 'MSFT',
  CSCO = 'CSCO',
  QCOM = 'QCOM',
  META = 'META',
  AMZN = 'AMZN',
  TSLA = 'TSLA',
  AMD = 'AMD',
  NFLX = 'NFLX',
}

export interface IStocks {
  Date: string;
  Open: string;
}

export interface IAlert {
  type?: 'success' | 'failed' | 'normal';
  state?: 'active' | 'hidden';
  text?: string;
}

export interface IStartData {
  initialBalance: number;
  bidSpeed: number;
  choosedCompanies: StockSymbols[];
  currentDate: string;
  shares: { [key in StockSymbols]: number };
  stocks: { [key in StockSymbols]: IStocks[] };
}

export interface IUpdateData {
  currentDate: string;
  stocks: { [key in StockSymbols]: IStocks };
}

export interface IAction {
  type: string;
  price: number;
  amount: number;
}

export interface IResponse {
  success: boolean;
  message: string;
  action: IAction;
}

export interface INotify {
  message: string;
  state: 'success' | 'failed' | 'normal';
}

export const baseURL = 'http://localhost:3000';
