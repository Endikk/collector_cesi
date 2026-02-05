#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Minikube Setup..."

# 1. Start Minikube if not running
if minikube status | grep -q "Running"; then
    echo "✅ Minikube is already running."
else
    echo "☕ Starting Minikube..."
    minikube start --driver=docker
fi

# 2. Configure Docker environment to use Minikube's daemon
echo "🔄 Configuring Docker environment..."
eval $(minikube docker-env)

# 3. Build images inside Minikube
echo "🔨 Building Docker images (this may take a while)..."
docker-compose build

# 4. Apply Infrastructure via Terraform
echo "🏗️ Provisioning infrastructure with Terraform..."
cd infrastructure/terraform
terraform init
terraform apply -auto-approve
cd ../..

echo "⏳ Waiting for deployments to be ready..."
kubectl rollout status deployment/collector-backend -n collector
kubectl rollout status deployment/collector-frontend -n collector

echo "✅ Deployment Complete!"
echo "🌍 To access the application, run the following command in your terminal:"
echo "   minikube service frontend-service -n collector"
