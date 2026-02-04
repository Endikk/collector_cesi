# 📦 Collector

Bienvenue sur le dépôt officiel du projet **Collector**. 

**Collector** est une plateforme moderne permettant aux utilisateurs de gérer, vendre et échanger des objets de collection en toute simplicité. Conçue avec une architecture robuste et scalable, elle offre une expérience utilisateur fluide et sécurisée.

---

## 🛠️ Stack Technique

Ce projet repose sur une architecture moderne et performante (T3 Stack / Next.js) :

*   **Framework** : [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   **Langage** : [TypeScript](https://www.typescriptlang.org/)
*   **Base de Données** : [Prisma ORM](https://www.prisma.io/) (MySQL / PostgreSQL)
*   **Styling** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Authentification** : [NextAuth.js](https://next-auth.js.org/)
*   **State Management** : [Zustand](https://zustand-demo.pmnd.rs/)
*   **Validation** : [Zod](https://zod.dev/)
*   **DevOps** : Docker & Docker Compose
*   **Tests** : Vitest

---

## 🚀 Guide d'Installation et de Lancement

Suivez ces étapes pour lancer le projet localement.

### Prérequis

*   Node.js 20+ (recommandé)
*   NPM ou PNPM
*   Docker (optionnel, pour l'environnement complet de monitoring)

### 1. Installation des dépendances

Clonez le projet et installez les paquets nécessaires :

```bash
# Installer les dépendances
npm install
```

### 2. Configuration de l'environnement

Assurez-vous d'avoir un fichier `.env` à la racine correctement configuré (notamment pour la base de données et NextAuth).

Exemple structuré :
```env
DATABASE_URL="mysql://user:password@localhost:3306/collector"
NEXTAUTH_SECRET="votre_secret_super_securise"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Base de Données

Initialisez la base de données avec Prisma :

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push
```

### 4. Lancer le projet

Vous avez plusieurs options pour démarrer l'application.

#### Mode Développement

Pour lancer le serveur de développement avec rechargement à chaud (HMR) :

```bash
npm run dev
```
L'application sera accessible sur **[http://localhost:3000](http://localhost:3000)**.

#### Tests

Pour exécuter la suite de tests (unitaires et intégration) :

```bash
npm run test
```

#### Linting & Qualité

Pour vérifier la qualité du code :

```bash
npm run lint
```

---

## 🐳 Lancement avec Docker (Stack complète)

Si vous souhaitez lancer l'application ainsi que toute la stack de monitoring (Prometheus, Grafana, cAdvisor) sans configuration node locale :

```bash
# Construire et lancer les conteneurs en arrière-plan
docker-compose up -d --build
```

Services disponibles :
*   **Application Collector** : [http://localhost:3000](http://localhost:3000)
*   **Grafana** : [http://localhost:3001](http://localhost:3001)
*   **Prometheus** : [http://localhost:9090](http://localhost:9090)

---

## 📂 Structure du Projet

Le projet suit une architecture scalable et modulaire :

```
src/
├── app/                 # Routes Next.js (App Router)
├── components/          # Composants React (UI, Layout, Pages, Common)
├── lib/                 # Logique métier et adaptateurs (Prisma, Auth, Logger)
├── lib/actions/         # Server Actions (API logic)
├── hooks/               # Hooks React personnalisés
├── stores/              # Gestion d'état global (Zustand)
├── utils/               # Fonctions utilitaires
└── middleware.ts        # Middleware (Authentification)
```
