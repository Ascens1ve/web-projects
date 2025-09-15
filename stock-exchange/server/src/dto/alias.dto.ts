import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AliasDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(48)
    alias: string;
}
