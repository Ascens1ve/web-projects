import {
  StockSymbols,
  type IResponse,
  type IStartData,
  type IStocks,
  type IUpdateData,
} from '@/interfaces';
import { parseDollar } from '@/services/helper';
import { useStocksStore } from '@/services/stocksStore';
import { io } from 'socket.io-client';
import { onUnmounted, reactive, ref, shallowRef } from 'vue';
import { useAlert } from './useAlert';

export function useSocketTrades() {
  const stocks = reactive<Partial<Record<StockSymbols, IStocks[]>>>({});

  const URL = 'http://localhost:3001/events';
  const socket = io(URL, {
    autoConnect: false,
    auth: { token: localStorage.getItem('accessToken') },
  });

  const stocksStore = useStocksStore();
  const speed = shallowRef<number>(0);
  const isStart = shallowRef<boolean>(false);
  const choosedCompanies = ref<StockSymbols[]>([]);
  const { updateAlert } = useAlert();

  function connect() {
    socket.connect();
  }

  socket.on('connected', (body: IStartData) => {
    console.log(body);
    stocksStore.balance = Number(body.initialBalance);
    speed.value = body.bidSpeed;
    stocksStore.setCurrentDate(body.currentDate);
    choosedCompanies.value = body.choosedCompanies;
    Object.entries(body.stocks).forEach(([sym, arr]) => {
      console.log(sym, arr);
      stocks[sym as StockSymbols] = arr;
      if (arr.length > 0)
        stocksStore.setPrice(sym as StockSymbols, parseDollar(arr[arr.length - 1].Open));
    });
    let price;
    Object.entries(body.shares).forEach(([sym, amount]) => {
      price = stocksStore.getPrice(sym as StockSymbols);
      stocksStore.updateAmountPrice(sym as StockSymbols, amount, price, 1);
    });
    isStart.value = true;
  });

  socket.on('update', (body: IUpdateData) => {
    console.log(body);
    stocksStore.setCurrentDate(body.currentDate);
    choosedCompanies.value.forEach((sym: StockSymbols) => {
      const point = body.stocks[sym];
      (stocks[sym] ||= []).push(point);
      stocksStore.setPrice(sym, parseDollar(point.Open));
    });
  });

  const events: string[] = ['warning', 'pause', 'resume', 'end', 'error'];

  events.forEach((event: string) => {
    socket.on(event, (body: Omit<IResponse, 'action'>) => {
      updateAlert(body.success ? 'success' : 'failed', 'active', body.message);
    });
  });

  function trade(
    name: StockSymbols,
    amount: number = 1,
    price: number,
    type: 'buy' | 'sell',
  ): Promise<IResponse> {
    return new Promise((resolve) => {
      socket.emit(type, { name, amount, price }, (res: IResponse) => {
        resolve(res);
      });
    });
  }

  onUnmounted(() => socket.disconnect());

  return { speed, choosedCompanies, stocks, connect, trade, isStart };
}
