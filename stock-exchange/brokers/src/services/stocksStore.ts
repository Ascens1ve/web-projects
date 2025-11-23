import { StockSymbols } from '@/interfaces';
import { defineStore } from 'pinia';

export interface StocksState {
  currentDate: string | null;
  balance: number;
  amountAndPrice: Map<StockSymbols, [number, number]>;
  error: string;
}

const reDate: RegExp = /^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/\d{4}$/;
export const useStocksStore = defineStore('stocks', {
  state: (): StocksState => ({
    currentDate: null,
    balance: 0,
    amountAndPrice: new Map<StockSymbols, [number, number]>(),
    error: '',
  }),
  actions: {
    setCurrentDate(date: string) {
      if (reDate.test(date)) this.currentDate = date;
      else this.error = 'Ошибка при проверке даты!';
    },
    updateMoney(value: number) {
      this.balance += Number(value);
    },
    setPrice(name: StockSymbols, value: number) {
      const data = this.amountAndPrice.get(name);
      if (!data) {
        this.amountAndPrice.set(name, [0, value]);
      } else {
        this.amountAndPrice.set(name, [data[0], value]);
      }
      this.amountAndPrice = new Map(this.amountAndPrice);
    },
    getPrice(name: StockSymbols) {
      const data = this.amountAndPrice.get(name);
      if (!data) return -1;
      return data[1];
    },
    updateAmountPrice(name: StockSymbols, amount: number, price: number, type: 1 | -1) {
      const data = this.amountAndPrice.get(name);
      if (!data && type === -1) {
        this.error = 'Акции данной компании отсутствуют!';
        return;
      }
      if (!data) {
        this.amountAndPrice.set(name, [amount, price]);
      } else {
        this.amountAndPrice.set(name, [data[0] + type * amount, price]);
      }
      this.amountAndPrice = new Map(this.amountAndPrice);
    },
  },
  getters: {
    sumOfShares: (state: StocksState) => {
      let sum: number = 0;
      for (const [amount, price] of state.amountAndPrice.values()) {
        sum += amount * price;
      }
      return sum;
    },
  },
});

export type stocksStoretype = ReturnType<typeof useStocksStore>;
