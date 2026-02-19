#!/bin/bash

# Arrêter en cas d'erreur
set -e

echo "🚀 Démarrage du setup Minikube..."

# 1. Démarrer Minikube si pas déjà en cours
if minikube status | grep -q "Running"; then
    echo "✅ Minikube est déjà en cours d'exécution."
else
    echo "☕ Démarrage de Minikube..."
    minikube start --driver=docker
fi

# 2. Pointer Docker vers le daemon Minikube
echo "🔄 Configuration de l'environnement Docker..."
eval $(minikube docker-env)

# 3. Construire les images dans Minikube (avec les bons targets pour K8s)
echo "🔨 Construction de l'image backend..."
docker build -t collector-backend:latest -f backend/Dockerfile.dev --target development ./backend

echo "🔨 Construction de l'image frontend (production)..."
docker build -t collector-frontend:latest -f frontend/Dockerfile --target runner .

# 4. Vérifier qu'on est bien à la racine du projet
if [ ! -f "package.json" ]; then
    echo "❌ Veuillez lancer ce script depuis la racine du projet !"
    exit 1
fi

# 5. Provisionner le namespace via Terraform
echo "🏗️ Provisionnement de l'infrastructure avec Terraform..."
cd infrastructure/terraform
terraform init -input=false
terraform apply -auto-approve
cd ../..

# 6. Déployer tous les manifestes Kubernetes
echo "📦 Déploiement des manifestes Kubernetes..."
kubectl apply -k infrastructure/k8s/base

# 7. Attendre que les déploiements soient prêts
echo "⏳ Attente que les déploiements soient prêts..."
kubectl rollout status deployment/frontend -n collector

# 8. Attendre que PostgreSQL soit prêt avant de lancer le backend
echo "🗄️  Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=Ready pod -l app=db -n collector --timeout=120s

# 9. Redémarrer le backend (évite le crash Prisma au premier démarrage à froid)
echo "🔄 Redémarrage du backend après initialisation de la base de données..."
kubectl rollout restart deployment/backend -n collector
kubectl rollout status deployment/backend -n collector --timeout=120s



echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌍 Lance minikube tunnel dans un terminal séparé, puis accède aux services :"
echo "   Frontend      → http://localhost:3000"
echo "   Backend API   → http://localhost:4000"
echo "   Prisma Studio → http://localhost:5555"
echo "   Prometheus    → http://localhost:9090"
echo "   Grafana       → http://localhost:3002 (admin / admin)"
