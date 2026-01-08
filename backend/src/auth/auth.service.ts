import { Injectable } from '@nestjs/common';
import { KeycloakUser } from 'src/common/strategies/keycloak.strategy';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(keycloakUser: KeycloakUser) {
    if (!keycloakUser.email) {
      throw new Error('Email is required');
    }

    if (!keycloakUser.preferred_username) {
      throw new Error('Username is required');
    }

    const user = await this.prisma.user.upsert({
      where: { email: keycloakUser.email },
      update: {
        username: keycloakUser.preferred_username,
      },
      create: {
        email: keycloakUser.email,
        username: keycloakUser.preferred_username,
        password: '', // Le mot de passe est géré par Keycloak
      },
    });

    return user;
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
  }
}
