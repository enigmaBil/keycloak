import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { KeycloakAuthGuard } from './common/guards/keycloak-auth.guard';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { keycloakConfig } from './config/keycloak.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { KeycloakUserSyncMiddleware } from './common/middlewares/keycloak-user-sync.middleware';

@Module({
  imports: [TodosModule, UsersModule, AuthModule, PrismaModule,
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      load: [keycloakConfig],
      envFilePath: '../.env',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    
    // Global Validation Pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true, 
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
    
    // Global Guards - il faut respecter l'ordre
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard, //Authentification d'abord
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, //Autorisation ensuite
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*'); // Appliqué sur toutes les routes

    consumer
      .apply(KeycloakUserSyncMiddleware)
      .exclude('auth/health', '/', 'health') // Exclure les routes publiques
      .forRoutes('*'); // Synchroniser l'utilisateur sur toutes les autres routes
  }
}
