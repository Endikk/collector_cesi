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

1. Vérifie les prérequis (`minikube`, `docker`, `kubectl`, `terraform`)
2. Démarre Minikube (Docker driver, 4 Go RAM, 2 CPUs) — ou reprend un cluster existant
3. Active les addons **metrics-server** et **ingress**
4. Construit les images Docker (backend + frontend) dans Minikube
5. Provisionne le namespace `collector` via **Terraform**
6. Déploie tous les manifestes K8s (PostgreSQL, Redis, Backend, Frontend, Prometheus, Grafana, HPA)
7. Nettoie les anciens ReplicaSets
8. Attend que tous les pods soient prêts (DB → Redis → Backend → Frontend → Monitoring)

> Le backend gère automatiquement :
> - L'attente de **PostgreSQL** et **Redis** avant de démarrer
> - La **résolution automatique** des migrations Prisma échouées (P3009)
> - Le **seed** de la base de données

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
| **Frontend** | [http://localhost:3000](http://localhost:3000) | — |
| **Backend API** | [http://localhost:4000](http://localhost:4000) | — |
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
- Génère du trafic artificiel sur le backend (50 connexions concurrentes, 2 minutes)
- Affiche en temps réel le nombre de réplicas qui augmente (1 → 5 max)
- Montre le retour à la normale après arrêt du trafic

---

## 5. Pipeline CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute sur chaque push/PR :

```
backend-quality ──┐
                  ├── security-and-build ──┐
frontend-quality ──┘                       ├── deploy-simulation
                                           │
dependency-audit ──────────────────────────┘
```

| Étape | Description |
| :--- | :--- |
| **Backend Quality** | Lint + Tests unitaires + Tests E2E (avec PostgreSQL + Redis) + Build |
| **Frontend Quality** | Lint + Tests unitaires + Build Next.js |
| **Dependency Audit** | `npm audit` sur root, backend et frontend |
| **Security & Build** | Build Docker + Scan Trivy (vulnérabilités CRITICAL/HIGH) |
| **Deploy Simulation** | Simulation Terraform + K8s (production ou recette) |

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
| Backend CrashLoopBackOff | Vérifier les logs : `kubectl logs deployment/backend -n collector`. Le script de démarrage résout automatiquement les migrations échouées (P3009). Si le problème persiste : `kubectl rollout restart deployment/backend -n collector` |
| Frontend "Table does not exist" | Le backend doit avoir appliqué les migrations avant. Redémarrer les deux : `kubectl rollout restart deployment/backend deployment/frontend -n collector` |
| Grafana affiche "No data" | Vérifier la target sur Prometheus (http://localhost:9090/targets). Si le backend est DOWN, redémarrer le pod backend |
| `minikube tunnel` ne fonctionne pas | Vérifier que Minikube tourne : `minikube status`. Relancer le tunnel |
| Erreur "cannot change memory size" | Normal si Minikube existe déjà. Le script gère ce cas automatiquement |
| Erreur Terraform | Supprimer l'état : `cd infrastructure/terraform && rm -rf .terraform* terraform.tfstate*` puis relancer `npm run infra:minikube` |
| Images pas à jour après modif | Reconstruire : `eval $(minikube docker-env) && docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend` |
| Pods bloqués en Pending | Vérifier les ressources : `kubectl describe pod <nom> -n collector` |
