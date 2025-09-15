import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { join } from 'path';
import { IStocks } from 'src/interfaces';
import { parseDollar } from 'src/helper';

export enum StockSymbols {
    AAPL = 'AAPL',
    SBUX = 'SBUX',
    MSFT = 'MSFT',
    CSCO = 'CSCO',
    QCOM = 'QCOM',
    META = 'META',
    AMZN = 'AMZN',
    TSLA = 'TSLA',
    AMD = 'AMD',
    NFLX = 'NFLX',
}

function isStockSymbol(value: string): value is StockSymbols {
    return Object.values(StockSymbols).includes(value as StockSymbols);
}

@Injectable()
export class StocksService implements OnModuleInit {
    private stocks: Record<StockSymbols, IStocks[]> = {
        AAPL: [],
        SBUX: [],
        MSFT: [],
        CSCO: [],
        QCOM: [],
        META: [],
        AMZN: [],
        TSLA: [],
        AMD: [],
        NFLX: [],
    };
    private _choosedCompanies: StockSymbols[] = [];
    private _bidSpeed: number = 0;
    private _currentDate: string = '';

    async onModuleInit() {
        try {
            for (const key of Object.keys(this.stocks)) {
                const array = await this.loadStocks(key);
                this.stocks[key] = array.map(({ Date, Open }) => ({
                    Date,
                    Open,
                }));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async loadStocks(name: string): Promise<IStocks[]> {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(
                join(process.cwd(), 'data', `${name}.csv`),
            );
            Papa.parse(fileStream, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (result) => resolve(result.data as IStocks[]),
                error: (error) => reject(error),
            });
        });
    }

    public getMinMaxDate(): { min: string; max: string } | null {
        let minDate: Date | null = null;
        let maxDate: Date | null = null;
        let minStr: string = '';
        let maxStr: string = '';

        let hasData = false;

        for (const key of Object.keys(this.stocks)) {
            const stockList = this.stocks[key as StockSymbols];
            for (const stock of stockList) {
                const dateStr = stock.Date;
                const date = new Date(dateStr);

                // Проверяем валидность даты
                if (isNaN(date.getTime())) {
                    continue; // Пропускаем некорректные даты
                }

                hasData = true;

                if (minDate === null || date < minDate) {
                    minDate = date;
                    minStr = dateStr;
                }

                if (maxDate === null || date > maxDate) {
                    maxDate = date;
                    maxStr = dateStr;
                }
            }
        }

        if (!hasData) {
            return null; // Нет данных
        }

        return { min: minStr, max: maxStr };
    }

    public get bidSpeed() {
        return this._bidSpeed;
    }

    public set bidSpeed(value: number) {
        this._bidSpeed = value;
    }

    public get choosedCompanies() {
        return this._choosedCompanies;
    }

    public set choosedCompanies(companies: StockSymbols[]) {
        this._choosedCompanies = companies;
    }

    public get currentDate() {
        return this._currentDate;
    }

    public set currentDate(value: string) {
        this._currentDate = value;
    }

    getStocks(name: string): IStocks[] | undefined {
        if (!isStockSymbol(name)) return undefined;
        return this.stocks[name];
    }

    getStocksToDate(name: string, finishDate: string): IStocks[] | undefined {
        if (!isStockSymbol(name)) return undefined;
        const stocks: IStocks[] = [];
        for (let i = this.stocks[name].length - 1; i >= 0; i--) {
            if (
                !(
                    Date.parse(this.stocks[name][i].Date) <=
                    Date.parse(finishDate)
                )
            )
                break;
            stocks.push(this.stocks[name][i]);
        }
        return stocks;
    }

    getStocksByDate(name: string, date: string): IStocks | undefined {
        if (!isStockSymbol(name)) return undefined;
        const index = this.stocks[name].findIndex(
            (stock) => Date.parse(stock.Date) === Date.parse(date),
        );
        if (index === -1) return undefined;
        return this.stocks[name][index];
    }

    getPriceByDate(name: StockSymbols, date: string): number | undefined {
        const index = this.stocks[name].findIndex(
            (stock) => Date.parse(stock.Date) === Date.parse(date),
        );
        if (index === -1) return undefined;
        return parseDollar(this.stocks[name][index].Open);
    }
}
