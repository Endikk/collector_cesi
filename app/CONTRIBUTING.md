# Guide de Contribution - Projet Collector

Bienvenue sur le projet **Collector** ! Ce document vise à faciliter la montée en compétences des nouveaux développeurs rejoignant l'équipe.

## 🛠️ Stack Technique
Le projet utilise la **T3 Stack** (version allégée) :
- **Framework** : [Next.js 14+](https://nextjs.org/docs) (App Router, Server Components)
- **Langage** : TypeScript
- **Base de données** : SQLite (Dev) / PostgreSQL (Prod) avec [Prisma ORM](https://www.prisma.io/)
- **Styling** : Tailwind CSS + Shadcn UI
- **Tests** : Vitest + React Testing Library

## 🚀 Démarrage Rapide

### Pré-requis
- Node.js 20+
- Docker (optionnel, pour la base de données en prod)

### Installation
```bash
# Installer les dépendances
npm install

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

## 📐 Architecture du Projet
- `app/` : Pages et API (Next.js App Router)
  - `api/` : Endpoints API REST
  - `(auth)/` : Pages liées à l'authentification
- `components/` : Composants Réutilisables (Design System)
- `lib/` : Utilitaires (Prisma client, Logger, etc.)
- `prisma/` : Schéma de base de données

## ✅ Qualité & Tests
Nous suivons une démarche **Qualité** stricte :

1. **Linter** : Toujours exécuter `npm run lint` avant de commit.
2. **Tests** : 
   - Unitaires/Intégration : `npm test`
   - Le code coverage doit être maintenu > 80% sur les modules critiques.
3. **Logs** : Utilisez le logger `lib/logger.ts` pour toute action critique (pas de console.log).

## 🔒 Sécurité (DevSecOps)
- Ne jamais commiter de secrets (.env).
- Toujours valider les entrées API (Zod recommandé).
- Vérifier les vulnérabilités : `npm audit`.

## 🔄 Flux de Travail (Git)
1. Créez une branche `feature/ma-feature`
2. Développez et testez
3. Ouvrez une Pull Request pour revue
