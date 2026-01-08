import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from '../common/guards/keycloak-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Todo } from './entities/todo.entity';
import type { KeycloakUser } from '../common/strategies/keycloak.strategy';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ParseUUIDPipe } from 'src/common/pipes/parse-uuid.pipe';

@ApiTags('todos')
@Controller('todos')
@UseGuards(KeycloakAuthGuard)
@ApiBearerAuth('JWT-auth')
@UseInterceptors(ClassSerializerInterceptor)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès', type: Todo })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  create(
    @CurrentUser() user: KeycloakUser, 
    @Body() createTodoDto: CreateTodoDto
  ){
    return this.todosService.create(user.sub, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les tâches avec filtres' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des tâches récupérée avec succès',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Todo' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(
    @CurrentUser() user: KeycloakUser, 
    @Query() query: QueryTodoDto
  ) 
  {
    return this.todosService.findAll(user.sub, query);
  }

   @Get('statistics')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des tâches',
    description: 'Retourne le nombre total, complété, en attente et le taux de complétion'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées',
    schema: {
      properties: {
        total: { type: 'number', example: 10 },
        completed: { type: 'number', example: 7 },
        pending: { type: 'number', example: 3 },
        completionRate: { type: 'number', example: 70 },
      },
    },
  })
  getStatistics(@CurrentUser() user: KeycloakUser) 
  {
    return this.todosService.getStatistics(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par son ID' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tâche trouvée',
    type: Todo 
  })
  @ApiResponse({ status: 400, description: 'UUID invalide' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  findOne(
    @CurrentUser() user: KeycloakUser,
    @Param('id', ParseUUIDPipe) id: string // Utilisation du pipe personnalisé
  )
  {
    return this.todosService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tâche mise à jour',
    type: Todo 
  })
  @ApiResponse({ status: 400, description: 'Données invalides ou UUID invalide' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  update(
    @CurrentUser() user: KeycloakUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto
  ) {
    return this.todosService.update(id, user.sub, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiParam({ name: 'id', description: 'UUID de la tâche', type: 'string' })
  @ApiResponse({ status: 204, description: 'Tâche supprimée' })
  @ApiResponse({ status: 400, description: 'UUID invalide' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async remove(
    @CurrentUser() user: KeycloakUser,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    await this.todosService.remove(id, user.sub);
  }
}
