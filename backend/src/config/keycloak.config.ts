export const keycloakConfig = () => ({
  keycloak: {
    url: process.env.KC_URL || 'http://localhost:8080',
    realm: process.env.KC_REALM || 'Demo-Realm',
    clientId: process.env.KC_CLIENT_ID || 'demo-backend',
    clientSecret: process.env.KC_CLIENT_SECRET || '',
    issuer: `${process.env.KC_URL || 'http://localhost:8080'}/realms/${process.env.KC_REALM || 'Demo-Realm'}`,
    jwksUri: `${process.env.KC_URL || 'http://localhost:8080'}/realms/${process.env.KC_REALM || 'Demo-Realm'}/protocol/openid-connect/certs`,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  app: {
    port: parseInt(process.env.BACKEND_PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});

export type KeycloakConfig = ReturnType<typeof keycloakConfig>;