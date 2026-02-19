# Lancer le projet avec Docker Compose

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Fichier `.env` présent à la racine du projet (voir `.env.example`)

---

## Démarrage

```bash
# 1. Cloner le dépôt (si pas déjà fait)
git clone https://github.com/Endikk/collector.git
cd collector

# 2. Lancer tous les services (build + démarrage en arrière-plan)
docker compose up -d --build
```

> Le backend attend automatiquement que **PostgreSQL** et **Redis** soient prêts avant de démarrer (healthchecks + scripts d'attente intégrés).

---

## Vérifier que tout tourne

```bash
docker compose ps
```

Tous les conteneurs doivent être en état **Up (healthy)** :

| Conteneur              | Rôle                           |
| :--------------------- | :----------------------------- |
| `collector-frontend`   | Application Next.js            |
| `collector-backend`    | API NestJS                     |
| `collector-db`         | Base de données PostgreSQL     |
| `collector-redis`      | Cache et files d'attente Redis |
| `collector-prometheus` | Collecte des métriques         |
| `collector-grafana`    | Tableaux de bord monitoring    |

---

## Accès aux services

| Service         | URL                                                  | Identifiants      |
| :-------------- | :--------------------------------------------------- | :----------------- |
| **Frontend**    | [https://localhost:3000](https://localhost:3000)        | —                  |
| **Backend API** | [https://localhost:4000](https://localhost:4000)        | —                  |
| **Prisma Studio** | [http://localhost:5555](http://localhost:5555)      | —                  |
| **Prometheus**  | [http://localhost:9090](http://localhost:9090)        | —                  |
| **Grafana**     | [http://localhost:3002](http://localhost:3002)        | admin / admin      |
| **PostgreSQL**  | `localhost:5432`                                     | voir `.env`        |
| **Redis**       | `localhost:6379`                                     | —                  |

### Dashboards Grafana

Deux tableaux de bord sont provisionnés automatiquement :

- **Collector — Développeur** : métriques HTTP, latence, CPU, mémoire, Event Loop, handles
- **Collector — Gestionnaire** : KPIs métier (disponibilité SLA, trafic, taux d'erreurs)

---

## Commandes utiles

```bash
# Voir les logs en temps réel (tous les services)
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend

# Redémarrer un service
docker compose restart backend

# Reconstruire un seul service après modification
docker compose up -d --build backend

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (remise à zéro complète)
docker compose down -v
```

---

## Dépannage

| Problème | Solution |
| :--- | :--- |
| Le backend redémarre en boucle | Vérifier que Redis est healthy : `docker compose logs redis` |
| Grafana affiche "No data" | Attendre ~30s que Prometheus scrape le backend. Vérifier la target sur http://localhost:9090/targets |
| Erreur Prisma / DB | Relancer : `docker compose restart backend` |
| Port déjà utilisé | Arrêter le service local qui utilise le port, ou modifier le mapping dans `docker-compose.yml` |
