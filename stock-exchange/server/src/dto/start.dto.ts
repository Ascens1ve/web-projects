import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    Matches,
} from 'class-validator';
import { StockSymbols } from '../Stocks/stocks.service';
import { Type } from 'class-transformer';

export class StartBidDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    bidSpeed: number;

    @IsNotEmpty()
    @Matches(/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/\d{4}$/, {
        message: 'currentDate must be in the format MM/DD/YYYY',
    })
    currentDate: string;

    @IsNotEmpty()
    @IsArray()
    @IsEnum(StockSymbols, { each: true })
    choosedCompanies: StockSymbols[];
}
