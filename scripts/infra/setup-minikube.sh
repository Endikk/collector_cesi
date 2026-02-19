#!/bin/bash

# Arrêter en cas d'erreur
set -e

echo "🚀 Démarrage du setup Minikube..."

# 0. Vérifier qu'on est bien à la racine du projet
if [ ! -f "package.json" ]; then
    echo "❌ Veuillez lancer ce script depuis la racine du projet !"
    exit 1
fi

# 1. Vérifier les prérequis
for cmd in minikube docker kubectl terraform; do
    if ! command -v $cmd &>/dev/null; then
        echo "❌ $cmd n'est pas installé. Veuillez l'installer avant de continuer."
        exit 1
    fi
done

# 2. Démarrer Minikube si pas déjà en cours
if minikube status 2>/dev/null | grep -q "Running"; then
    echo "✅ Minikube est déjà en cours d'exécution."
else
    echo "☕ Démarrage de Minikube..."
    minikube start --driver=docker --memory=4096 --cpus=2
fi

# 3. Activer les addons nécessaires
echo "🔧 Activation des addons Minikube..."
minikube addons enable metrics-server
minikube addons enable ingress

# 4. Pointer Docker vers le daemon Minikube
echo "🔄 Configuration de l'environnement Docker..."
eval $(minikube docker-env)

# 5. Construire les images dans Minikube
echo "🔨 Construction de l'image backend..."
docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend

echo "🔨 Construction de l'image frontend (production)..."
docker build -t collector-frontend:latest -f frontend/Dockerfile --target runner .

# 6. Provisionner le namespace via Terraform
echo "🏗️ Provisionnement de l'infrastructure avec Terraform..."
cd infrastructure/terraform
terraform init -input=false
terraform apply -auto-approve
cd ../..

# 7. Déployer tous les manifestes Kubernetes
echo "📦 Déploiement des manifestes Kubernetes..."
kubectl apply -k infrastructure/k8s/base

# 8. Attendre que PostgreSQL soit prêt
echo "🗄️  Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=Ready pod -l app=db -n collector --timeout=180s

# 9. Attendre que Redis soit prêt
echo "🗄️  Attente que Redis soit prêt..."
kubectl wait --for=condition=Ready pod -l app=redis -n collector --timeout=60s

# 10. Redémarrer le backend (évite le crash Prisma au premier démarrage à froid)
echo "🔄 Redémarrage du backend pour que Prisma se connecte à la DB..."
kubectl rollout restart deployment/backend -n collector
kubectl rollout status deployment/backend -n collector --timeout=180s

# 11. Attendre le frontend
echo "⏳ Attente que le frontend soit prêt..."
kubectl rollout status deployment/frontend -n collector --timeout=120s

# 12. Attendre Prometheus et Grafana
echo "📊 Attente que Prometheus et Grafana soient prêts..."
kubectl rollout status deployment/prometheus -n collector --timeout=60s
kubectl rollout status deployment/grafana -n collector --timeout=60s

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
kubectl get pods -n collector
echo ""
kubectl get svc -n collector
echo ""
kubectl get hpa -n collector
