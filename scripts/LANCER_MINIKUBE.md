# Lancer le projet avec Minikube (Kubernetes)

> **C'est la méthode utilisée pour la soutenance.**

---

## Lancement en 3 commandes

```bash
# 1. Se placer à la racine
cd /Users/lucaslabonde/Documents/Développement/collector

# 2. Tout lancer (5-10 min ☕)
bash scripts/infra/setup-minikube.sh

# 3. Ouvrir les services (3 terminaux séparés, ne pas les fermer)
minikube service frontend -n collector    # → Collector.shop
minikube service backend -n collector     # → API /health /metrics
minikube service grafana -n collector     # → Dashboards (admin/admin)
```

C'est tout. Le script `setup-minikube.sh` fait **tout automatiquement** :
- Vérifie Docker, Minikube, kubectl, Terraform
- Démarre Minikube (ou reprend le cluster existant)
- Active metrics-server + ingress
- Build les images Docker (skip si déjà en cache)
- Terraform → namespace `collector`
- kubectl apply → 6 pods + HPA + secrets
- Attend PostgreSQL + Redis
- Redémarre le backend, attend `/health → 200`
- Vérifie frontend, Prometheus, Grafana

---

## Options du script de setup

```bash
# Standard (réutilise les images existantes)
bash scripts/infra/setup-minikube.sh

# Reset la DB (migration cassée, données corrompues)
bash scripts/infra/setup-minikube.sh --reset

# Force rebuild des images Docker (après modif de code)
bash scripts/infra/setup-minikube.sh --rebuild

# Nucléaire (tout supprimer et recommencer)
minikube delete && bash scripts/infra/setup-minikube.sh --rebuild
```

---

## Vérification rapide

```bash
# État des pods + HPA en une commande
kubectl get pods -n collector && echo "---" && kubectl get hpa -n collector

# Résultat attendu :
#   backend-xxx       1/1  Running   0
#   frontend-xxx      1/1  Running   0
#   db-0              1/1  Running   0
#   redis-xxx         1/1  Running   0
#   prometheus-xxx    1/1  Running   0
#   grafana-xxx       1/1  Running   0
#   ---
#   backend-hpa   cpu XX%/50%   1
#   frontend-hpa  cpu XX%/60%   1
```

---

## Accès aux services

| Service          | Commande                                | Identifiants  |
| :--------------- | :-------------------------------------- | :------------ |
| **Frontend**     | `minikube service frontend -n collector`| —             |
| **Backend API**  | `minikube service backend -n collector` | —             |
| **Grafana**      | `minikube service grafana -n collector` | admin / admin |

> Chaque commande ouvre le navigateur et crée un tunnel. **Ne pas fermer le terminal.**
> Grafana : Login → skip changement mdp → Dashboards → "Développeur" + "Gestionnaire"

---

## Démonstration de scalabilité (HPA)

```bash
# Lancer pendant la démo (slide 5)
npm run infra:demo
# ou : bash scripts/infra/demo-scalability.sh

# Observer en temps réel
kubectl get hpa -n collector --watch
# → REPLICAS passent de 1 → 2 → 3 → jusqu'à 5 max
```

---

## Tests et couverture

```bash
# Lint + build + tests (tout en une commande)
cd backend && npm run lint 2>&1 | tail -3 && npm run build 2>&1 | tail -3 && npm test 2>&1 | tail -5 && cd ../frontend && npm test 2>&1 | tail -5 && cd ..

# Couverture de code
bash scripts/test/run-coverage.sh 2>&1 | tail -15
# → Backend ~35%, Frontend 90%
```

---

## Pipeline CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) : push/PR → 5 jobs automatiques

```
backend-quality ──┐
                  ├── security-and-build ── deploy-simulation
frontend-quality ──┘                  │
dependency-audit ─────────────────────┘
```

| Job                  | Description                                              |
| :------------------- | :------------------------------------------------------- |
| **Backend Quality**  | Lint + 194 tests + E2E (avec Postgres + Redis) + Build   |
| **Frontend Quality** | Lint + 7 tests + Build Next.js                           |
| **Dependency Audit** | `npm audit` sur root, backend, frontend                  |
| **Security & Build** | Docker Build + Trivy scan (CRITICAL/HIGH)                |
| **Deploy Simulation**| Terraform validate + kubectl dry-run                     |

---

## Commandes utiles

```bash
# Logs backend en temps réel
kubectl logs -f deployment/backend -n collector

# Redémarrer un service
kubectl rollout restart deployment/backend -n collector

# Reconstruire et redéployer le backend
eval $(minikube docker-env)
docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend
kubectl rollout restart deployment/backend -n collector

# Arrêter Minikube (données conservées)
minikube stop

# Redémarrer Minikube (tout reprend)
minikube start
```

---

## Dépannage

| Problème | Solution |
| :--- | :--- |
| Backend CrashLoopBackOff | `kubectl logs deployment/backend -n collector` → lire l'erreur. Le script gère automatiquement P3009/P3018. Sinon : `bash scripts/infra/setup-minikube.sh --reset` |
| Frontend "Table does not exist" | Redémarrer les deux : `kubectl rollout restart deployment/backend deployment/frontend -n collector` |
| Grafana "No data" | Vérifier http://localhost:9090/targets. Si backend DOWN → restart pod |
| Erreur Terraform | `cd infrastructure/terraform && rm -rf .terraform* terraform.tfstate*` puis relancer |
| Images pas à jour | `bash scripts/infra/setup-minikube.sh --rebuild` |
| Minikube planté | `minikube delete && bash scripts/infra/setup-minikube.sh --rebuild` |
