const baseUrl = 'https://localhost:5174/';
const maxTimeout = 100000;

let ctx;
let pg;

describe('Stocks', () => {
  beforeEach(async () => {
    if (ctx) await ctx.close();
    ctx = await browser.createBrowserContext();
    pg = await ctx.newPage();
  });

  it(
    'buy',
    async () => {
      console.log('0');
      await pg.goto(baseUrl, { waitUntil: 'networkidle0' });
      console.log('1');

      await pg.waitForSelector('.main__wrapper .btn', { visible: true });
      await pg.$eval('.btn', (el) => el.click());

      console.log('2');
      await pg.waitForSelector('.main');

      const text = await pg.$eval('.main > .main__text', (el) => el.textContent.split(' ').at(-1));
      expect(text).toBe('09/17/2021');

      const company = await pg.$eval('.table tbody .table-cell', (el) => el.textContent);
      expect(company).toBe('MSFT');

      const price = await pg.$eval('.table tbody tr :nth-child(2)', (el) => el.textContent);
      expect(price).toBe('150');

      await pg.waitForSelector('.main .btn');

      await pg.$eval('.main .btn', (el) => el.click());

      await pg.waitForSelector('.modal .btn');

      await pg.$eval('.modal-buttons .btn', (el) => el.click());
      await pg.$eval('.modal-buttons .btn', (el) => el.click());
      await pg.$eval('.modal-buttons .btn', (el) => el.click());

      await pg.$eval('.close-button', (el) => el.click());

      await pg.waitForSelector('.main :nth-child(4)');
      const sum = await pg.$eval('.main :nth-child(4)', (el) => el.textContent.split(' ').at(-1));
      expect(Number(sum).toFixed(2)).toBe('450.00');

      await pg.waitForFunction(
        (selector, expected) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          const last = el.textContent.trim().split(/\s+/).pop();
          return last === expected;
        },
        { timeout: maxTimeout / 3, polling: 100 },
        '.main > .main__text',
        '09/23/2021',
      );

      const profit = await pg.$eval(
        '[data-table="second"] tbody :nth-child(1) :nth-child(4)',
        (el) => el.textContent,
      );
      expect(profit).toBe('45.60');
    },
    maxTimeout,
  );

  it(
    'sell',
    async () => {
      await pg.goto(baseUrl, { waitUntil: 'networkidle0' });

      await pg.waitForSelector('.main__wrapper .btn', { visible: true });
      await pg.$eval('.btn', (el) => el.click());

      await pg.waitForSelector('.main');

      const text = await pg.$eval('.main > .main__text', (el) => el.textContent.split(' ').at(-1));
      expect(text).toBe('09/17/2021');

      const company = await pg.$eval('.table tbody .table-cell', (el) => el.textContent);
      expect(company).toBe('MSFT');

      const price = await pg.$eval('.table tbody tr :nth-child(2)', (el) => el.textContent);
      expect(price).toBe('150');
      await pg.waitForSelector('.main .btn');

      await pg.$eval('.main .btn', (el) => el.click());

      await pg.waitForSelector('.modal .btn');

      await pg.$eval('.modal-buttons .btn', (el) => el.click());
      await pg.$eval('.modal-buttons .btn', (el) => el.click());
      await pg.$eval('.modal-buttons .btn', (el) => el.click());
      await pg.$eval('.modal-buttons :nth-child(2)', (el) => el.click());

      await pg.$eval('.close-button', (el) => el.click());

      await pg.waitForSelector('.main :nth-child(4)');
      const sum = await pg.$eval('.main :nth-child(4)', (el) => el.textContent.split(' ').at(-1));
      expect(Number(sum).toFixed(2)).toBe('300.00');

      await pg.waitForFunction(
        (selector, expected) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          const last = el.textContent.trim().split(/\s+/).pop();
          return last === expected;
        },
        { timeout: maxTimeout / 3, polling: 100 },
        '.main > .main__text',
        '09/23/2021',
      );

      const profit = await pg.$eval(
        '[data-table="second"] tbody :nth-child(1) :nth-child(4)',
        (el) => el.textContent,
      );
      expect(profit).toBe('30.40');
    },
    maxTimeout,
  );
});
