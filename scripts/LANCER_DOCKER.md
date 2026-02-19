# Lancer le projet avec Docker Compose

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Fichier `.env` présent à la racine du projet

---

## Démarrage

```bash
# 1. Cloner le dépôt (si pas déjà fait)
git clone https://github.com/Endikk/collector.git
cd collector

# 2. Lancer tous les services (build + démarrage en arrière-plan)
docker compose up -d --build
```

## Vérifier que tout tourne

```bash
docker compose ps
```

Tous les conteneurs (`frontend`, `backend`, `db`, `redis`, `prometheus`) doivent être en état **Up**.

## Accès à l'application

| Service    | URL                   |
| :--------- | :-------------------- |
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:4000 |
| PostgreSQL | `localhost:5432`      |
| Redis      | `localhost:6379`      |
| Prometheus | http://localhost:9090 |

## Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (remise à zéro complète)
docker compose down -v
```
