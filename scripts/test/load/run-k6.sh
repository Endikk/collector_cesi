#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Wrapper pour exécuter K6 via Docker
# ═══════════════════════════════════════════════════════════

set -e

SCENARIO=$1

if [ -z "$SCENARIO" ]; then
    echo "Usage: ./run-k6.sh [load-test|stress-test|spike-test]"
    exit 1
fi

# Le script est lancé depuis la racine (npm run test:k6:...)
SCRIPT_PATH="scripts/test/load/scenarios/${SCENARIO}.js"
TARGET_URL=${BASE_URL:-http://host.docker.internal:4000}

# Pour Mac/Windows, host.docker.internal pointe vers le localhost du l'hôte
# ce qui permet de taper sur Minikube s'il est exposé via `minikube tunnel`.
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Sous linux, on utilise l'IP locale ou host network
    TARGET_URL=${BASE_URL:-http://172.17.0.1:4000}
fi

echo "🚀 Lancement du scénario : $SCENARIO"
echo "🌐 Cible : $TARGET_URL"

# On lance K6 via l'image officielle. Le script JS est passé via stdin.
docker run --rm -i \
    -e BASE_URL="$TARGET_URL" \
    grafana/k6 run - < "$SCRIPT_PATH"
