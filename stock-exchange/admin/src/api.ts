import { baseURL } from './constants';
import {
  IAuth,
  IBroker,
  IStart,
  IStocks,
  IUser,
  StocksCompanies,
} from './interfaces';

export const loginByAlias = async (
  alias: string,
  password: string,
): Promise<IAuth> => {
  let response;
  try {
    response = await fetch(`${baseURL}/login-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias, password }),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<IAuth>;
};

export const fetchUser = async (): Promise<IUser> => {
  let response;
  try {
    response = await fetch(`${baseURL}/user`, {
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
  return response.json() as Promise<IUser>;
};

export const fetchStocks = async (name: string): Promise<IStocks[]> => {
  let response;
  try {
    response = await fetch(`${baseURL}/stocks/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ name }),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<IStocks[]>;
};

export const sendChoosedCompanies = async (
  companies: StocksCompanies[],
): Promise<{ status: string; message: string; data: StocksCompanies[] }> => {
  let response;
  try {
    response = await fetch(`${baseURL}/stocks/set-companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ companies }),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<{
    status: string;
    message: string;
    data: StocksCompanies[];
  }>;
};

export const getMinMaxDates = async (): Promise<{
  min: string;
  max: string;
}> => {
  let response;
  try {
    response = await fetch(`${baseURL}/stocks/min-max-dates`, {
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
  return response.json() as Promise<{ min: string; max: string }>;
};

export const postBroker = async (data: {
  [key: string]: string;
}): Promise<IBroker[]> => {
  let response;
  try {
    response = await fetch(`${baseURL}/brokers/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ ...data, role: 'broker' }),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<IBroker[]>;
};

export const deleteBroker = async (alias: string): Promise<boolean> => {
  let response;
  try {
    response = await fetch(`${baseURL}/brokers/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ alias }),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return true;
};

export const getAllBrokers = async (): Promise<IBroker[]> => {
  let response;
  try {
    response = await fetch(`${baseURL}/brokers/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json() as Promise<IBroker[]>;
};

export const setStart = async (data: IStart): Promise<string> => {
  console.log(data);
  let response;
  try {
    response = await fetch(`${baseURL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.text();
};

export const setPause = async (): Promise<string> => {
  let response;
  try {
    response = await fetch(`${baseURL}/pause`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.text();
};

export const setResume = async (): Promise<string> => {
  let response;
  try {
    response = await fetch(`${baseURL}/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.text();
};

export const setStop = async (): Promise<string> => {
  let response;
  try {
    response = await fetch(`${baseURL}/stop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch {
    throw new Error('Ошибка при запросе к серверу');
  }
  if (!response.ok) throw new Error((await response.json()).message);
  return response.text();
};
