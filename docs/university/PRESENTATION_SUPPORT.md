# Support de Présentation Orale - Projet Collector (Version Complète)
## Bloc : Superviser et Assurer le Développement

Ce document détaillé est conçu pour vous aider à construire un PowerPoint solide et à préparer votre discours. Il couvre le contexte, les choix techniques, la sécurité, la qualité, et anticipe les questions du jury.

---

## 🟢 1. Introduction & Contexte (3 min)

### Contenu des Slides
*   **Titre** : Industrialisation et Sécurisation d'une Plateforme E-commerce (Collector).
*   **Contexte Projet** :
    *   Application de rachat/vente de produits d'occasion (type "Momox" ou "BackMarket").
    *   Transition d'un prototype (POC) vers une architecture robuste, scalable et sécurisée.
    *   Environnement : Équipe Agile, DevOps, exigence de fiabilité.
*   **Enjeux Techniques** :
    *   **Sécurité** : Protéger les données sensibles (RGPD, transactions) et l'infrastructure.
    *   **Qualité** : Maintenir un code propre et testé pour faciliter les évolutions futures.
    *   **Performance** : Supporter une charge utilisateur croissante sans dégradation de service.

**Slide 2 : Adéquation Objectifs / Réalisations (Le "Contrat")**
*   **Ce qui était demandé (Entreprise)** :
    1.  *Sécuriser les accès* critiques (Admins).
    2.  *Protéger l'infrastructure* contre les abus (DDoS).
    3.  *Fiabiliser le code* pour le passage à l'échelle.
    4.  *Industrialiser* le monitoring.
*   **Ce que nous avons livré** :
    1.  ✅ **Authentification Forte** : 2FA (TOTP) + Chiffrement des secrets.
    2.  ✅ **Protection API** : Rate Limiting (Redis) + HTTPS Strict.
    3.  ✅ **Qualité Assurance** : Pipeline CI/CD complet + Coverage > 80%.
    4.  ✅ **Observabilité** : Logs structurés JSON + Health Check Endpoint.

### Script Suggéré
> "Bonjour à tous. Je vous présente aujourd'hui le projet Collector, une plateforme d'échange de produits d'occasion. Mon rôle principal dans ce projet a été **d'industrialiser le développement** et de **garantir la sécurité** de la plateforme. 
>
> Pour répondre aux exigences de l'entreprise, nous avons transformé le prototype initial en une solution robuste. Face à chaque demande critique — comme la sécurité des accès ou la fiabilité du code — nous avons apporté une réponse technique concrète, comme le 2FA ou le pipeline d'intégration continue, que je vais vous détailler."

---

## 🔵 2. Architecture & Choix Techniques (5 min)

### Contenu des Slides
*   **Schéma d'Architecture Logique** (À faire sur Draw.io/Lucidchart) :
    *   **Frontend** : Next.js 14 (React) -> Pour le SEO et l'UX (SSR/CSR).
    *   **Backend** : NestJS (Node.js) -> Pour l'architecture modulaire, l'injection de dépendance et le typage fort (TypeScript).
    *   **Base de Données** : PostgreSQL (avec Prisma ORM) -> Fiabilité et intégrité des données relationnelles.
    *   **Cache/Limit** : Redis -> Pour le Rate Limiting et le caching performant.
    *   **Infra** : Conteneurisation Docker pour la portabilité (Dev/Prod iso).

### Justification des Choix (Arguments pour l'oral)
*   *Pourquoi NestJS ?* : "Contrairement à Express qui est très libre, NestJS impose une structure (Modules, Services, Contrôleurs) qui facilite le travail en équipe et la maintenance sur le long terme."
*   *Pourquoi Prisma ?* : "L'approche Type-Safe évite de nombreuses erreurs SQL à l'exécution. Le schéma déclaratif sert de documentation vivante."
*   *Pourquoi une séparation Front/Back ?* : "Pour permettre de scaler indépendamment le front (trafic utilisateur) et le back (logique métier, tâches lourdes)."

---

## 🟠 3. Qualité Logicielle & CI/CD (5 min)

### Contenu des Slides
*   **Stratégie de Test** :
    *   Pyramide des tests : Focus sur les Tests Unitaires (Backend > 80% coverage) et Tests d'Intégration.
    *   Outils : Jest (Backend), Vitest (Frontend).
*   **Pipeline CI/CD (GitHub Actions)** :
    *   **Stage 1 : Qualité Code** -> ESLint, Prettier (Standardisation).
    *   **Stage 2 : Validation** -> Tests Unitaires, Build de vérification.
    *   **Stage 3 : Sécurité** -> Scan de vulnérabilités (`trivy`, `npm audit`).
*   **Qualité du Code** :
    *   Typage strict TypeScript.
    *   Logs structurés JSON (`JsonLoggerService`) pour l'observabilité.

### Script Suggéré
> "La qualité n'est pas une option. J'ai mis en place un pipeline d'intégration continue qui empêche physiquement de merger du code si les tests échouent ou si la couverture baisse. De plus, l'adoption de logs structurés en JSON permet d'anticiper l'intégration future avec des outils de monitoring comme ELK ou Datadog."

---

## 🔴 4. Sécurité & Performance (10 min - Cœur du sujet)

**Cette partie doit être appuyée par vos démos.**

### 4.1 Protection contre les attaques (Rate Limiting)
*   **Risque (OWASP)** : "Denial of Service" (DoS) et "Brute Force".
*   **Solution** : `ThrottlerGuard` couplé à Redis. Limitation stricte (ex: 10 req/min).
*   **DÉMO** : Lancer le Stress Test Artillery.
    *   Comm: `npm run stress-test:artillery`
    *   *Observation* : Le terminal affiche des erreurs 429 après les premières requêtes réussies.
    *   *Conclusion* : "Le système se protège automatiquement contre les abus."

### 4.2 Protection des Données & Accès (2FA & Chiffrement)
*   **Risque (OWASP)** : "Broken Access Control" et "Cryptographic Failures".
*   **Solution 1 (Accès)** : Double Authentification (2FA) via TOTP pour les admins.
*   **Solution 2 (Données)** : Chiffrement AES-256-GCM des secrets 2FA en base de données avant stockage.
*   **DÉMO (Optionnelle)** : Montrer le code du `EncryptionService` ou une entrée chiffrée en base.

### 4.3 Sécurisation des Communications (HTTPS)
*   **Risque (OWASP)** : "Man-in-the-Middle".
*   **Solution** : Chiffrement TLS de bout en bout.
*   **Implémentation** : Certificats générés localement (`openssl`), configuration NestJS pour servir en HTTPS strict.
*   **Vérification** : `curl -k https://localhost:4000/health`.

---

## 🟣 5. Supervision & Conclusion (2 min)

### Contenu des Slides
*   **Monitoring** :
    *   Endpoint `/health` exposé pour les Load Balancers / Orchestrateurs.
    *   Métriques clés : Uptime, Latence (mesurée via Artillery), Taux d'erreur.
*   **Bilan** :
    *   Objectifs atteints : Application sécurisée, testée et surveillée.
    *   Compétences validées : DevSecOps, Architecture NestJS, Tests de charge.
*   **Ouverture** :
    *   "Prochaine étape : Déploiement sur Kubernetes avec gestion automatique des certificats (Cert-Manager)."

---

## ❓ 6. Préparation aux Questions/Réponses (Anti-Sèche)

**Q: Pourquoi avoir chiffré le secret 2FA ? N'est-il pas déjà sécurisé ?**
> **R:** "C'est une défense en profondeur. Si un attaquant vole la base de données (SQL Dump), il ne pourra pas générer de codes 2FA pour usurper les admins, car il n'a pas la clé de déchiffrement (qui est dans les variables d'environnement, stockées ailleurs)."

**Q: Pourquoi des certificats auto-signés ?**
> **R:** "C'est pour l'environnement de développement local. En production, nous utiliserions une autorité de certification réelle (comme Let's Encrypt). L'important ici est de valider que l'architecture supporte le HTTPS et de former les développeurs à ne pas utiliser HTTP en clair."

**Q: Quel est l'impact du Rate Limiting sur les utilisateurs légitimes ?**
> **R:** "C'est un compromis. La limite actuelle (10 req/min) est basse pour la démo, mais en production, elle serait ajustée par profil utilisateur (plus élevée pour les clients connectés, plus basse pour les IP anonymes)."

**Q: Pourquoi Artillery plutôt qu'un simple script curl ?**
> **R:** "Artillery permet de simuler un comportement utilisateur réaliste (scénarios, délais, nombre d'utilisateurs virtuels simultanés) et fournit des métriques précises (latence p95, rps) indispensables pour valider la scalabilité."

---

## 🛠️ Checklist Démos pour le Jour J

1.  **Terminal 1 (Backend)** :
    *   Lancer : `npm run start:dev --workspace=backend`
    *   *Vérifier* : Logs JSON qui défilent, mention "HTTPS enabled".
2.  **Terminal 2 (Démos)** :
    *   Prêt à lancer : `npm run stress-test:artillery`.
3.  **Navigateur** :
    *   Onglet 1 : `https://localhost:4000/health` (Accepter le certificat à l'avance !).
    *   Onglet 2 : Swagger si disponible, ou Frontend.
4.  **Documents** :
    *   Avoir ce fichier `PRESENTATION_SUPPORT.md` sous les yeux (sur un 2ème écran ou imprimé).
