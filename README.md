# Collector.shop

Plateforme marketplace moderne pour objets de collection avec architecture modulaire événementielle et système de sécurité avancé.

## Description

Collector.shop est une marketplace full-stack permettant aux collectionneurs d'acheter et vendre des objets de collection en toute sécurité. La plateforme offre un système de boutiques multiples, validation automatique des articles, détection de fraudes, et un système de paiement sécurisé via Stripe.

Le projet implémente une architecture modulaire basée sur les événements, facilitant l'ajout de nouvelles fonctionnalités et la maintenance du code. Il respecte les standards de sécurité modernes (PCI-DSS, RGPD) et d'accessibilité (WCAG 2.1 AA).

---

## Technologies

### Frontend
- **Framework**: Next.js 16 (App Router, Server Components, React 19)
- **Langage**: TypeScript 5
- **Styling**: Tailwind CSS 3 + Shadcn UI
- **Authentification**: NextAuth.js v5
- **Formulaires**: React Hook Form + Zod
- **HTTP Client**: Fetch API native
- **State Management**: React Context + Server State

### Backend
- **Framework**: NestJS 10
- **Langage**: TypeScript 5
- **API**: REST + Event-driven architecture
- **ORM**: Prisma 5
- **Validation**: class-validator + class-transformer
- **Sécurité**: Helmet, bcrypt, rate limiting

### Base de données
- **Database**: PostgreSQL 16
- **ORM**: Prisma (migrations, schema unique)
- **Cache**: Redis (sessions, rate limiting)

### Paiement & Infrastructure
- **Paiement**: Stripe API (v2026-01-28)
- **Containerisation**: Docker & Docker Compose
- **Orchestration**: Kubernetes (Minikube pour dev)
- **CI/CD**: GitHub Actions (à venir)

### Outils de développement
- **Linting**: ESLint (TypeScript Strict)
- **Testing**: Jest + React Testing Library
- **Git Hooks**: Husky (à venir)
- **Documentation**: Markdown + ASCII diagrams

---

## Architecture

Le projet suit une architecture modulaire et événementielle :

**Frontend (Next.js)**
- App Router avec Server Components
- API Routes pour les endpoints internes
- Middleware d'authentification
- Client API pour communication backend

**Backend (NestJS)**
- Architecture modulaire (Admin, Users, Shops, Items, Payment, etc.)
- Event Bus pour communication inter-modules
- Services de sécurité (Encryption, Audit, Sanitization, Brute-force)
- Prisma comme couche d'accès aux données

**Base de données**
- PostgreSQL comme base principale
- Redis pour cache et rate limiting
- Schéma Prisma centralisé dans `backend/prisma/`

Consulter la [documentation architecture complète](./docs/ARCHITECTURE_MODULAIRE.md) pour plus de détails.

---

## Fonctionnalités

### Marketplace
- Boutiques multiples par vendeur (particuliers et professionnels)
- Validation automatique des articles (photos, description, prix)
- Système de notation et d'avis utilisateurs
- Recherche et filtrage avancés
- Historique des prix pour transparence

### Sécurité et conformité
- Chiffrement AES-256-GCM pour données sensibles
- Protection contre les attaques par force brute (rate limiting 3 niveaux)
- Audit logging complet (RGPD, PCI-DSS, SOC2)
- Sanitization automatique des réponses API
- Headers de sécurité (CSP, HSTS, X-Frame-Options)
- Validation stricte des entrées utilisateur

### Paiement
- Intégration Stripe (PCI-DSS Level 1 compliant)
- Commission 5% sur transactions
- Webhooks pour synchronisation
- Historique et rapports de transactions

### Détection de fraudes
- Analyse automatique des changements de prix
- Détection d'anomalies et comportements suspects
- Alertes en temps réel
- Historique complet pour audit

### Modération
- Détection automatique d'informations personnelles
- Filtrage de contenu suspect
- Validation avant publication
- Système de signalement

### Notifications
- Notifications en temps réel
- Messagerie privée entre utilisateurs
- Emails transactionnels
- Préférences personnalisables

### Administration
- Tableau de bord avec métriques
- Gestion utilisateurs et articles
- Statistiques de validation
- Vue des transactions et commissions

---

## Prérequis

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** >= 24.x et Docker Compose >= 2.x (pour conteneurisation)
- **Kubernetes/Minikube** >= 1.28 (optionnel, pour déploiement K8s)
- **PostgreSQL** 16+ (si lancement sans Docker)
- **Redis** 7+ (si lancement sans Docker)

---

## Installation en local

### 1. Cloner le repository

```bash
git clone <repository-url>
cd collector
```

### 2. Installer les dépendances

**Frontend :**
```bash
npm install
```

**Backend :**
```bash
cd backend
npm install
cd ..
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Database
DATABASE_URL="postgresql://collector:collector123@localhost:5432/collector"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Créer un fichier `.env` dans le dossier `backend/` :

```env
DATABASE_URL="postgresql://collector:collector123@localhost:5432/collector"
STRIPE_SECRET_KEY="sk_test_..."
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-32-byte-encryption-key"
```

### 4. Lancer PostgreSQL

```bash
docker-compose up -d db
```

### 5. Synchroniser le schéma Prisma

```bash
npm run db:push
```

Optionnel - Seed initial :
```bash
cd backend
npx prisma db seed
cd ..
```

### 6. Lancer les applications

**Terminal 1 - Backend :**
```bash
cd backend
npm run start:dev
```
L'API sera disponible sur `http://localhost:4000`

**Terminal 2 - Frontend :**
```bash
npm run dev
```
L'application sera disponible sur `http://localhost:3000`

---

## Installation avec Docker

### Lancer tous les services

```bash
docker-compose up -d --build
```

Cette commande lance :
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend NestJS (port 4000)
- Frontend Next.js (port 3000)

### Accès aux services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter les services
docker-compose down

# Supprimer les volumes (reset complet)
docker-compose down -v

# Rebuild un service
docker-compose up -d --build backend
```

---

## Déploiement Kubernetes (Minikube)

### 1. Installation Minikube

**macOS :**
```bash
brew install minikube
minikube start --driver=docker
```

**Linux :**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
```

### 2. Configuration de l'environnement

```bash
# Utiliser le daemon Docker de Minikube
eval $(minikube docker-env)

# Construire les images dans Minikube
docker build -t collector-frontend:latest -f Dockerfile .
docker build -t collector-backend:latest -f backend/Dockerfile ./backend
```

### 3. Déploiement avec le script

```bash
./scripts/setup-minikube.sh
```

Ce script configure :
- Namespace `collector`
- PostgreSQL StatefulSet
- Redis Deployment
- Backend Deployment
- Frontend Deployment
- Services et Ingress

### 4. Accès à l'application

```bash
# Obtenir l'URL d'accès
minikube service frontend -n collector --url

# Ou utiliser le tunnel
minikube tunnel
```

L'application sera accessible sur l'IP du cluster Minikube.

### 5. Gestion du cluster

```bash
# Voir les pods
kubectl get pods -n collector

# Voir les logs
kubectl logs -f deployment/backend -n collector
kubectl logs -f deployment/frontend -n collector

# Redémarrer un deployment
kubectl rollout restart deployment/backend -n collector

# Supprimer le namespace
kubectl delete namespace collector

# Arrêter Minikube
minikube stop

# Supprimer le cluster
minikube delete
```

### Configuration avancée

Pour un environnement de production, modifier les fichiers dans `infrastructure/k8s/overlays/prod/` :
- Augmenter les ressources (CPU/RAM)
- Configurer les Persistent Volumes
- Ajouter les certificats TLS
- Configurer les variables d'environnement sensibles via Secrets

---

## Tests et qualité

### Lancer les tests

```bash
# Frontend
npm run test
npm run test:watch

# Backend
cd backend
npm run test
npm run test:watch
npm run test:e2e
cd ..
```

### Vérifier le code

```bash
# Linting frontend
npm run lint

# Linting backend
cd backend
npm run lint
cd ..

# Auto-fix
npm run lint -- --fix
```

### Build de production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
cd ..
```

### Audit de sécurité

```bash
npm audit
cd backend && npm audit
```

---

## Documentation

### Architecture et développement
- [Architecture Modulaire](./docs/ARCHITECTURE_MODULAIRE.md) - Guide complet (800+ lignes)
- [Quick Start Architecture](./docs/ARCHITECTURE_QUICKSTART.md) - Démarrage rapide
- [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAM.md) - Diagrammes ASCII
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Migrer vers Event Bus

### Sécurité
- [Security Guide](./docs/SECURITY.md) - Vue d'ensemble sécurité
- [Security Implementation](./docs/SECURITY_IMPLEMENTATION.md) - Services et checklist

### Fonctionnalités
- [Shops & Validation](./docs/SHOPS_AND_VALIDATION.md) - Boutiques et validation auto
- [Fraud Detection](./docs/FRAUD_DETECTION.md) - Analyse des prix et fraudes
- [i18n, a11y & Ads](./docs/I18N_A11Y_ADVERTISING.md) - Internationalisation et publicité

### Projet universitaire
- [Contribution Guide](./docs/university/docs/CONTRIBUTING.md) - Guide de contribution
- [Backlog](./docs/university/docs/BACKLOG.md) - Roadmap et features

---

## Structure du projet

```
collector/
├── backend/                    # Application NestJS (API REST)
│   ├── src/
│   │   ├── admin/             # Module administration
│   │   ├── auth/              # Authentification et guards
│   │   ├── users/             # Gestion utilisateurs
│   │   ├── shops/             # Boutiques multiples
│   │   ├── items/             # Articles à vendre
│   │   ├── payment/           # Intégration Stripe
│   │   ├── notifications/     # Système de notifications
│   │   ├── moderation/        # Modération de contenu
│   │   ├── fraud-detection/   # Détection de fraudes
│   │   ├── validation/        # Validation automatique
│   │   ├── common/            # Services partagés (event-bus, audit, etc.)
│   │   ├── features/          # Modules optionnels (auction, chatbot, etc.)
│   │   └── prisma/            # Prisma Service et migrations
│   ├── prisma/
│   │   └── schema.prisma      # Schéma de base de données unique
│   ├── Dockerfile
│   └── package.json
│
├── frontend/ (ou src/)        # Application Next.js
│   ├── app/                   # Pages et routes (App Router)
│   │   ├── admin/            # Interface admin
│   │   ├── auth/             # Pages d'authentification
│   │   ├── items/            # Listing et détails articles
│   │   ├── profile/          # Profil utilisateur
│   │   ├── shop/             # Pages boutique
│   │   └── api/              # API Routes Next.js
│   ├── components/
│   │   ├── common/           # Composants réutilisables
│   │   ├── layout/           # Layout et navigation
│   │   └── ui/               # Composants UI (Shadcn)
│   ├── lib/                  # Utilitaires et clients API
│   ├── hooks/                # React hooks personnalisés
│   └── types/                # Types TypeScript
│
├── infrastructure/            # Configuration Kubernetes
│   ├── k8s/
│   │   ├── base/             # Manifests Kubernetes base
│   │   └── overlays/         # Overlays pour environnements
│   └── terraform/            # Infrastructure as Code (optionnel)
│
├── docs/                      # Documentation complète
├── scripts/                   # Scripts utilitaires
├── docker-compose.yml         # Orchestration locale
└── README.md
```

---

## Statut et qualité du code

- **TypeScript**: Strict mode activé
- **ESLint**: Configuration stricte (98 problèmes résolus, 32 warnings restants)
- **Tests**: Couverture en cours d'implémentation
- **Build**: Frontend et Backend compilent sans erreurs
- **Sécurité**: npm audit 0 vulnérabilités
- **Documentation**: 5000+ lignes de documentation technique

---

## Licence

Ce projet est un projet universitaire développé dans le cadre de la formation à CESI.

---

## Contact et contribution

Pour toute question ou contribution, consulter le [guide de contribution](./docs/university/docs/CONTRIBUTING.md).

**Développé avec Next.js, NestJS, et TypeScript**
