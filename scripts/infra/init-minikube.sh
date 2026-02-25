#!/bin/bash
# =============================================================================
#  init-minikube.sh — Lifecycle Minikube pour Collector
#
#  Rôle : démarrer et configurer le cluster Minikube local.
#  Terraform, images et déploiement K8s sont gérés par le Makefile et Skaffold.
# =============================================================================

set -euo pipefail

# Couleurs avec syntaxe $'...' (interprétées par bash, pas par echo)
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
BOLD=$'\033[1m'
NC=$'\033[0m'

step() { printf "\n%s── %s ──%s\n" "${BLUE}${BOLD}" "$1" "${NC}"; }
ok()   { printf "%s✅ %s%s\n" "${GREEN}" "$1" "${NC}"; }
warn() { printf "%s⚠️  %s%s\n" "${YELLOW}" "$1" "${NC}"; }
fail() { printf "%s❌ %s%s\n" "${RED}" "$1" "${NC}"; exit 1; }

printf "\n════════════════════════════════════════════════════════\n"
printf "  🔧 Init Minikube — Collector\n"
printf "════════════════════════════════════════════════════════\n"

# ── 1. Prérequis ──
step "1/3 — Vérification des prérequis"
MISSING=""
for cmd in minikube docker kubectl terraform; do
    command -v "$cmd" &>/dev/null || MISSING="$MISSING $cmd"
done
[ -n "$MISSING" ] && fail "Outil(s) manquant(s) :$MISSING"
docker info &>/dev/null || fail "Docker Desktop n'est pas lancé. Démarrez-le puis relancez."
ok "Prérequis OK."

# ── 2. Démarrer Minikube ──
step "2/3 — Démarrage de Minikube"

# Si apiserver ET kubelet sont Running → on garde tel quel.
# Dans TOUS les autres cas (arrêté, partiel, container manquant) → delete propre + start.
MINIKUBE_STATUS=$(minikube status 2>/dev/null || true)

if echo "$MINIKUBE_STATUS" | grep -q "apiserver: Running" && \
   echo "$MINIKUBE_STATUS" | grep -q "kubelet: Running"; then
    ok "Minikube déjà Running."
else
    warn "Minikube non disponible → nettoyage et démarrage propre..."
    minikube delete 2>/dev/null || true
    printf "☕ Démarrage (docker driver, 4Go RAM, 2 CPU)...\n"
    minikube start --driver=docker --memory=4096 --cpus=2
fi

# ── Attendre l'API server ──
printf "⏳ Attente de l'API server K8s (max 120s)...\n"
for i in $(seq 1 120); do
    if kubectl cluster-info 2>/dev/null | grep -q "is running"; then
        printf "\n"
        ok "API server prêt."
        break
    fi
    printf "\r   ⏳ %ds / 120s" "$i"
    [ "$i" -eq 120 ] && { printf "\n"; fail "API server non disponible après 120s."; }
    sleep 1
done

# ── 3. Addons ──
step "3/3 — Activation des addons"

enable_addon() {
    local addon=$1
    printf "   → %-20s" "$addon"
    if minikube addons list 2>/dev/null | grep -E "[[:space:]]${addon}[[:space:]]" | grep -q "enabled"; then
        printf "déjà actif ✓\n"
        return 0
    fi
    timeout 60 minikube addons enable "$addon" > /dev/null 2>&1 \
        && printf "activé ✓\n" \
        || printf "(timeout — actif au prochain démarrage)\n"
}

# storage-provisioner et default-storageclass sont requis pour les PVC (postgres, prometheus)
enable_addon storage-provisioner
enable_addon default-storageclass
enable_addon metrics-server
enable_addon ingress
ok "Addons configurés."

printf "\n════════════════════════════════════════════════════════\n"
printf "  ✅ Minikube prêt.\n"
printf "════════════════════════════════════════════════════════\n\n"
