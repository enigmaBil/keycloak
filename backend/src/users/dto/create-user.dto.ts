import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'johndoe' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}
