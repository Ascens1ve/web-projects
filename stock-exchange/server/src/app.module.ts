import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './Auth/auth.module';
import { BrokersModule } from './Brokers/brokers.module';
import { ConfigModule } from '@nestjs/config';
import { StocksModule } from './Stocks/stocks.module';
import { EventsModule } from './Events/events.module';
import { UsersModule } from './Users/users.module';

@Module({
    imports: [
        AuthModule,
        BrokersModule,
        StocksModule,
        EventsModule,
        UsersModule,
        ConfigModule.forRoot({ isGlobal: true }),
    ],
    controllers: [AppController],
})
export class AppModule {}
