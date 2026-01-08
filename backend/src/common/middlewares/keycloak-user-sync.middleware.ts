import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";
import { PrismaService } from "src/database/prisma.service";
import { KeycloakUser } from "../strategies/keycloak.strategy";


@Injectable()
export class KeycloakUserSyncMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req['user'] as KeycloakUser;
    
    if (user && user.email) {
      // Synchroniser l'utilisateur Keycloak avec notre BD
      try {
        await this.prisma.user.upsert({
          where: { email: user.email },
          update: {
            username: user.preferred_username,
          },
          create: {
            email: user.email,
            username: user.preferred_username || user.email.split('@')[0],
            password: '', // Géré par Keycloak
          },
        });
      } catch (error) {
        // Log mais ne bloque pas la requête
        console.error('Erreur sync utilisateur:', error);
      }
    }
    
    next();
  }
}