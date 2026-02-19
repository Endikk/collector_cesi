#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Demo Scalabilité — Collector
#  Pré-requis : Minikube running, Metrics Server activé, HPA configuré
# ═══════════════════════════════════════════════════════════

set -e

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🚀 Démonstration de Scalabilité — Collector"
echo "════════════════════════════════════════════════════════"
echo ""

# 0. Vérifier l'environnement
if ! kubectl get deployment backend -n collector &>/dev/null; then
    echo "❌ Le déploiement backend n'a pas été trouvé dans le namespace collector !"
    echo "   Lancez d'abord : npm run infra:minikube"
    exit 1
fi

if ! kubectl get hpa backend-hpa -n collector &>/dev/null; then
    echo "❌ Le HPA n'est pas configuré !"
    exit 1
fi

# Vérifier que le metrics-server est actif
if ! minikube addons list 2>/dev/null | grep -q "metrics-server.*enabled"; then
    echo "⚠️ metrics-server n'est pas activé. Activation en cours..."
    minikube addons enable metrics-server
    echo "⏳ Attente de 30s que le metrics-server démarre..."
    sleep 30
fi

# 1. État initial
echo "╔════════════════════════════════════════╗"
echo "║  📊 ÉTAT INITIAL                       ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "--- HPA ---"
kubectl get hpa -n collector
echo ""
echo "--- Pods Backend ---"
kubectl get pods -n collector -l app=backend -o wide
echo ""

# 2. Lancer le test de charge
echo "╔════════════════════════════════════════╗"
echo "║  🔥 LANCEMENT DU TEST DE CHARGE       ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Test : 50 connexions concurrentes pendant 2 minutes"
echo "Cible : http://backend:4000/health"
echo ""

# Nettoyer un éventuel pod résiduel
kubectl delete pod load-generator -n collector --ignore-not-found=true 2>/dev/null

# Lancer le test de charge en arrière-plan
kubectl run load-generator \
    --image=williamyeh/hey \
    --restart=Never \
    --namespace=collector \
    --rm -i \
    -- -z 2m -c 50 http://backend.collector.svc.cluster.local:4000/health &

LOAD_PID=$!

# 3. Surveiller le HPA pendant le test
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  👀 SURVEILLANCE DU SCALING            ║"
echo "╚════════════════════════════════════════╝"
echo ""

for i in $(seq 1 8); do
    echo ""
    echo "--- [$(date +%H:%M:%S)] Vérification ${i}/8 (toutes les 15s) ---"
    kubectl get hpa -n collector 2>/dev/null || true
    echo ""
    kubectl get pods -n collector -l app=backend --no-headers 2>/dev/null | \
        awk '{printf "  Pod: %-40s Status: %-10s\n", $1, $3}'
    
    REPLICAS=$(kubectl get deployment backend -n collector -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "?")
    echo "  → Replicas actives : ${REPLICAS}"
    
    if [ "$i" -lt 8 ]; then
        sleep 15
    fi
done

# Attendre la fin du test de charge
wait $LOAD_PID 2>/dev/null || true

# 4. État final
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  📊 ÉTAT APRÈS TEST DE CHARGE          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "--- HPA ---"
kubectl get hpa -n collector
echo ""
echo "--- Pods Backend ---"
kubectl get pods -n collector -l app=backend -o wide
echo ""

echo "════════════════════════════════════════════════════════"
echo "  ✅ Démonstration terminée !"
echo ""
echo "  Le HPA va progressivement réduire les replicas"
echo "  (stabilisation ~2min après la fin de la charge)"
echo ""
echo "  Pour surveiller en continu :"
echo "    kubectl get hpa -n collector -w"
echo "════════════════════════════════════════════════════════"
