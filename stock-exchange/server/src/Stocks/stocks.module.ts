import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { AuthModule } from 'src/Auth/auth.module';
import { BrokersModule } from 'src/Brokers/brokers.module';

@Module({
    providers: [StocksService],
    imports: [AuthModule, BrokersModule],
    controllers: [StocksController],
    exports: [StocksService],
})
export class StocksModule {}
