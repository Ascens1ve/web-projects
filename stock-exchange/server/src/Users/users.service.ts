import {
    HttpException,
    HttpStatus,
    Injectable,
    OnModuleInit,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { IUser } from '../interfaces';
import * as bcrypt from 'bcrypt';
import { AsyncQueue } from '../shared/AsyncQueue';

@Injectable()
export class UsersService implements OnModuleInit {
    private users: IUser[];
    private readonly pathToFile: string = join(
        process.cwd(),
        'data',
        'users.json',
    );
    private readonly saltRounds: number = 10;
    private readonly fileQueue = new AsyncQueue();

    constructor() {}

    async onModuleInit() {
        await this.loadUsers();
    }

    async loadUsers() {
        await this.fileQueue.push(async () => {
            try {
                const data = await fs.readFile(this.pathToFile, 'utf-8');
                this.users = JSON.parse(data) as IUser[];
            } catch (error) {
                console.error(`Ошибка чтения users.json: ${error}`);
            }
        });
    }

    findOne(alias: string): IUser | undefined {
        return this.users.find((user) => user.alias === alias);
    }

    findIndexByAlias(alias: string): number {
        return this.users.findIndex((user) => user.alias === alias);
    }

    findUserByIndex(index: number): IUser {
        return this.users[index];
    }

    getById(id: number): IUser | undefined {
        if (id < 0 || id >= this.users.length) return undefined;
        return this.users[id];
    }

    get brokers() {
        return this.users.filter((user) => user.role === 'broker');
    }

    async addOne(user: IUser): Promise<void> {
        await this.fileQueue.push(async () => {
            try {
                const salt = await bcrypt.genSalt(this.saltRounds);
                const hash = await bcrypt.hash(user.password, salt);

                const newUsers = [...this.users, { ...user, password: hash }];

                const tmp = this.pathToFile + `.${process.pid}.tmp`;
                await fs.writeFile(tmp, JSON.stringify(newUsers, null, 2));
                await fs.rename(tmp, this.pathToFile);

                this.users = newUsers;
            } catch (error) {
                console.error(`Ошибка добавления пользователя: ${error}`);
            }
        });
    }

    async updateOne(alias: string, data: Partial<IUser>) {
        await this.fileQueue.push(async () => {
            const index = this.users.findIndex((user) => user.alias === alias);
            if (index === -1) {
                throw new HttpException(
                    `Пользователь ${alias} не найден`,
                    HttpStatus.NOT_FOUND,
                );
            }
            const newUsers = structuredClone(this.users);

            newUsers[index] = {
                ...newUsers[index],
                ...data, // Используйте данные без alias
            };

            try {
                const tmp = `${this.pathToFile}.${process.pid}.tmp`;
                await fs.writeFile(
                    tmp,
                    JSON.stringify(newUsers, null, 2),
                    'utf8',
                );
                await fs.rename(tmp, this.pathToFile);

                this.users = newUsers;
            } catch {
                throw new HttpException(
                    'Ошибка при записи файла',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        });
    }

    async deleteOne(alias: string) {
        await this.fileQueue.push(async () => {
            const index = this.users.findIndex((user) => user.alias === alias);
            if (index === -1) {
                throw new HttpException(
                    `Пользователь ${alias} не найден`,
                    HttpStatus.NOT_FOUND,
                );
            }
            const newUsers = [
                ...this.users.slice(0, index),
                ...this.users.slice(index + 1),
            ];

            try {
                const tmp = `${this.pathToFile}.${process.pid}.tmp`;
                await fs.writeFile(
                    tmp,
                    JSON.stringify(newUsers, null, 2),
                    'utf8',
                );
                await fs.rename(tmp, this.pathToFile);

                this.users = newUsers;
            } catch {
                throw new HttpException(
                    'Ошибка при записи файла',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        });
    }
}
