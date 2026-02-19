#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Setup Minikube — Collector
#  Déploie l'ensemble de l'infrastructure sur Minikube
# ═══════════════════════════════════════════════════════════

set -e

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🚀 Démarrage du setup Minikube — Collector"
echo "════════════════════════════════════════════════════════"
echo ""

# ── 0. Vérifier qu'on est à la racine du projet ──
if [ ! -f "package.json" ]; then
    echo "❌ Veuillez lancer ce script depuis la racine du projet !"
    exit 1
fi

# ── 1. Vérifier les prérequis ──
echo "🔎 Vérification des prérequis..."
MISSING=""
for cmd in minikube docker kubectl terraform; do
    if ! command -v "$cmd" &>/dev/null; then
        MISSING="$MISSING $cmd"
    fi
done
if [ -n "$MISSING" ]; then
    echo "❌ Outil(s) manquant(s) :$MISSING"
    echo "   Installez-les avant de continuer."
    exit 1
fi
echo "✅ Tous les prérequis sont installés."

# ── 2. Démarrer Minikube ──
if minikube status 2>/dev/null | grep -q "Running"; then
    echo "✅ Minikube est déjà en cours d'exécution."
else
    echo "☕ Démarrage de Minikube..."
    # Si un profil existe déjà, on le démarre tel quel (évite l'erreur de mémoire)
    if minikube profile list 2>/dev/null | grep -q "minikube"; then
        minikube start
    else
        minikube start --driver=docker --memory=4096 --cpus=2
    fi
fi

# ── 3. Activer les addons nécessaires ──
echo "🔧 Activation des addons Minikube..."
minikube addons enable metrics-server 2>/dev/null || true
minikube addons enable ingress 2>/dev/null || true

# ── 4. Pointer Docker vers le daemon Minikube ──
echo "🔄 Configuration de l'environnement Docker..."
eval $(minikube docker-env)

# ── 5. Construire les images dans Minikube ──
echo ""
echo "🔨 Construction de l'image backend..."
docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend

echo ""
echo "🔨 Construction de l'image frontend..."
docker build -t collector-frontend:latest -f frontend/Dockerfile --target runner .

# ── 6. Provisionner le namespace via Terraform ──
echo ""
echo "🏗️  Provisionnement de l'infrastructure avec Terraform..."
cd infrastructure/terraform

# Nettoyer un éventuel état corrompu
if [ -f "terraform.tfstate" ] && ! terraform validate &>/dev/null; then
    echo "⚠️  État Terraform corrompu, réinitialisation..."
    rm -rf .terraform* terraform.tfstate*
fi

terraform init -input=false -upgrade
terraform apply -auto-approve
cd ../..

# ── 7. Déployer les manifestes Kubernetes ──
echo ""
echo "📦 Déploiement des manifestes Kubernetes..."
kubectl apply -k infrastructure/k8s/base

# ── 8. Nettoyer les anciens ReplicaSets ──
echo "🧹 Nettoyage des anciens ReplicaSets..."
for deploy in backend frontend grafana prometheus redis; do
    OLD_RS=$(kubectl get rs -n collector -l app="$deploy" --sort-by='.metadata.creationTimestamp' -o name 2>/dev/null | head -n -1)
    if [ -n "$OLD_RS" ]; then
        echo "$OLD_RS" | xargs -r kubectl delete -n collector 2>/dev/null || true
    fi
done

# ── 9. Attendre PostgreSQL ──
echo ""
echo "🗄️  Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=Ready pod -l app=db -n collector --timeout=180s

# ── 10. Attendre Redis ──
echo "🗄️  Attente que Redis soit prêt..."
kubectl wait --for=condition=Ready pod -l app=redis -n collector --timeout=60s

# ── 11. Redémarrer le backend pour qu'il boot avec la DB prête ──
echo ""
echo "🔄 Redémarrage du backend..."
kubectl rollout restart deployment/backend -n collector
kubectl rollout status deployment/backend -n collector --timeout=180s

# ── 12. Attendre le frontend ──
echo "⏳ Attente que le frontend soit prêt..."
kubectl rollout status deployment/frontend -n collector --timeout=120s

# ── 13. Attendre Prometheus et Grafana ──
echo "📊 Attente que Prometheus et Grafana soient prêts..."
kubectl rollout status deployment/prometheus -n collector --timeout=60s
kubectl rollout status deployment/grafana -n collector --timeout=60s

# ── 14. Résumé final ──
echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Déploiement terminé avec succès !"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌍 Lance dans un terminal séparé :"
echo "   minikube tunnel"
echo ""
echo "📎 Puis accède aux services :"
echo "   Frontend      → http://localhost:3000"
echo "   Backend API   → http://localhost:4000"
echo "   Prisma Studio → http://localhost:5555"
echo "   Prometheus    → http://localhost:9090"
echo "   Grafana       → http://localhost:3002 (admin / admin)"
echo ""
echo "📊 État actuel du cluster :"
echo ""
kubectl get pods -n collector
echo ""
kubectl get svc -n collector
echo ""
kubectl get hpa -n collector
