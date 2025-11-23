import { parseDollar } from '@/services/helper';

const dates = [
  '09/17/2021',
  '09/18/2021',
  '09/19/2021',
  '09/20/2021',
  '09/21/2021',
  '09/22/2021',
  '09/23/2021',
  '09/24/2021',
  '09/25/2021',
  '09/26/2021',
];

const stocks = {
  AAPL: [
    { Open: '$100.0', Date: dates[0] },
    { Open: '$105.0', Date: dates[1] },
    { Open: '$102.0', Date: dates[2] },
    { Open: '$98.0', Date: dates[3] },
    { Open: '$112.0', Date: dates[4] },
    { Open: '$108.5', Date: dates[5] },
    { Open: '$100.0', Date: dates[6] },
    { Open: '$100.3', Date: dates[7] },
    { Open: '$107.2', Date: dates[8] },
    { Open: '$94.0', Date: dates[9] },
  ],
  MSFT: [
    { Open: '$150.0', Date: dates[0] },
    { Open: '$153.4', Date: dates[1] },
    { Open: '$154.5', Date: dates[2] },
    { Open: '$153.2', Date: dates[3] },
    { Open: '$156.4', Date: dates[4] },
    { Open: '$161.4', Date: dates[5] },
    { Open: '$165.2', Date: dates[6] },
    { Open: '$160.4', Date: dates[7] },
    { Open: '$169.2', Date: dates[8] },
    { Open: '$169.0', Date: dates[9] },
  ],
};

const __mockSocketData = {
  initialBalance: '10000',
  bidSpeed: 15,
  choosedCompanies: ['MSFT', 'AAPL'],
  currentDate: dates[0],
  shares: { AAPL: 0, MSFT: 0 },
  stocks: {
    AAPL: [stocks.AAPL[0]],
    MSFT: [stocks.MSFT[0]],
  },
};

class MockSocket {
  #timer;
  #tickMs;

  constructor() {
    this.handlers = new Map();
    this.connected = false;
    this.currentIndex = 0;
    this.currentDate = dates[this.currentIndex];
    this.#timer = null;
    this.#tickMs = 5000;

    this._qty = { AAPL: 0, MSFT: 0 };
    this._sumCost = { AAPL: 0, MSFT: 0 };
  }

  on(event, cb) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event).push(cb);
  }

  connect() {
    this.connected = true;
    setTimeout(() => this.#trigger('connected', __mockSocketData), 100);
    setTimeout(() => this.#startTicker(), 100);
  }

  emit(event, data, callback) {
    if (event !== 'buy' && event !== 'sell') return;

    const sym = data.name;
    const unitPrice = parseDollar(stocks[sym][this.currentIndex].Open);
    const amount = Number(data.amount) || 0;

    if (event === 'buy') {
      this._qty[sym] = (this._qty[sym] || 0) + amount;
      this._sumCost[sym] = (this._sumCost[sym] || 0) + amount * unitPrice;

      callback?.({
        success: true,
        message: 'Акции успешно куплены!',
        action: { type: 'buy', amount, price: unitPrice },
      });
      return;
    }

    // sell
    const have = this._qty[sym] || 0;
    if (amount > have) {
      callback?.({ success: false, message: 'Недостаточно акций для продажи' });
      return;
    }
    const avg = have > 0 ? this._sumCost[sym] / have : 0;
    this._qty[sym] = have - amount;
    this._sumCost[sym] = Math.max(0, this._sumCost[sym] - avg * amount);

    callback?.({
      success: true,
      message: 'Акции успешно проданы!',
      action: { type: 'sell', amount, price: unitPrice },
    });
  }

  disconnect() {
    this.connected = false;
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
  }

  #trigger(event, data) {
    (this.handlers.get(event) || []).forEach((h) => h(data));
  }

  #nextPrice() {
    this.currentIndex += 1;
    if (this.currentIndex >= dates.length) {
      if (this.#timer) clearInterval(this.#timer);
      this.#timer = null;
      return null;
    }
    this.currentDate = dates[this.currentIndex];
    return {
      AAPL: stocks.AAPL[this.currentIndex],
      MSFT: stocks.MSFT[this.currentIndex],
    };
  }

  #emitUpdate() {
    if (!this.connected) return;
    const prices = this.#nextPrice();
    if (!prices) return;
    if (this.currentIndex === 10) {
      clearInterval(this.#timer);
    }
    this.#trigger('update', { currentDate: this.currentDate, stocks: prices });
  }

  #startTicker() {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = setInterval(() => this.#emitUpdate(), this.#tickMs);
  }

  getSumBuyingPriceOfShares(share) {
    return this._sumCost[share] || 0;
  }
  getSumBuyingPrices(companies = __mockSocketData.choosedCompanies) {
    const out = {};
    for (const sym of companies) out[sym] = this._sumCost[sym] || 0;
    return out;
  }
  setIntervalMs(ms) {
    this.#tickMs = ms;
    if (this.connected) this.#startTicker();
  }
  push(event, data) {
    this.#trigger(event, data);
  }
}

const singleton = new MockSocket();
globalThis.__MOCK_SOCKET = singleton; // чтобы читать из мок-API

export function io() {
  return singleton;
}
export default io;
