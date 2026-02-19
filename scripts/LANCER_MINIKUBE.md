# Lancer le projet avec Minikube (Kubernetes)

## Prérequis

| Outil | Lien |
| :--- | :--- |
| Docker Desktop | https://www.docker.com/products/docker-desktop/ |
| Minikube | https://minikube.sigs.k8s.io/docs/start/ |
| kubectl | https://kubernetes.io/docs/tasks/tools/ |
| Terraform | https://developer.hashicorp.com/terraform/install |

---

## 1. Démarrer le cluster

```bash
npm run infra:minikube
```

Ce script démarre Minikube, construit les images Docker, provisionne l'infrastructure avec Terraform et déploie tous les services Kubernetes.

---

## 2. Ouvrir un tunnel (terminal dédié)

Les services sont en mode **LoadBalancer**. Lance cette commande dans un terminal séparé et laisse-la tourner :

```bash
minikube tunnel
```

> ⚠️ Demande le mot de passe sudo. Doit rester actif pour que les URLs soient accessibles.

---

## 3. Accéder aux services

| Service | URL | Identifiants |
| :--- | :--- | :--- |
| **Frontend** | http://localhost:3000 | — |
| **Backend API** | http://localhost:4000 | — |
| **Prisma Studio** | http://localhost:5555 | — |
| **Prometheus** | http://localhost:9090 | — |
| **Grafana** | http://localhost:3002 | admin / admin |
| **PostgreSQL** | localhost:5432 | user / password / db: collector |
| **Redis** | localhost:6379 | — |

---

## Commandes utiles

```bash
# État de tous les pods
kubectl get pods -n collector

# Logs en temps réel
kubectl logs -f deployment/backend -n collector
kubectl logs -f deployment/frontend -n collector

# Redémarrer un service
kubectl rollout restart deployment/backend -n collector

# Arrêter Minikube
minikube stop

# Remise à zéro complète
minikube delete
```
