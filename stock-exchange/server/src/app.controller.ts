import {
    Body,
    Controller,
    Get,
    Post,
    Headers,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './Auth/auth.service';
import { BidState, IUser } from './interfaces';
import { StocksService, StockSymbols } from './Stocks/stocks.service';
import { EventsGateway } from './Events/events.gateway';
import { LoginDto } from './dto/login-broker.dto';
import { StartBidDto } from './dto/start.dto';
import { UserDto } from './dto/user.dto';
import { BrokersService } from './Brokers/brokers.service';
import { UsersService } from './Users/users.service';

@Controller()
export class AppController {
    constructor(
        private readonly authService: AuthService,
        private readonly stocksService: StocksService,
        private readonly brokersService: BrokersService,
        private readonly usersService: UsersService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    @Post('registration')
    registration(@Body() body: UserDto) {
        if (body.role === 'broker')
            throw new HttpException(
                'Регистрация не доступна для брокера!',
                HttpStatus.FORBIDDEN,
            );
        return this.authService.registration(body as IUser);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return await this.authService.signIn(body);
    }

    @Post('login-admin')
    async loginAdmin(@Body() body: LoginDto) {
        return await this.authService.signInAdmin(body);
    }

    @Get('user')
    me(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        return this.authService.validateAdmin(token);
    }

    @Post('start')
    startBid(
        @Headers('authorization') authHeader: string,
        @Body()
        body: StartBidDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (!this.authService.validateAdmin(token))
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

        this.stocksService.bidSpeed = body.bidSpeed * 1000;
        this.stocksService.choosedCompanies = body.choosedCompanies;
        this.stocksService.currentDate = body.currentDate;
        this.eventsGateway.startBid();
        return 'Trading has been successfully started';
    }

    @Post('pause')
    pauseBid(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        if (!this.authService.validateAdmin(token))
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        if (this.eventsGateway.BidStatus !== BidState.running) {
            throw new HttpException(
                "The bidding hasn't started",
                HttpStatus.BAD_REQUEST,
            );
        }
        this.eventsGateway.pauseSharing();
        return 'Trading has been successfully suspended';
    }

    @Post('resume')
    resumeBid(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        if (!this.authService.validateAdmin(token))
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        if (this.eventsGateway.BidStatus !== BidState.pause) {
            throw new HttpException(
                "The bidding hasn't started",
                HttpStatus.BAD_REQUEST,
            );
        }
        this.eventsGateway.resumeSharing();
        return 'Trading successfully resumed';
    }

    @Post('stop')
    async stopBid(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        if (!this.authService.validateAdmin(token))
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        if (this.eventsGateway.BidStatus !== BidState.running) {
            throw new HttpException(
                "The bidding hasn't started",
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.eventsGateway.stopSharing();
        return 'Bidding successfully completed';
    }

    @Get('buying-price')
    getBuyingPrice(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        const broker = this.authService.validateBroker(token);
        const sums = {};
        if (broker) {
            for (const company of this.stocksService.choosedCompanies) {
                sums[company] = this.brokersService.getSumBuyingPriceOfShares(
                    broker.alias,
                    company,
                );
            }
        }
        return sums;
    }

    @Get('brokers-info')
    getBuyingPriceAll(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        const admin = this.authService.validateAdmin(token);
        const sums: Record<
            string,
            {
                shares: Partial<Record<StockSymbols, [number, number, number]>>;
                balance: number;
            }
        > = {};
        if (admin) {
            for (const index of this.eventsGateway.getActiveBrokersIndexes()) {
                const user = this.usersService.findUserByIndex(index);
                sums[user.alias] = {
                    shares: {},
                    balance: user.baseMoney ?? 0,
                };
                for (const company of this.stocksService.choosedCompanies) {
                    const amount = this.brokersService.getAmount(
                        user.alias,
                        company,
                    );
                    const initialBuyingSum =
                        this.brokersService.getSumBuyingPriceOfShares(
                            user.alias,
                            company,
                        );
                    const price = this.stocksService.getPriceByDate(
                        company,
                        this.eventsGateway.currentDate,
                    );
                    if (!price) {
                        throw new HttpException(
                            'Ошибка получения цены',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    }
                    const profit = price * amount - initialBuyingSum;
                    sums[user.alias].shares[company] = [
                        amount,
                        initialBuyingSum,
                        profit,
                    ];
                }
            }
            return sums;
        }
        throw new HttpException(
            'Ошибка получения информации',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
