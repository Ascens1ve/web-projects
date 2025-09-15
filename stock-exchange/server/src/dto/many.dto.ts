import { IsArray, IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { StockSymbols } from '../Stocks/stocks.service';

export class stockNameDto {
    @IsNotEmpty()
    @IsEnum(StockSymbols)
    name: StockSymbols;
}

export class stockCompaniesDto {
    @IsNotEmpty()
    @IsArray()
    @IsEnum(StockSymbols, { each: true })
    companies: StockSymbols[];
}

export class tradesSpeedDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    value: number;
}

export class tradesDataDto {
    @IsNotEmpty()
    @IsEnum(StockSymbols)
    name: StockSymbols;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    price: number;
}
