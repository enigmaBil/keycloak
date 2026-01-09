import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from 'src/database/prisma.service';
import { KeycloakUser } from '../strategies/keycloak.strategy';

@Injectable()
export class UserSyncInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as KeycloakUser;

    if (user && user.sub && user.email) {
      try {
        await this.prisma.user.upsert({
          where: { id: user.sub },
          update: {
            username: user.preferred_username,
            email: user.email,
          },
          create: {
            id: user.sub,
            email: user.email,
            username: user.preferred_username || user.email.split('@')[0],
            password: '', // Géré par Keycloak
          },
        });
      } catch (error) {
        console.error('Erreur sync utilisateur:', error);
      }
    }

    return next.handle();
  }
}
