import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { StocksModule } from 'src/Stocks/stocks.module';
import { BrokersModule } from 'src/Brokers/brokers.module';
import { AuthModule } from 'src/Auth/auth.module';
import { UsersModule } from 'src/Users/users.module';

@Module({
    exports: [EventsGateway],
    providers: [EventsGateway],
    imports: [StocksModule, BrokersModule, AuthModule, UsersModule],
})
export class EventsModule {}
