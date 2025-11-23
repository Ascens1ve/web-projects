import { baseURL, StockSymbols, type IBroker, type ILogin } from '../interfaces';

export const loginBroker = async (alias: string, password: string): Promise<ILogin> => {
  const res = await fetch(`${baseURL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alias, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json() as Promise<ILogin>;
};

export const fetchBroker = async (): Promise<IBroker> => {
  let response;
  try {
    response = await fetch(`${baseURL}/broker`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<IBroker>;
};

export const fetchBuyingPrices = async (): Promise<Partial<Record<StockSymbols, number>>> => {
  console.log('FECT');
  const res = await fetch(`${baseURL}/buying-price`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json() as Partial<Record<StockSymbols, number>>;
};

export const fetchBrokersInfo = async (): Promise<
  Record<
    string,
    {
      shares: Partial<Record<StockSymbols, [number, number, number]>>;
      balance: number;
    }
  >
> => {
  const res = await fetch(`${baseURL}/brokers-info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
};
