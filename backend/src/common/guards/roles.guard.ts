import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { KeycloakUser } from '../strategies/keycloak.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: KeycloakUser = request.user;

    if (!user) {
      return false;
    }

    // Vérifier les rôles du realm
    const realmRoles = user.realm_access?.roles || [];
    
    // Vérifier les rôles du client
    const clientRoles = user.resource_access?.[process.env.KC_CLIENT_ID || 'demo-backend']?.roles || [];
    
    const userRoles = [...realmRoles, ...clientRoles];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}