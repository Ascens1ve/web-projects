import { Module } from '@nestjs/common';
import { UsersModule } from 'src/Users/users.module';
import { AuthService } from './auth.service';
import { BrokersModule } from 'src/Brokers/brokers.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [UsersModule, BrokersModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
