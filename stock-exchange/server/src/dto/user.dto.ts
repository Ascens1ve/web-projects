import { Type } from 'class-transformer';
import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    MaxLength,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class UserDto {
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(48)
    name: string;

    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(48)
    surname: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(48)
    alias: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;

    @IsNotEmpty()
    @IsIn(['broker', 'admin'])
    role: 'broker' | 'admin';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    @ValidateIf((o) => o.role === 'broker')
    @Type(() => Number)
    @IsNumber()
    baseMoney?: number;
}
