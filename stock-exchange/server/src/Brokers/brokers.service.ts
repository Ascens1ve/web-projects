import { Injectable } from '@nestjs/common';
import { StockSymbols } from 'src/Stocks/stocks.service';
import { promises as fs } from 'fs';
import { mapToObject } from 'src/helper';
import { join } from 'path';

@Injectable()
export class BrokersService {
    private sharesBuyPrice: Map<string, Map<StockSymbols, number>> = new Map<
        string,
        Map<StockSymbols, number>
    >();
    private _brokerShares: Map<string, Map<StockSymbols, number>> = new Map<
        string,
        Map<StockSymbols, number>
    >();
    private readonly pathToFile: string = join(process.cwd(), 'data', 'shares');

    constructor() {}

    public getBrokerShares(
        alias: string,
    ): Map<StockSymbols, number> | undefined {
        const data = this._brokerShares.get(alias);
        return data ? data : new Map();
    }

    public getAmount(alias: string, share: StockSymbols): number {
        const data = this._brokerShares.get(alias);
        if (data) return data.get(share) ?? 0;
        return 0;
    }

    public addShare(
        alias: string,
        share: StockSymbols,
        amount: number,
        price: number,
    ) {
        let shares = this._brokerShares.get(alias);
        if (!shares) {
            shares = new Map<StockSymbols, number>();
            this._brokerShares.set(alias, shares);
        }

        let prices = this.sharesBuyPrice.get(alias);
        if (!prices) {
            prices = new Map<StockSymbols, number>();
            this.sharesBuyPrice.set(alias, prices);
        }

        const prevPrice = prices.get(share);
        if (prevPrice) prices.set(share, prevPrice + price * amount);
        else prices.set(share, price * amount);

        const prev = shares.get(share);

        if (prev) shares.set(share, prev + amount);
        else shares.set(share, amount);
    }

    public removeShare(
        alias: string,
        share: StockSymbols,
        amount: number,
        price: number,
    ) {
        const shares = this._brokerShares.get(alias);
        if (!shares) return;

        const prev = shares.get(share);

        const prices = this.sharesBuyPrice.get(alias);
        const prevPrice = prices?.get(share);
        // eslint-disable-next-line prettier/prettier
        if (prevPrice) prices?.set(share, (prevPrice - price * amount) >= 0 ? prevPrice - price * amount : 0);
        else prices?.set(share, 0);

        if (prev) shares.set(share, prev - amount >= 0 ? prev - amount : 0);
        else shares.set(share, 0);
    }

    public clearShares() {
        this.sharesBuyPrice = new Map<string, Map<StockSymbols, number>>();
        this._brokerShares = new Map<string, Map<StockSymbols, number>>();
    }

    public async saveResults() {
        const path = `${this.pathToFile}${new Date().toISOString().replaceAll(':', '-')}.json`;
        try {
            await fs.writeFile(
                path,
                JSON.stringify(mapToObject(this._brokerShares), null, 2),
            );
            this.clearShares();
        } catch (error) {
            console.error(error);
        }
    }

    public getSumBuyingPriceOfShares(
        alias: string,
        share: StockSymbols,
    ): number {
        const prices = this.sharesBuyPrice.get(alias);
        if (!prices) return 0;
        const needed = prices.get(share);
        return needed ? needed : 0;
    }
}
