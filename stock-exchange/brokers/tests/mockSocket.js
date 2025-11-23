const __mockSocketData = {
  initialBalance: '10000',
  bidSpeed: 15,
  choosedCompanies: ['MSFT', 'AAPL'],
  currentDate: '17/09/2021',
  shares: { AAPL: 0, MSFT: 0 },
  stocks: {
    AAPL: [{ Open: 100.0, Date: '09/17/2021' }],
    MSFT: [{ Open: 150.0, Date: '09/17/2021' }],
  },
};

class MockSocket {
  constructor() {
    this.handlers = new Map();
    this.connected = false;
  }

  connect() {
    console.log('Connect');
    this.connected = true;
    setTimeout(() => {
      this.trigger('connected', __mockSocketData);
    }, 100);
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(callback);
  }

  emit(event, data, callback) {
    if (event === 'buy' || event === 'sell') {
      setTimeout(() => {
        callback?.({
          success: true,
          message: `${event === 'buy' ? 'Bought' : 'Sold'} ${data.amount} shares`,
          action: event,
        });
      }, 50);
    }
  }

  disconnect() {
    this.connected = false;
  }

  trigger(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }
}

module.exports = { MockSocket };
