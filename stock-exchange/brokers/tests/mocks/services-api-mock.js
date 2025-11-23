export async function fetchBuyingPrices() {
  const s = globalThis.__MOCK_SOCKET;
  // вернём объект вида { AAPL: number, MSFT: number }
  return s ? s.getSumBuyingPrices() : {};
}

export async function fetchShares() {
  // количество акций по каждой бумаге (если захочешь показывать)
  return (globalThis.__MOCK_SOCKET && globalThis.__MOCK_SOCKET.getShares()) || {};
}

export async function loginBroker() {
  return {
    baseMoney: 10000,
    name: 'maxim',
    surname: 'maximov',
    alias: 'maxim',
    role: 'broker',
    token: 'fdiubfdhbvdshijfn1i2j2ih3b4r3478ty278',
  };
}

export async function fetchBroker() {
  return {
    baseMoney: 10000,
    name: 'maxim',
    surname: 'maximov',
    alias: 'maxim',
    role: 'broker',
    token: 'fdiubfdhbvdshijfn1i2j2ih3b4r3478ty278',
  };
}

export async function fetchBrokersInfo() {
  return {};
}

export default { fetchBuyingPrices, fetchShares };
