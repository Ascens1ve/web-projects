import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/Users/users.service';
import { LoginDto } from '../dto/login-broker.dto';
import { AliasDto } from '../dto/alias.dto';
import { UserDto } from '../dto/user.dto';
import { IUser } from 'src/interfaces';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Get('broker')
    me(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')?.[1];
        return this.authService.validateToken(token);
    }

    @Post('/brokers/new')
    async addNewBroker(
        @Headers('authorization') authHeader: string,
        @Body() body: UserDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (body.role !== 'broker')
            throw new HttpException(
                'Добавить возможно только брокера!',
                HttpStatus.BAD_REQUEST,
            );
        if (this.usersService.findOne(body.alias))
            throw new HttpException(
                'Пользователя с таким псевдонимом уже существует!',
                HttpStatus.BAD_REQUEST,
            );
        if (this.authService.validateAdmin(token)) {
            try {
                await this.usersService.addOne(body as IUser);
                return this.usersService.brokers;
            } catch {
                throw new HttpException(
                    'Ошибка добавления брокера',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    @Delete('/brokers/delete')
    deleteBroker(
        @Headers('authorization') authHeader: string,
        @Body() body: AliasDto,
    ) {
        const token = authHeader?.split(' ')?.[1];
        if (this.authService.validateAdmin(token)) {
            return this.usersService.deleteOne(body.alias);
        }
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    @Post('/login')
    async login(@Body() body: LoginDto) {
        return await this.authService.signIn(body);
    }

    @Get('/brokers/all')
    getAllBrokers() {
        return this.usersService.brokers;
    }
}
