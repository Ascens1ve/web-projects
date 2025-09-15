import {
    Controller,
    Headers,
    Body,
    Post,
    HttpException,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { StocksService, StockSymbols } from './stocks.service';
import { AuthService } from 'src/Auth/auth.service';
import {
    stockCompaniesDto,
    stockNameDto,
    tradesSpeedDto,
} from 'src/dto/many.dto';

@Controller('stocks')
export class StocksController {
    constructor(
        private readonly stocksService: StocksService,
        private readonly authService: AuthService,
    ) {}

    @Post('get')
    stocks(
        @Headers('authorization') authHeader: string,
        @Body() body: stockNameDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (this.authService.validateToken(token)) {
            return this.stocksService.getStocks(body.name);
        }
    }

    @Post('set-companies')
    setCompanies(
        @Headers('authorization') authHeader: string,
        @Body() body: stockCompaniesDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (this.authService.validateAdmin(token)) {
            if (
                body.companies.every((comp) =>
                    Object.values(StockSymbols).includes(comp),
                )
            ) {
                this.stocksService.choosedCompanies = body.companies;
                return {
                    status: 'success',
                    message: 'Companies updated successfully',
                    data: body.companies,
                };
            } else {
                throw new HttpException(
                    'Invalid names of companies',
                    HttpStatus.NOT_FOUND,
                );
            }
        }
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    @Get('min-max-dates')
    getDates(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        if (this.authService.validateToken(token)) {
            return this.stocksService.getMinMaxDate();
        }
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    @Post('bid-speed')
    setBidSpeed(
        @Headers('authorization') authHeader: string,
        @Body() body: tradesSpeedDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (this.authService.validateAdmin(token)) {
            if (body.value > 0) {
                this.stocksService.bidSpeed = body.value * 1000;
                return body.value;
            }
            throw new HttpException('Invalid value', HttpStatus.NOT_ACCEPTABLE);
        }
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
}
