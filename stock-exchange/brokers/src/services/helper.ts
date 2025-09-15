import type { IAction, StockSymbols } from '@/interfaces';
import { type stocksStoretype } from './stocksStore';

export const actionsHandler = (name: StockSymbols, action: IAction, store: stocksStoretype) => {
  switch (action.type) {
    case 'buy':
      store.updateMoney(-action.price);
      store.updateAmountPrice(name, action.amount, action.price / action.amount, 1);
      break;
    case 'sell':
      store.updateMoney(action.price);
      store.updateAmountPrice(name, action.amount, action.price / action.amount, -1);
      break;
  }
};

export function parseDollar(value: string): number {
  return Number(value.split('$')[1]);
}
