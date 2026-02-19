# Lancer le projet avec Minikube (Kubernetes)

## Prérequis

| Outil | Installation |
| :--- | :--- |
| Docker Desktop | https://www.docker.com/products/docker-desktop/ |
| Minikube | https://minikube.sigs.k8s.io/docs/start/ |
| kubectl | https://kubernetes.io/docs/tasks/tools/ |
| Terraform | https://developer.hashicorp.com/terraform/install |

> Vérifier que tout est installé : `minikube version && kubectl version --client && terraform version`

---

## 1. Démarrer le cluster

```bash
npm run infra:minikube
```

Ce script effectue automatiquement :

1. Démarre Minikube (Docker driver, 4 Go RAM, 2 CPUs)
2. Active les addons **metrics-server** et **ingress**
3. Construit les images Docker (backend + frontend) dans Minikube
4. Provisionne le namespace `collector` via **Terraform**
5. Déploie tous les manifestes K8s (PostgreSQL, Redis, Backend, Frontend, Prometheus, Grafana, HPA)
6. Attend que tous les pods soient prêts (DB → Redis → Backend → Frontend → Monitoring)

> Le backend attend automatiquement que **PostgreSQL** et **Redis** soient prêts avant de lancer NestJS (scripts d'attente intégrés).

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
| **Frontend** | [https://localhost:3000](https://localhost:3000) | — |
| **Backend API** | [https://localhost:4000](https://localhost:4000) | — |
| **Prisma Studio** | [http://localhost:5555](http://localhost:5555) | — |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | — |
| **Grafana** | [http://localhost:3002](http://localhost:3002) | admin / admin |
| **PostgreSQL** | localhost:5432 | user / password / db: collector |
| **Redis** | localhost:6379 | — |

### Dashboards Grafana

Deux tableaux de bord sont provisionnés automatiquement :

- **Collector — Développeur** : métriques HTTP, latence, CPU, mémoire, Event Loop, handles
- **Collector — Gestionnaire** : KPIs métier (disponibilité SLA, trafic, taux d'erreurs)

> Les panels stat affichent **0** au lieu de "No data" quand aucun trafic n'est encore passé.

---

## 4. Démonstration de scalabilité (HPA)

```bash
npm run infra:demo
```

Ce script montre la montée en charge automatique (HPA) :
- Génère du trafic artificiel sur le backend
- Affiche en temps réel le nombre de réplicas qui augmente
- Montre le retour à la normale après arrêt du trafic

---

## Commandes utiles

```bash
# État de tous les pods
kubectl get pods -n collector

# État des services (vérifier les EXTERNAL-IP)
kubectl get svc -n collector

# État du HPA (scaling automatique)
kubectl get hpa -n collector

# Logs en temps réel
kubectl logs -f deployment/backend -n collector
kubectl logs -f deployment/frontend -n collector

# Redémarrer un service
kubectl rollout restart deployment/backend -n collector

# Reconstruire et redéployer le backend
eval $(minikube docker-env)
docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend
kubectl rollout restart deployment/backend -n collector

# Vérifier les targets Prometheus
# Ouvrir http://localhost:9090/targets dans le navigateur

# Arrêter Minikube (les données sont conservées)
minikube stop

# Redémarrer Minikube (tout reprend)
minikube start

# Remise à zéro complète
minikube delete
```

---

## Dépannage

| Problème | Solution |
| :--- | :--- |
| Backend 0/1 (CrashLoopBackOff) | Vérifier que Redis est prêt : `kubectl logs deployment/backend -n collector`. Redémarrer : `kubectl rollout restart deployment/backend -n collector` |
| Grafana affiche "No data" | Vérifier la target sur Prometheus (http://localhost:9090/targets). Si le backend est DOWN, redémarrer le pod backend |
| `minikube tunnel` ne fonctionne pas | Vérifier que Minikube tourne : `minikube status`. Relancer le tunnel |
| Erreur Terraform | Supprimer l'état : `cd infrastructure/terraform && rm -rf .terraform* terraform.tfstate*` puis relancer `npm run infra:minikube` |
| Images pas à jour après modif | Reconstruire : `eval $(minikube docker-env) && docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend` |
| Pods bloqués en Pending | Vérifier les ressources : `kubectl describe pod <nom> -n collector` |
