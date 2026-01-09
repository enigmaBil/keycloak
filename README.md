# 🔐 Keycloak Authentication Demo

Application full-stack de gestion de tâches avec authentification Keycloak, construite avec NestJS (backend) et Next.js (frontend).

## 📋 Architecture

```
keycloak/
├── backend/          # API NestJS avec Prisma ORM
├── frontend/         # Application Next.js avec NextAuth
├── keycloak/         # Configuration Keycloak personnalisée
└── docker-compose.yaml
```

### Stack Technologique

**Backend:**
- NestJS 11
- Prisma 7 (PostgreSQL)
- Passport JWT avec jwks-rsa
- Swagger/OpenAPI

**Frontend:**
- Next.js 16
- NextAuth 4
- TailwindCSS 4
- Radix UI

**Infrastructure:**
- Keycloak (dernière version)
- PostgreSQL (2 instances)
- Docker & Docker Compose

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Node.js 22+
- npm ou pnpm

### 1. Configuration

Le fichier `.env` à la racine contient toutes les configurations nécessaires. **Important:** Configurez le `FRONTEND_CLIENT_SECRET` après avoir créé le client dans Keycloak.

### 2. Lancer les services

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 3. Configurer Keycloak

1. Accédez à [http://localhost:8080](http://localhost:8080)
2. Connectez-vous avec:
   - Username: `admin`
   - Password: `admin123!`

3. Créer le realm `Demo-Realm`:
   - Cliquez sur "Create Realm"
   - Nom: `Demo-Realm`

4. Créer le client backend `demo-backend`:
   - Clients → Create client
   - Client ID: `demo-backend`
   - Client authentication: ON
   - Authorization: OFF
   - Valid redirect URIs: `http://localhost:3001/*`
   - Web origins: `http://localhost:3001`
   - Copiez le Client Secret et mettez-le dans `.env` → `BACKEND_CLIENT_SECRET`

5. Créer le client frontend `demo-frontend`:
   - Clients → Create client
   - Client ID: `demo-frontend`
   - Client authentication: ON (pour production)
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
   - Copiez le Client Secret et mettez-le dans:
     - `.env` → `FRONTEND_CLIENT_SECRET`
     - `frontend/.env.local` → `KEYCLOAK_CLIENT_SECRET`

6. Créer un utilisateur test:
   - Users → Add user
   - Username: `testuser`
   - Email: `test@example.com`
   - Credentials → Set password

### 4. Initialiser la base de données

```bash
# Entrer dans le container backend
docker exec -it demo-backend sh

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Sortir du container
exit
```

### 5. Accéder à l'application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Docs (Swagger)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Keycloak Admin**: [http://localhost:8080](http://localhost:8080)

## 📝 Utilisation

### Authentification

1. Sur la page de login ([http://localhost:3000](http://localhost:3000))
2. Cliquez sur "Se connecter" ou utilisez les boutons OAuth
3. Vous serez redirigé vers Keycloak
4. Connectez-vous avec vos identifiants
5. Retour automatique vers le dashboard

### API Backend

L'API est protégée par JWT. Pour tester avec Swagger:

1. Allez sur [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
2. Obtenez un token JWT depuis Keycloak:
   ```bash
   curl -X POST 'http://localhost:8080/realms/Demo-Realm/protocol/openid-connect/token' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'client_id=demo-backend' \
     -d 'client_secret=YOUR_CLIENT_SECRET' \
     -d 'username=testuser' \
     -d 'password=YOUR_PASSWORD' \
     -d 'grant_type=password'
   ```
3. Cliquez sur "Authorize" dans Swagger
4. Collez le token (format: `Bearer YOUR_TOKEN`)

## 🛠️ Développement

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Lancer en mode dev (hors Docker)
npm run start:dev

# Tests
npm run test

# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en mode dev (hors Docker)
npm run dev

# Build
npm run build

# Linter
npm run lint
```

## 🔧 Configuration Avancée

### Variables d'environnement importantes

#### Backend
- `DATABASE_URL`: URL de connexion PostgreSQL
- `KC_URL`: URL interne Keycloak (dans Docker: `http://keycloak:8080`)
- `KC_REALM`: Nom du realm Keycloak
- `KC_CLIENT_ID`: Client ID backend
- `KC_CLIENT_SECRET`: Secret du client backend

#### Frontend
- `KEYCLOAK_CLIENT_ID`: Client ID frontend
- `KEYCLOAK_CLIENT_SECRET`: Secret du client frontend
- `KEYCLOAK_ISSUER`: URL du realm (`http://localhost:8080/realms/Demo-Realm`)
- `NEXT_PUBLIC_API_URL`: URL de l'API backend
- `AUTH_SECRET`: Secret pour NextAuth (généré avec `openssl rand -base64 32`)

### Ports utilisés

- **3000**: Frontend Next.js
- **3001**: Backend NestJS
- **8080**: Keycloak
- **5432**: PostgreSQL Keycloak
- **5433**: PostgreSQL Backend

## 🐛 Dépannage

### Problème: "Token invalide"
- Vérifiez que le realm est correct dans `.env`
- Assurez-vous que le client secret est bien configuré
- Vérifiez que l'horloge du système est synchronisée

### Problème: "Cannot connect to database"
- Vérifiez que PostgreSQL est démarré: `docker-compose ps`
- Consultez les logs: `docker-compose logs postgres_backend`
- Vérifiez `DATABASE_URL` dans `.env`

### Problème: "Keycloak ne démarre pas"
- Attendez 30-60 secondes (temps de démarrage normal)
- Vérifiez les healthchecks: `docker-compose ps`
- Vérifiez les logs: `docker-compose logs keycloak`

### Réinitialiser tout

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Redémarrer proprement
docker-compose up --build -d
```

## 📚 Documentation API

L'API est entièrement documentée avec Swagger/OpenAPI:
- Documentation interactive: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### Endpoints principaux

**Auth:**
- `GET /api/v1/auth/profile` - Profil utilisateur
- `GET /api/v1/auth/health` - Health check

**Todos:**
- `GET /api/v1/todos` - Liste des tâches
- `POST /api/v1/todos` - Créer une tâche
- `GET /api/v1/todos/:id` - Détails d'une tâche
- `PATCH /api/v1/todos/:id` - Mettre à jour une tâche
- `DELETE /api/v1/todos/:id` - Supprimer une tâche

## 🔒 Sécurité

- ✅ JWT avec RS256 (clés publiques via JWKS)
- ✅ CORS configuré
- ✅ Helmet pour les headers de sécurité
- ✅ Validation des données (class-validator)
- ✅ Sanitization automatique (whitelist)
- ✅ Rate limiting sur JWKS
- ✅ HTTPS recommandé en production

## 📦 Production

### Checklist

- [ ] Changer tous les secrets et mots de passe
- [ ] Configurer `AUTH_SECRET` avec une valeur aléatoire forte
- [ ] Activer HTTPS
- [ ] Configurer un reverse proxy (nginx)
- [ ] Mettre à jour les URLs dans Keycloak
- [ ] Activer les logs en production
- [ ] Configurer les backups PostgreSQL
- [ ] Restreindre les CORS aux domaines autorisés

### Build pour production

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de suivre ces étapes:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Projet de démonstration Keycloak + NestJS + Next.js

---

**Note**: Ce projet est destiné à des fins de démonstration et d'apprentissage. Pour un usage en production, assurez-vous de suivre toutes les bonnes pratiques de sécurité.