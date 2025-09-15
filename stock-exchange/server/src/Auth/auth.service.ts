import {
    Injectable,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../Users/users.service';
import { ILogin, IUser } from 'src/interfaces';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
    private readonly expiresIn: string;
    private readonly jwtSecret: string;
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET env var is not set');
        }
        this.expiresIn =
            this.configService.get<string>('JWT_EXPIRES_IN') ?? '4h';
    }

    generateToken(payload: IUser) {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.expiresIn as StringValue,
        });
    }

    async signIn(data: ILogin) {
        const user = this.usersService.findOne(data.alias);
        if (user && (await bcrypt.compare(data.password, user.password))) {
            return {
                token: this.generateToken(user),
                name: user.name,
                surname: user.surname,
                alias: user.alias,
                role: user.role,
                ...(user.role === 'broker'
                    ? { baseMoney: user.baseMoney }
                    : {}),
            };
        }
        throw new HttpException(
            'The user was not found or incorrect password',
            HttpStatus.NOT_FOUND,
        );
    }

    async signInAdmin(data: ILogin) {
        const user = this.usersService.findOne(data.alias);
        if (!user || user.role !== 'admin') {
            throw new HttpException(
                'The user is not admin',
                HttpStatus.FORBIDDEN,
            );
        }
        if (await bcrypt.compare(data.password, user.password)) {
            return {
                token: this.generateToken(user),
                ...user,
            };
        }
        throw new HttpException(
            'The user was not found or incorrect password',
            HttpStatus.NOT_FOUND,
        );
    }

    async registration(user: IUser) {
        if (!this.usersService.findOne(user.alias)) {
            try {
                await this.usersService.addOne({ ...user, role: 'admin' });
            } catch {
                throw new HttpException(
                    'Ошибка добавления пользователя!',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            return user.alias;
        }
        throw new HttpException(
            'The user already existed',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    validateToken(token?: string): Omit<IUser, 'password'> {
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        try {
            const payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
            const user = this.usersService.findOne(payload.alias as string);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return omit(user, ['password']);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    validateAdmin(token?: string): Omit<IUser, 'password' | 'baseMoney'> {
        if (!token) throw new UnauthorizedException('Token is required');
        const admin = this.validateToken(token);
        if (admin.role !== 'admin') {
            throw new HttpException(
                'Вы не являетесь администратором!',
                HttpStatus.FORBIDDEN,
            );
        }
        return omit(admin, ['baseMoney']);
    }

    validateBroker(token?: string): Omit<IUser, 'password'> {
        if (!token) throw new UnauthorizedException('Token is required');
        const broker: Omit<IUser, 'password'> = this.validateToken(token);
        if (broker.role !== 'broker') {
            throw new HttpException(
                'Вы не являетесь брокером!',
                HttpStatus.FORBIDDEN,
            );
        }
        return broker;
    }
}
