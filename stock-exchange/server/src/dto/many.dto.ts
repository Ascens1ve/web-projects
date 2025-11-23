import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { StockSymbols } from '../Stocks/stocks.service';
import { Type } from 'class-transformer';

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

export class editBaseMoneyDto {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(48)
    alias: string;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    @ValidateIf((o) => o.role === 'broker')
    @Type(() => Number)
    @IsNumber()
    baseMoney?: number;
}
