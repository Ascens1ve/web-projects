import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(48)
    alias: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}
