import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        
        const adapter = new PrismaPg({
            connectionString: configService.get<string>('DATABASE_URL'),
        });

        super({adapter});
    }
    async onModuleInit() {
        await this.$connect();
        console.log('Connected to database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from database');
    }
}