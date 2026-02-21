# Lancer le projet avec Docker Compose

> **Pour la soutenance, utiliser Minikube** (voir `LANCER_MINIKUBE.md`).
> Docker Compose est une alternative pour le développement local uniquement.

---

## Lancement rapide (copier-coller)

```bash
# 1. Se placer à la racine du projet
cd /Users/lucaslabonde/Documents/Développement/collector

# 2. Lancer tout (build + démarrage)
docker compose up -d --build

# 3. Vérifier que tout tourne (6 conteneurs Up healthy)
docker compose ps
```

> Le backend attend automatiquement PostgreSQL et Redis avant de démarrer.
> Les migrations Prisma et le seed s'exécutent automatiquement.
> En cas d'erreur de migration (P3009/P3018), le script reset la DB et relance.

---

## Accès aux services

| Service           | URL                    | Identifiants  |
| :---------------- | :--------------------- | :------------ |
| **Frontend**      | https://localhost:3000  | —             |
| **Backend API**   | https://localhost:4000  | —             |
| **Prisma Studio** | http://localhost:5555   | —             |
| **Prometheus**    | http://localhost:9090   | —             |
| **Grafana**       | http://localhost:3002   | admin / admin |

> Grafana : 2 dashboards provisionnés automatiquement ("Développeur" + "Gestionnaire")

---

## Commandes utiles

```bash
# Logs en temps réel
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Reconstruire après modification de code
docker compose up -d --build backend

# Tout arrêter
docker compose down

# Remise à zéro complète (supprime les volumes = DB vidée)
docker compose down -v
```

---

## Dépannage

| Problème                   | Solution                                                       |
| :------------------------- | :------------------------------------------------------------- |
| Backend redémarre en boucle | `docker compose logs backend` → lire l'erreur                 |
| Grafana "No data"          | Attendre ~30s, vérifier http://localhost:9090/targets           |
| Migration cassée           | `docker compose down -v && docker compose up -d --build`       |
| Port déjà utilisé          | Arrêter le service local ou modifier le port dans `docker-compose.yml` |
