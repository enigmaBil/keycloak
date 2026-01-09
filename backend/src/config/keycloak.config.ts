export const keycloakConfig = () => {
  const kcUrl = process.env.KC_URL || 'http://localhost:8080';
  const realm = process.env.KC_REALM || 'Demo-Realm';
  
  return {
    keycloak: {
      url: kcUrl,
      realm: realm,
      clientId: process.env.KC_CLIENT_ID || 'demo-backend',
      clientSecret: process.env.KC_CLIENT_SECRET || '',
      issuer: `${kcUrl}/realms/${realm}`,
      jwksUri: `${kcUrl}/realms/${realm}/protocol/openid-connect/certs`,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    app: {
      port: parseInt(process.env.BACKEND_PORT || '3001', 10),
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
  };
};

export type KeycloakConfig = ReturnType<typeof keycloakConfig>;