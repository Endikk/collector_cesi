# 📦 Collector

Bienvenue sur le dépôt officiel du projet **Collector**. 

**Collector** est une plateforme moderne permettant aux utilisateurs de gérer, vendre et échanger des objets de collection en toute simplicité. Conçue avec une architecture robuste et scalable, elle offre une expérience utilisateur fluide et sécurisée.

---

## 🛠️ Stack Technique

Ce projet repose sur une architecture moderne séparant le Frontend du Backend :

*   **Frontend** : [Next.js 16](https://nextjs.org/) (App Router, Server Components)
*   **Backend** : [NestJS](https://nestjs.com/) (API REST, Business Logic)
*   **Langage** : [TypeScript](https://www.typescriptlang.org/) (Fullstack)
*   **Base de Données** : [Prisma ORM](https://www.prisma.io/) (PostgreSQL) - Schéma unique centralisé dans le Backend
*   **Styling** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Authentification** : [NextAuth.js](https://next-auth.js.org/)
*   **DevOps** : Docker & Docker Compose

---

## 🚀 Guide d'Installation et de Lancement

Le projet est divisé en deux parties : la racine (Frontend) et le dossier `backend/` (API).

### Prérequis

*   Node.js 20+
*   Docker & Docker Compose (Recommandé pour la base de données et le backend)

### 1. Installation des dépendances

Il faut installer les paquets pour le Frontend **ET** le Backend.

**A la racine du projet (Frontend) :**
```bash
npm install
```

**Dans le dossier backend (API) :**
```bash
cd backend
npm install
cd ..
```

### 2. Configuration (Environment)

Créez un fichier `.env` à la racine (pour Next.js) et configurez les variables (voir `.env.example`).
Le Backend (NestJS) utilise également ce `.env` ou ses propres variables si besoin, mais pour Docker, tout est géré dans `docker-compose.yml`.

### 3. Base de Données

Le schéma Prisma est désormais centralisé dans **`backend/prisma/schema.prisma`**.

Pour lancer la base de données :
```bash
docker-compose up -d db
```

Pour synchroniser la base avec le schéma :
```bash
# Depuis la racine (commande proxy vers le schéma du backend)
npm run db:push
```

### 4. Lancer le projet

#### Option A : Tout avec Docker (Recommandé) ✨
Lance le Frontend (Next.js), le Backend (NestJS) et la Base de données en une seule commande.

```bash
docker-compose up -d --build
```
*   **Frontend** : http://localhost:3000
*   **Backend API** : http://localhost:4000
*   **Monitoring** : http://localhost:3001 (Grafana)

#### Option B : Manuel (Développement)
Si vous voulez lancer les services séparément pour développer :

**Terminal 1 - Backend (NestJS)** :
```bash
cd backend
npm run start:dev
```
*Le backend tournera sur http://localhost:3000 (mappé sur 4000 par défaut dans Docker, attention aux ports en local).*

**Terminal 2 - Frontend (Next.js)** :
```bash
# À la racine
npm run dev
```
*Le frontend tournera sur http://localhost:3000.*

---

## 🧪 Tests & Qualité

#### Tester tout le projet
```bash
npm run test
```

#### Vérifier le code (Lint)
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
.
├── backend/             # Application NestJS (API, Logique Métier)
│   ├── src/
│   │   ├── admin/       # Module Administration
│   │   ├── shops/       # Module Boutiques
│   │   ├── users/       # Module Utilisateurs
│   │   └── prisma/      # Service BDD & Schema Unique
│   └── Dockerfile
├── src/                 # Application Next.js (Frontend)
│   ├── app/             # Pages & Routes (App Router)
│   ├── components/      # UI (Shadcn, Layouts)
│   ├── lib/             # API Client & NextAuth
│   └── ...
├── docker-compose.yml   # Orchestration complète
└── README.md
```
