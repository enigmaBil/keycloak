import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { KeycloakAuthGuard } from 'src/common/guards/keycloak-auth.guard';
import type { KeycloakUser } from 'src/common/strategies/keycloak.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@CurrentUser() user: KeycloakUser) {
    // Synchroniser l'utilisateur Keycloak avec notre base de données
    await this.authService.syncUser(user);
    
    return {
      sub: user.sub,
      email: user.email,
      username: user.preferred_username,
      name: user.name,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérifier l\'état de l\'API' })
  @ApiResponse({ status: 200, description: 'API opérationnelle' })
  health() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}
