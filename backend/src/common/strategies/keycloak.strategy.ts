import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { keycloakConfig } from "src/config/keycloak.config";
import { passportJwtSecret } from "jwks-rsa";

export interface KeycloakUser {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak'){
    constructor() {
    const config = keycloakConfig();
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: [config.keycloak.clientId, 'account'],
      issuer: config.keycloak.issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.keycloak.jwksUri,
      }),
    });
  }

  async validate(payload: any): Promise<KeycloakUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Token JWT invalide');
    }

    // if (!payload.email) {
    //   throw new UnauthorizedException('Email manquant dans le token');
    // }

    return {
      sub: payload.sub,
      email_verified: payload.email_verified || false,
      name: payload.name,
      preferred_username: payload.preferred_username || payload.email,
      given_name: payload.given_name,
      family_name: payload.family_name,
      email: payload.email,
      realm_access: payload.realm_access,
      resource_access: payload.resource_access,
    };
  }
}