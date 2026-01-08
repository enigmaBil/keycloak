import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/database/prisma.service';
import { QueryTodoDto } from './dto/query-todo.dto';
import { NotFoundException } from '@nestjs/common';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId,
      },
    });
  }

   async findAll(
    userId: string, 
    query: QueryTodoDto
  ): Promise<PaginatedResponse<any>> {
    const { search, completed, page, limit, sortBy, sortOrder } = query;

    // Construction de la clause where
    const where: any = { userId };

    if (completed !== undefined) {
      where.completed = completed;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Comptage total
    const total = await this.prisma.todo.count({ where });

    // Récupération des données paginées
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const data = await this.prisma.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy as string]: sortOrder },
    });

    return {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(total / (limit ?? 10)),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Todo avec l'ID ${id} introuvable`);
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette tâche');
    }

    return todo;
  }


  async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
    // Vérifier que le todo existe et appartient à l'utilisateur
    await this.findOne(id, userId);

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: string, userId: string) {
    // Vérifier que le todo existe et appartient à l'utilisateur
    await this.findOne(id, userId);

    return this.prisma.todo.delete({
      where: { id },
    });
  }

  async getStatistics(userId: string) {
    const [total, completed, pending] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, completed: true } }),
      this.prisma.todo.count({ where: { userId, completed: false } }),
    ]);

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
