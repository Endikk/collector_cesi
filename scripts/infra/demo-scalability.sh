#!/bin/bash
# Demo script to show scalability
# Prerequisite: Minikube running, Metrics Server enabled, HPA configured

echo "🚀 Starting Scalability Demo..."

# 0. Validate Environment
if ! kubectl get deployment backend -n collector &> /dev/null; then
    echo "❌ Backend deployment not found!"
    exit 1
fi

# 1. Check current replicas
echo "📊 Initial State:"
kubectl get hpa -n collector
echo "Current Pods:"
kubectl get pods -n collector -l app=backend

# 2. Simulate Load (Inside Cluster)
echo "🔥 Simulating heavy load (CPU stress)..."
echo "Launching a temporary pod to generate traffic..."

# Run 'hey' inside the cluster to avoid local network/tool issues
kubectl run load-generator \
    --image=williamyeh/hey \
    --restart=Never \
    --rm -it \
    -- -z 2m -c 50 http://backend.collector.svc.cluster.local:4000/api/items

# 3. Watch HPA reaction (User should manually watch in another terminal or standard output)
echo "✅ Load test finished."
echo "👀 Check HPA status now: 'kubectl get hpa -n collector -w'"
