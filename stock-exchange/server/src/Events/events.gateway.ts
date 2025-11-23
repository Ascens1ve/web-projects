import { HttpException } from '@nestjs/common';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    ConnectedSocket,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/Auth/auth.service';
import { BrokersService } from 'src/Brokers/brokers.service';
import { editBaseMoneyDto, tradesDataDto } from 'src/dto/many.dto';
import { mapHasValue, mapToObject, parseDollar } from 'src/helper';
import { BidState, IUser } from 'src/interfaces';
import { StocksService } from 'src/Stocks/stocks.service';
import { UsersService } from 'src/Users/users.service';

@WebSocketGateway(3001, {
    namespace: 'events',
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://localhost:5173',
            'https://localhost:5174',
        ],
        credentials: true,
    },
})
export class EventsGateway implements OnGatewayConnection {
    @WebSocketServer()
    private server: Server;
    private timer: NodeJS.Timeout | null = null;
    public currentDate: string;
    private bidSpeed: number;
    private activeBrokers: Map<string, number>;
    private _bidStatus: BidState = BidState.stop;
    private lastDate: string;

    constructor(
        private readonly stocksService: StocksService,
        private readonly brokerService: BrokersService,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {
        this.activeBrokers = new Map<string, number>();
    }

    handleConnection(client: Socket) {
        console.log(client.handshake.query.page);
        const token = client.handshake.auth.token as string;
        if (client.handshake.query.page === '/imitation') {
            try {
                const admin = this.authService.validateAdmin(token);
                if (admin) {
                    const prices = {};
                    for (const company of this.stocksService.choosedCompanies) {
                        const price = this.stocksService.getPriceByDate(
                            company,
                            this.currentDate,
                        );
                        if (price) prices[company] = price;
                    }
                    client.emit('connected', {
                        speed: this.bidSpeed / 1000,
                        date: this.currentDate,
                        state: this.BidStatus,
                        prices,
                    });
                }
            } catch {
                client.emit('error', {
                    success: false,
                    message:
                        'Вы не являетесь администратором или торги закончены!',
                });
                client.disconnect();
            }
            return;
        }
        if (client.handshake.query.page === '/') {
            try {
                const admin = this.authService.validateAdmin(token);
                if (admin) {
                    client.emit('connected');
                }
            } catch {
                client.emit('error', {
                    success: false,
                    message: 'Вы не являетесь администратором!',
                });
                client.disconnect();
            }
            return;
        }
        if (this._bidStatus === BidState.stop) {
            client.emit('error', {
                success: false,
                message: 'Торги не начаты',
            });
            client.disconnect();
            return;
        }
        let user: Omit<IUser, 'password'>;
        try {
            user = this.authService.validateBroker(token);
        } catch {
            client.emit('error', {
                success: false,
                message: 'Вы не являетесь брокером!',
            });
            client.disconnect();
            return;
        }

        const index = this.usersService.findIndexByAlias(user.alias);
        if (index !== -1) {
            if (mapHasValue(this.activeBrokers, index)) {
                client.emit('error', {
                    success: false,
                    message: 'Данный брокер уже участвует в торгах',
                });
                client.disconnect();
                return;
            }
            this.activeBrokers.set(client.id, index);
        }

        const stocks = {};
        for (const company of this.stocksService.choosedCompanies) {
            stocks[company] = this.stocksService.getStocksToDate(
                company,
                this.currentDate,
            );
        }
        client.emit('connected', {
            initialBalance: user.baseMoney,
            bidSpeed: this.bidSpeed / 1000,
            choosedCompanies: this.stocksService.choosedCompanies,
            currentDate: this.currentDate,
            shares: mapToObject(this.brokerService.getBrokerShares(user.alias)),
            stocks,
        });
    }

    handleDisconnect(client: Socket) {
        this.activeBrokers.delete(client.id);
    }

    private addOneDay() {
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + 1);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        this.currentDate = `${mm}/${dd}/${yyyy}`;
    }

    private updateShare() {
        this.timer = setInterval(() => {
            this.addOneDay();
            if (this.currentDate === this.lastDate) this.stopSharing();
            const stocks = {};
            for (const company of this.stocksService.choosedCompanies) {
                stocks[company] = this.stocksService.getStocksByDate(
                    company,
                    this.currentDate,
                );
                if (!stocks[company]) return;
            }
            this.server.emit('update', {
                currentDate: this.currentDate,
                stocks,
            });
        }, this.bidSpeed);
    }

    private checkForRunning(@ConnectedSocket() client: Socket): boolean {
        if (this._bidStatus !== BidState.running) {
            client.emit('warning', {
                success: false,
                message: 'Торги не ведутся',
            });
            return false;
        }
        return true;
    }

    private async manualValidation(data) {
        const dto = plainToInstance(tradesDataDto, data as object);
        const errors = await validate(dto);
        if (errors.length) return true;
        return false;
    }

    public startBid() {
        this.currentDate = this.stocksService.currentDate;
        this.bidSpeed = this.stocksService.bidSpeed;
        this.lastDate = this.stocksService.getMinMaxDate()!.max;
        this._bidStatus = BidState.running;
        if (this.timer) clearInterval(this.timer);
        this.updateShare();
    }

    pauseSharing() {
        if (this.timer) clearInterval(this.timer);
        this._bidStatus = BidState.pause;
        this.server.emit('pause', {
            success: true,
            message: 'Торги приостановлены',
        });
    }

    resumeSharing() {
        this.updateShare();
        this._bidStatus = BidState.running;
        this.server.emit('resume', {
            success: true,
            message: 'Торги возобновлены',
        });
    }

    async stopSharing() {
        if (this.timer) clearInterval(this.timer);
        this._bidStatus = BidState.stop;
        this.server.emit('end', {
            success: true,
            message: 'Торги завершились',
        });
        await this.brokerService.saveResults();
    }

    @SubscribeMessage('buy')
    async handleBuyShare(
        @MessageBody() data: tradesDataDto,
        @ConnectedSocket() client: Socket,
    ) {
        if (await this.manualValidation(data)) {
            return { success: false, message: 'Неверные входные данные' };
        }
        if (!this.checkForRunning(client)) return;
        const currentStock = this.stocksService.getStocksByDate(
            data.name,
            this.currentDate,
        );
        if (!currentStock) {
            return { success: false, message: 'Акции не существует!' };
        }
        const brokerId = this.activeBrokers.get(client.id);
        if (!brokerId)
            return { success: false, message: 'Активный брокер на найден!' };
        const broker = this.usersService.getById(brokerId);
        if (!broker)
            return { success: false, message: 'Активный брокер на найден!' };
        const price = parseDollar(currentStock.Open) * data.amount;
        if (broker.baseMoney! < price) {
            return { success: false, message: 'Недостаточно средств!' };
        }
        this.brokerService.addShare(
            broker.alias,
            data.name,
            data.amount,
            price / data.amount,
        );
        broker.baseMoney! -= price;
        return {
            success: true,
            message: 'Акции успешно куплены!',
            action: { type: 'buy', amount: data.amount, price },
        };
    }

    @SubscribeMessage('sell')
    async handleSellShare(
        @MessageBody() data: tradesDataDto,
        @ConnectedSocket() client: Socket,
    ) {
        if (await this.manualValidation(data)) {
            return { success: false, message: 'Неверные входные данные!' };
        }
        if (!this.checkForRunning(client)) return;
        const currentStock = this.stocksService.getStocksByDate(
            data.name,
            this.currentDate,
        );
        if (!currentStock) {
            return { success: false, message: 'Акции не существует!' };
        }
        const brokerId = this.activeBrokers.get(client.id);
        if (!brokerId)
            return { success: false, message: 'Активный брокер на найден!' };
        const broker = this.usersService.getById(brokerId);
        if (!broker)
            return { success: false, message: 'Активный брокер на найден!' };
        const price = parseDollar(currentStock.Open) * data.amount;

        const shares = this.brokerService
            .getBrokerShares(broker.alias)
            ?.get(data.name);
        if (!(shares && shares >= data.amount)) {
            return { success: false, message: 'Недостаточно акций!' };
        }
        this.brokerService.removeShare(
            broker.alias,
            data.name,
            data.amount,
            price / data.amount,
        );
        broker.baseMoney! += price;
        return {
            success: true,
            message: 'Акции успешно проданы!',
            action: { type: 'sell', amount: data.amount, price },
        };
    }

    @SubscribeMessage('edit-basemoney')
    async handleEditBaseMoney(@MessageBody() data: editBaseMoneyDto) {
        try {
            await this.usersService.updateOne(data.alias, data);
            return { success: true, message: 'Начальный баланс изменен!' };
        } catch (error) {
            return {
                success: false,
                message: (error as HttpException).message,
            };
        }
    }

    get BidStatus() {
        return this._bidStatus;
    }

    public getActiveBrokersIndexes() {
        return this.activeBrokers.values();
    }
}
