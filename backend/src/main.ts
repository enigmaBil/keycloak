import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const cors = require('cors');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security - Helmet
  app.use(helmet({
    contentSecurityPolicy: false,

  }));

  

  // CORS - Configuration sécurisée
  const frontendUrl = configService.get<string>('app.frontendUrl');
  app.use(cors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://192.168.100.144:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }));

  // Global prefix pour toutes les routes API
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health'], // Exclure certaines routes du préfixe
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Masquer les messages en production
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription(
      'API REST sécurisée avec Keycloak pour la gestion de tâches. ' +
      'Authentification via JWT Bearer token obtenu depuis Keycloak.'
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints d\'authentification')
    .addTag('todos', 'Gestion des tâches')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('app', 'Informations générales')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT obtenu depuis Keycloak',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Développement local')
    .addServer('http://192.168.100.144:3001', 'Réseau local')
    .addServer(`http://localhost:${configService.get('app.port')}`, 'Serveur actuel')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // Garde le token en mémoire
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Todo API - Documentation',
  });

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application démarrée sur: http://localhost:${port}`);
  logger.log(`Documentation Swagger: http://localhost:${port}/api/docs`);
  logger.log(`Keycloak URL: ${configService.get('keycloak.url')}`);
  logger.log(`Keycloak Realm: ${configService.get('keycloak.realm')}`);
}
bootstrap();
