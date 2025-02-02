import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    password: string;
}
