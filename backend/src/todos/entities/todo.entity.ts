import { ApiProperty } from '@nestjs/swagger';
import {Todo as PrismaTodo} from '../../generated/prisma/client';

export class Todo implements PrismaTodo{
    @ApiProperty({ example: 'uuid-v4' })
    id: string;

    @ApiProperty({ example: 'Acheter du lait' })
    title: string;

    @ApiProperty({ example: 'Acheter 2 litres de lait entier', nullable: true })
    summary: string | null;

    @ApiProperty({ example: false })
    completed: boolean;

    @ApiProperty({ example: 'user-uuid-v4' })
    userId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
