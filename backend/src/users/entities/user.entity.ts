import {ApiProperty} from "@nestjs/swagger";
import { User as PrismaUser } from "../../generated/prisma/client";
import { Exclude } from "class-transformer";


export class User implements Omit<PrismaUser, 'password'>{
    @ApiProperty()
    id: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @Exclude()
    password: string;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
