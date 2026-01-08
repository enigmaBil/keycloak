import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateTodoDto {
    @ApiProperty({ 
    description: 'Titre de la tâche',
    example: 'Acheter du lait'
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    description: 'Description détaillée de la tâche',
    required: false,
    example: 'Acheter 2 litres de lait entier'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  summary?: string;

  @ApiProperty({ 
    description: 'Statut de complétion',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
