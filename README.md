# 📦 Projet Collector

Bienvenue sur le dépôt officiel du projet **Collector**. 
Ce projet a été réalisé dans le cadre de la validation du bloc de compétences **"Superviser et assurer le développement des applications logicielles"**.

Il démontre la mise en œuvre d'une architecture moderne, sécurisée et industrialisée (DevSecOps).

---

## 📑 Documents de Référence

*   **[Rapport Complet (PROJECT_REPORT.md)](./PROJECT_REPORT.md)** : Documentation détaillée du processus qualité, sécurité et architecture. **Document principal pour l'évaluation.**
*   **[Backlog (BACKLOG.md)](./BACKLOG.md)** : Suivi des User Stories et fonctionnalités.
*   **[Présentation (PRESENTATION_SUPPORT.md)](./PRESENTATION_SUPPORT.md)** : Support pour la soutenance orale (Script & Schémas).
*   **[Guide Contribution (app/CONTRIBUTING.md)](./app/CONTRIBUTING.md)** : Guide pour l'accueil des développeurs.

---

## 🛠️ Architecture Technique (T3 Stack)

Le POC est construit sur une stack robuste et typée :

*   **Framework** : [Next.js 14](https://nextjs.org/) (App Router, Server Components)
*   **Langage** : TypeScript
*   **Base de Données** : Prisma ORM (SQLite en dev / Postgres compatible prod)
*   **UI/UX** : Tailwind CSS + Shadcn UI + Magic UI (Animations)
*   **Sécurité** : NextAuth.js + Validation Zod + Logs JSON
*   **DevOps** : Docker + GitHub Actions (CI/CD)

---

## 🚀 Guide de Démarrage

### 1. Installation

```bash
# Aller dans le dossier du code source
cd app

# Installer les dépendances
npm install

# Initialiser la base de données locale
npx prisma generate
npx prisma db push
```

### 2. Lancer l'application

```bash
# Mode développement
npm run dev
```
Accédez à l'application sur **[http://localhost:3000](http://localhost:3000)**.

---

## ✅ Évaluation & Démonstration

Voici les commandes pour vérifier les critères techniques de l'évaluation :

### 1. Tests Automatisés (Qualité)
Lancer la suite de tests unitaires et intégration (Vitest) :
```bash
npm test
```
*Couvre : Composants UI, Sécurité des routes, Logique métier.*

### 2. Audit de Sécurité (DevSecOps)
Vérifier les vulnérabilités des dépendances :
```bash
npm audit
```

### 3. Test de Montée en Charge (Performance)
Simuler 50 utilisateurs simultanés pour la démonstration de "Disponibilité" :
```bash
# Dans un nouveau terminal, pendant que le serveur tourne
node stress-test.js
```

### 4. Supervision (Ops)
Un endpoint de **Health Check** est disponible pour le monitoring :
*   URL : [http://localhost:3000/api/health](http://localhost:3000/api/health)
*   Retourne : Statut de l'application et connexion BDD.

---

## 📂 Structure du Répertoire

```
.
├── PROJECT_REPORT.md       # Rapport Qualité/Sécurité/Archi
├── PRESENTATION_SUPPORT.md # Script soutenance
├── app/                    # Code Source (Next.js)
│   ├── app/                # Pages & API Routes
│   ├── components/         # Bibliothèque de composants
│   ├── lib/                # Utilitaires (Logger, Prisma)
│   ├── prisma/             # Schéma BDD
│   ├── __tests__/          # Tests d'intégration
│   ├── stress-test.js      # Script de charge
│   ├── Dockerfile          # Configuration conteneur
│   └── CONTRIBUTING.md     # Guide développeur
└── ...
```

---
*Projet réalisé le 20/01/2026.*
