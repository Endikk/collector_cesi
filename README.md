# Collector.shop

Une plateforme marketplace moderne et sécurisée pour les collectionneurs.

![CI Status](https://img.shields.io/badge/build-passing-brightgreen)
![Security](https://img.shields.io/badge/security-impeccable-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## 📋 Table des Matières

1. [À propos du projet](#à-propos-du-projet)
2. [Stack Technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Démarrage Rapide (Docker)](#démarrage-rapide-docker)
5. [Déploiement Kubernetes (Minikube)](#déploiement-kubernetes-minikube)
6. [Développement Local](#développement-local)
7. [Tests & Qualité](#tests--qualité)
8. [Documentation](#documentation)
9. [Licence](#licence)

---

## À propos du projet

Collector.shop est une marketplace full-stack permettant l'achat et la vente sécurisés d'objets de collection. Elle repose sur une architecture modulaire, une communication événementielle et une couche de sécurité avancée (Shift Left Security).

**Fonctionnalités Clés :**
*   Boutiques multi-vendeurs
*   Détection de fraude en temps réel
*   Paiements sécurisés via Stripe
*   Validation automatique des articles
*   Architecture orientée événements (Event Bus)

---

## Stack Technique

Le projet s'appuie sur une stack moderne et robuste :

| Composant | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js |
| **Backend** | NestJS 10, TypeScript, Prisma ORM, Event Bus |
| **Base de Données** | PostgreSQL 16, Redis 7 |
| **Infrastructure** | Docker, Kubernetes, NGINX Ingress |
| **DevOps** | GitHub Actions, Trivy, ESLint, Jest, Playwright |

---

## Prérequis

Assurez-vous d'avoir installé :

*   **Docker** & **Docker Compose**
*   **Node.js** (v20+) & **npm** (pour le dev local)
*   **Minikube** (optionnel, pour déploiement K8s)

---

## Démarrage Rapide (Docker)

La méthode la plus simple pour lancer le projet.

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/username/collector.git
    cd collector
    ```

2.  **Lancer les services**
    ```bash
    docker-compose up -d --build
    ```

3.  **Accéder à l'application**
    *   Frontend : [http://localhost:3000](http://localhost:3000)
    *   API Backend : [http://localhost:4000](http://localhost:4000)
    *   Base de données (Postgres) : `localhost:5432`

4.  **Arrêter les services**
    ```bash
    docker-compose down
    ```

---

## Déploiement Kubernetes (Minikube)

Déployer l'application dans un cluster Kubernetes local.

### 1. Démarrer Minikube
```bash
minikube start --driver=docker
eval $(minikube docker-env)
```

### 2. Construire les images
```bash
docker build -t collector-frontend:latest -f Dockerfile .
docker build -t collector-backend:latest -f backend/Dockerfile ./backend
```

### 3. Déployer
```bash
# Déployer tous les manifestes
kubectl apply -k infrastructure/k8s/base

# Ou utiliser le script d'installation via npm
npm run infra:minikube
```

### 4. Accéder
```bash
minikube tunnel
# Accès via IP externe ou localhost selon votre OS
```

---

## Développement Local

Pour les développeurs souhaitant lancer les services individuellement.

### Global
```bash
npm install        # Installer toutes les dépendances (root, backend, frontend)
npm run dev        # Démarrer Backend + Frontend en parallèle
npm run db:sync    # Synchroniser le client Prisma entre backend et root
```

### Backend (via Workspace)
```bash
npm run start:dev --workspace=backend
```

### Frontend (via Workspace)
```bash
npm run dev --workspace=frontend
```

*Note : Nécessite une instance PostgreSQL/Redis active (utilisez `docker-compose up -d db redis`).*

---

## Tests & Qualité

Nous appliquons des standards de qualité élevés.

**Lancer les Tests Unitaires**
```bash
npm run test:backend  # Tests Backend
npm run test:frontend # Tests Frontend
```

**Lancer le Linter**
```bash
npm run lint
```

**Audit de Sécurité**
```bash
npm audit
```

---

## Documentation

Une documentation complète est disponible dans le dossier `docs/` :

*   [**Vue d'ensemble Architecture**](./docs/ARCHITECTURE_MODULAIRE.md) - Détails des modules et événements.
*   [**Stratégie de Sécurité**](./docs/SECURITY.md) - Implémentations et bonnes pratiques.
*   [**Assurance Qualité**](./docs/STRATEGY_QUALITY_SKILLS.md) - Métriques QA et processus.
*   [**Documentation API**](./docs/api/README.md) - Endpoints et utilisation.

---

## Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

---

**Développé pour Projet École d'Ingénieurs CESI**
