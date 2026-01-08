import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryTodoDto {
  @ApiPropertyOptional({ 
    description: 'Recherche dans le titre et la description',
    example: 'acheter'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrer par statut de complétion',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ 
    description: 'Numéro de page',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Nombre d\'éléments par page',
    example: 10,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Champ de tri',
    enum: ['createdAt', 'updatedAt', 'title'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'title'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}