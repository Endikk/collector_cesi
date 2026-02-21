#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Setup Minikube — Collector
#  Déploie l'ensemble de l'infrastructure sur Minikube
#
#  Usage :
#    bash scripts/infra/setup-minikube.sh          # Déploiement standard
#    bash scripts/infra/setup-minikube.sh --reset   # Reset DB + redéploiement complet
#    bash scripts/infra/setup-minikube.sh --rebuild  # Force rebuild des images Docker
# ═══════════════════════════════════════════════════════════

set -e

# ── Couleurs et helpers ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

step() { echo ""; echo "${BLUE}${BOLD}── $1 ──${NC}"; }
ok()   { echo "${GREEN}✅ $1${NC}"; }
warn() { echo "${YELLOW}⚠️  $1${NC}"; }
fail() { echo "${RED}❌ $1${NC}"; exit 1; }

TIMER_START=$(date +%s)

# ── Flags ──
RESET_DB=false
FORCE_REBUILD=false
for arg in "$@"; do
  case $arg in
    --reset)  RESET_DB=true ;;
    --rebuild) FORCE_REBUILD=true ;;
  esac
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🚀 Démarrage du setup Minikube — Collector"
echo "════════════════════════════════════════════════════════"
echo ""

# ── 0. Vérifier qu'on est à la racine du projet ──
if [ ! -f "package.json" ]; then
    fail "Veuillez lancer ce script depuis la racine du projet !"
fi

# ── 1. Vérifier les prérequis ──
step "1/10 — Vérification des prérequis"
MISSING=""
for cmd in minikube docker kubectl terraform; do
    if ! command -v "$cmd" &>/dev/null; then
        MISSING="$MISSING $cmd"
    fi
done
if [ -n "$MISSING" ]; then
    fail "Outil(s) manquant(s) :$MISSING — Installez-les avant de continuer."
fi
# Vérifier que Docker Desktop est lancé
if ! docker info &>/dev/null; then
    fail "Docker Desktop n'est pas lancé. Démarrez-le puis relancez ce script."
fi
ok "Tous les prérequis sont installés."

# ── 2. Démarrer Minikube ──
step "2/10 — Démarrage de Minikube"
if minikube status 2>/dev/null | grep -q "Running"; then
    ok "Minikube est déjà en cours d'exécution."
else
    echo "☕ Démarrage de Minikube..."
    if minikube profile list 2>/dev/null | grep -q "minikube"; then
        minikube start
    else
        minikube start --driver=docker --memory=4096 --cpus=2
    fi
fi

# ── 3. Activer les addons nécessaires ──
step "3/10 — Activation des addons Minikube"
minikube addons enable metrics-server 2>/dev/null || true
minikube addons enable ingress 2>/dev/null || true
ok "Addons metrics-server et ingress activés."

# ── 4. Pointer Docker vers le daemon Minikube ──
step "4/10 — Configuration Docker → Minikube"
eval $(minikube docker-env)
ok "Docker pointe vers le daemon Minikube."

# ── 5. Construire les images dans Minikube ──
step "5/10 — Construction des images Docker"
BACKEND_EXISTS=$(docker images -q collector-backend:latest 2>/dev/null)
FRONTEND_EXISTS=$(docker images -q collector-frontend:latest 2>/dev/null)

if [ "$FORCE_REBUILD" = true ] || [ -z "$BACKEND_EXISTS" ]; then
    echo "🔨 Construction de l'image backend..."
    docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend
    ok "Image backend construite."
else
    ok "Image backend déjà présente (--rebuild pour forcer)."
fi

if [ "$FORCE_REBUILD" = true ] || [ -z "$FRONTEND_EXISTS" ]; then
    echo "🔨 Construction de l'image frontend..."
    docker build -t collector-frontend:latest -f frontend/Dockerfile --target runner .
    ok "Image frontend construite."
else
    ok "Image frontend déjà présente (--rebuild pour forcer)."
fi

# ── 6. Provisionner le namespace via Terraform ──
step "6/10 — Provisionnement Terraform"
cd infrastructure/terraform
if [ -f "terraform.tfstate" ] && ! terraform validate &>/dev/null; then
    warn "État Terraform corrompu, réinitialisation..."
    rm -rf .terraform* terraform.tfstate*
fi
terraform init -input=false -upgrade > /dev/null 2>&1
terraform apply -auto-approve > /dev/null 2>&1
cd ../..
ok "Namespace 'collector' provisionné via Terraform."

# ── 7. Déployer les manifestes Kubernetes ──
step "7/10 — Déploiement des manifestes K8s"
kubectl apply -k infrastructure/k8s/base 2>&1 | grep -v "unchanged" || true
ok "Manifestes K8s appliqués."

# ── Nettoyage des anciens ReplicaSets ──
for deploy in backend frontend grafana prometheus redis; do
    RS_LIST=$(kubectl get rs -n collector -l app="$deploy" --sort-by='.metadata.creationTimestamp' -o name 2>/dev/null)
    RS_COUNT=$(echo "$RS_LIST" | grep -c . 2>/dev/null || echo 0)
    if [ "$RS_COUNT" -gt 1 ]; then
        OLD_RS=$(echo "$RS_LIST" | sed '$d')
        echo "$OLD_RS" | xargs kubectl delete -n collector 2>/dev/null || true
    fi
done

# ── 8. Attendre les dépendances (DB + Redis) ──
step "8/10 — Attente des services de données"
echo "🗄️  Attente de PostgreSQL..."
kubectl wait --for=condition=Ready pod -l app=db -n collector --timeout=180s
ok "PostgreSQL prêt."

echo "🗄️  Attente de Redis..."
kubectl wait --for=condition=Ready pod -l app=redis -n collector --timeout=60s
ok "Redis prêt."

# ── Reset DB si demandé ──
if [ "$RESET_DB" = true ]; then
    warn "Reset de la base de données (--reset)..."
    DB_USER=$(kubectl exec -n collector db-0 -- printenv POSTGRES_USER 2>/dev/null || echo "user")
    kubectl exec -n collector db-0 -- psql -U "$DB_USER" -d collector -c \
      "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"$DB_USER\";" 2>/dev/null
    ok "Base de données réinitialisée."
fi

# ── 9. Redémarrer le backend ──
step "9/10 — Démarrage du backend"
kubectl rollout restart deployment/backend -n collector

# Attente intelligente : on poll /health directement au lieu de rollout status
echo "⏳ Attente que le backend soit opérationnel (migration + seed + NestJS)..."
BACKEND_READY=false
for i in $(seq 1 60); do
    # Vérifier si le nouveau pod est en Running
    NEW_PODS=$(kubectl get pods -n collector -l app=backend --sort-by='.metadata.creationTimestamp' -o jsonpath='{.items[-1].status.phase}' 2>/dev/null)
    if [ "$NEW_PODS" = "Running" ]; then
        # Tester /health depuis l'intérieur du pod
        HEALTH=$(kubectl exec -n collector deployment/backend -- \
            node -e "const h=require('http');h.get('http://localhost:3000/health',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log(r.statusCode);process.exit(r.statusCode===200?0:1)})}).on('error',()=>process.exit(1))" 2>/dev/null)
        if [ "$HEALTH" = "200" ]; then
            BACKEND_READY=true
            break
        fi
    fi
    printf "\r   ⏳ Attente... %ds / 300s" $((i * 5))
    sleep 5
done
echo ""

if [ "$BACKEND_READY" = true ]; then
    ok "Backend opérationnel — /health → 200 OK"
else
    warn "Le backend n'a pas encore répondu 200. Vérifiez avec : kubectl logs -n collector deployment/backend"
fi

# ── 10. Attendre les autres services ──
step "10/10 — Vérification des services restants"
echo "⏳ Frontend..."
kubectl rollout status deployment/frontend -n collector --timeout=120s 2>/dev/null && ok "Frontend prêt." || warn "Frontend en cours de démarrage."
echo "📊 Prometheus + Grafana..."
kubectl rollout status deployment/prometheus -n collector --timeout=60s 2>/dev/null && ok "Prometheus prêt." || warn "Prometheus en cours."
kubectl rollout status deployment/grafana -n collector --timeout=60s 2>/dev/null && ok "Grafana prêt." || warn "Grafana en cours."

# ── Résumé final ──
TIMER_END=$(date +%s)
DURATION=$((TIMER_END - TIMER_START))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Déploiement terminé en ${MINUTES}m${SECONDS}s !"
echo "════════════════════════════════════════════════════════"
echo ""

# Tableau de bord
echo "📊 ${BOLD}État du cluster :${NC}"
echo ""
kubectl get pods -n collector -o custom-columns=\
"NOM:metadata.name,STATUS:status.phase,READY:status.containerStatuses[0].ready,RESTARTS:status.containerStatuses[0].restartCount,AGE:metadata.creationTimestamp" 2>/dev/null || kubectl get pods -n collector
echo ""
kubectl get hpa -n collector 2>/dev/null
echo ""
kubectl get secrets -n collector 2>/dev/null
echo ""

echo "════════════════════════════════════════════════════════"
echo "  📎 ${BOLD}Accès aux services :${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Ouvrir dans des terminaux séparés :"
echo "    ${GREEN}minikube service frontend -n collector${NC}   → Collector.shop"
echo "    ${GREEN}minikube service backend -n collector${NC}    → API /health /metrics"
echo "    ${GREEN}minikube service grafana -n collector${NC}    → Dashboards (admin/admin)"
echo ""
echo "  ⚡ Commandes rapides :"
echo "    ${YELLOW}npm run infra:demo${NC}                        → Test de scalabilité"
echo "    ${YELLOW}bash scripts/test/run-coverage.sh${NC}          → Couverture de code"
echo "    ${YELLOW}kubectl get pods -n collector -w${NC}           → Surveiller les pods"
echo ""
