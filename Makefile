.PHONY: run dev reset stop ports logs help \
        certs local docker docker-down hosts tunnel \
        _minikube _namespace _images _db-reset _forward _kill-ports _k8s-tls

# =============================================================================
#  Collector — Commandes de développement
#
#  ── 4 modes d'exécution ──────────────────────────────────────────────────────
#  make local        → Local npm (HTTPS : localhost:3000 / localhost:4000)
#  make docker       → Docker Compose (HTTPS : localhost:3000 / localhost:4000)
#  make run          → Minikube/K8s  (HTTPS : https://collector.local via ingress)
#  make dev          → Minikube hot-reload backend (.ts)
#
#  ── Utilitaires ──────────────────────────────────────────────────────────────
#  make certs        → Génère les certificats TLS auto-signés (openssl)
#  make hosts        → Ajoute collector.local dans /etc/hosts (sudo)
#  make reset        → Reset DB + redéploiement Minikube + port-forward
#  make ports        → (Re)ouvre les port-forwards Minikube si fermés
#  make docker-down  → Arrête Docker Compose
#  make stop         → Libère les ports + supprime namespace K8s + arrête Minikube
#  make logs         → Logs en temps réel du namespace collector
#
#  Note : Terraform cible GCP (CI/CD production).
#         Le namespace local est créé directement via kubectl.
# =============================================================================

# Ports exposés localement
PORTS := 3000 4000 3002 9090 5432 6379

# Images tiers à charger dans Minikube (évite la rate-limit Docker Hub)
IMAGES := \
	node:20-alpine \
	redis:7-alpine \
	postgres:15-alpine \
	prom/prometheus:latest \
	grafana/grafana:latest \
	grafana/loki:2.9.4 \
	grafana/promtail:2.9.4

# -----------------------------------------------------------------------------
# Modes d'exécution
# -----------------------------------------------------------------------------

## Lance le projet en local avec npm (HTTPS)
local: certs
	@echo ""; echo "── Démarrage local (npm) ──"
	@echo "   Frontend → https://localhost:3000"
	@echo "   Backend  → https://localhost:4000"
	@echo "   Swagger  → https://localhost:4000/api/docs"
	@echo ""
	npm run dev

## Lance le projet avec Docker Compose (HTTPS via certs montés en volume)
docker: certs
	@echo ""; echo "── Démarrage Docker Compose (HTTPS) ──"
	docker compose up --build

## Arrête Docker Compose et supprime les conteneurs
docker-down:
	docker compose down

## Génère les certificats TLS auto-signés (frontend/secrets/ + backend/secrets/)
certs:
	@bash scripts/infra/gen-certs.sh

## Configure /etc/hosts pour collector.local → 127.0.0.1 (à faire UNE SEULE FOIS)
hosts:
	@echo "── Configuration /etc/hosts ──"
	@if grep -q "127.0.0.1 collector.local" /etc/hosts 2>/dev/null; then \
		echo "✅ collector.local déjà configuré (127.0.0.1) — rien à faire."; \
	else \
		sudo sed -i '' '/collector\.local/d' /etc/hosts 2>/dev/null || \
			sudo sed -i '/collector\.local/d' /etc/hosts 2>/dev/null || true; \
		echo "127.0.0.1 collector.local" | sudo tee -a /etc/hosts > /dev/null; \
		echo "✅ /etc/hosts configuré : 127.0.0.1 collector.local"; \
		echo "   (permanent — vous n'aurez plus besoin de relancer cette commande)"; \
	fi

## Lance minikube tunnel en avant-plan (requis pour https://collector.local)
##   → À garder ouvert dans un terminal pendant toute la session de dev
tunnel:
	@echo "── minikube tunnel (Ctrl+C pour arrêter) ──"
	@echo "   Laissez ce terminal ouvert → https://collector.local sera accessible"
	minikube tunnel

# -----------------------------------------------------------------------------
# Commandes Minikube/K8s (publiques)
# -----------------------------------------------------------------------------

## Build + deploy complet sur Minikube + port-forward (HTTPS via ingress)
run: _minikube _namespace _images _k8s-tls
	skaffold run --cache-artifacts=false
	@$(MAKE) --no-print-directory _forward

## Mode hot-reload backend (.ts) sur Minikube
dev: _minikube _namespace _images _kill-ports
	skaffold dev -p dev --cache-artifacts=false

## Reset DB + redéploiement + port-forward
reset: _minikube _namespace _images _k8s-tls _db-reset
	skaffold run --cache-artifacts=false
	@$(MAKE) --no-print-directory _forward

## (Re)ouvre les port-forwards Minikube sans redéployer
ports: _forward

## Libère les ports + supprime namespace K8s + arrête Minikube
stop: _kill-ports
	@echo "── Suppression des ressources K8s ──"
	-kubectl delete namespace collector --ignore-not-found
	@echo "── Arrêt de Minikube ──"
	minikube stop

## Logs en temps réel du namespace collector
logs:
	kubectl logs -n collector -l app --all-containers --follow --max-log-requests=10

## Affiche l'aide
help:
	@echo ""
	@echo "  Collector — Modes d'exécution"
	@echo "  ════════════════════════════════════════════════════"
	@echo ""
	@echo "  make local        → npm run dev   (HTTPS localhost)"
	@echo "  make docker       → Docker Compose (HTTPS localhost)"
	@echo "  make run          → Minikube/K8s  (HTTPS collector.local)"
	@echo "  make dev          → Minikube hot-reload (.ts backend)"
	@echo ""
	@echo "  make certs        → Génère les certificats TLS"
	@echo "  make hosts        → Ajoute collector.local dans /etc/hosts"
	@echo "  make reset        → Reset DB + redéploiement Minikube"
	@echo "  make ports        → (Re)ouvre les port-forwards Minikube"
	@echo "  make docker-down  → Arrête Docker Compose"
	@echo "  make stop         → Arrêt propre Minikube"
	@echo "  make logs         → Logs Minikube en temps réel"
	@echo ""

# -----------------------------------------------------------------------------
# Étapes internes
# -----------------------------------------------------------------------------

# 1. Démarrer Minikube (start + addons)
_minikube:
	@bash scripts/infra/init-minikube.sh

# 2. Créer le namespace collector dans Minikube (idempotent)
#    Le Terraform cible GCP (prod) — en local on passe par kubectl directement.
_namespace:
	@echo ""; echo "── Namespace K8s ──"
	@kubectl create namespace collector --dry-run=client -o yaml | kubectl apply -f - > /dev/null 2>&1
	@echo "✅ Namespace 'collector' prêt."

# 3. Charger les images dans Minikube
#    Stratégie : docker pull sur le daemon HOST (peut être authentifié)
#    puis minikube image load → transfert local, zéro contact Docker Hub
_images:
	@echo ""; echo "── Chargement des images dans Minikube ──"
	@for img in $(IMAGES); do \
		printf "   → %-40s" "$$img"; \
		if minikube image list 2>/dev/null | grep -q "$$img"; then \
			echo "en cache ✓"; \
		else \
			docker pull "$$img" -q 2>/dev/null \
			&& minikube image load "$$img" 2>/dev/null \
			&& echo "chargée ✓" \
			|| echo "⚠  échec — exécuter: docker login"; \
		fi; \
	done

# 4. Injecter le certificat TLS comme Secret K8s pour l'ingress NGINX
#    Le secret "collector-tls" est utilisé dans infrastructure/k8s/base/frontend.yaml
_k8s-tls:
	@echo ""; echo "── Certificat TLS Ingress (https://collector.local) ──"
	@bash scripts/infra/gen-certs.sh
	@kubectl create secret tls collector-tls \
		--cert=certs/cert.pem \
		--key=certs/key.pem \
		-n collector \
		--dry-run=client -o yaml | kubectl apply -f - > /dev/null 2>&1
	@echo "✅ Secret TLS 'collector-tls' injecté dans le namespace collector."

# 5a. Tuer les processus occupant les ports cibles (kubectl port-forward + autres)
_kill-ports:
	@echo "── Libération des ports $(PORTS) ──"
	@pkill -f "kubectl port-forward.*collector" 2>/dev/null || true
	@for port in $(PORTS); do \
		lsof -ti :$$port 2>/dev/null | xargs kill -9 2>/dev/null || true; \
	done
	@sleep 1

# 5b. Port-forward en arrière-plan (persistant après make run)
#     Lance kubectl port-forward avec nohup → survive à la fermeture du terminal
_forward: _kill-ports
	@echo ""; echo "── Port-forward Minikube (background) ──"
	@nohup kubectl port-forward svc/frontend   -n collector 3000:3000 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/backend    -n collector 4000:4000 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/grafana    -n collector 3002:3002 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/prometheus -n collector 9090:9090 > /dev/null 2>&1 &
	@nohup kubectl port-forward pod/db-0       -n collector 5432:5432 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/redis      -n collector 6379:6379 > /dev/null 2>&1 &
	@sleep 2
	@echo "✅ Services disponibles :"
	@echo ""
	@echo "   ── HTTPS via ingress NGINX (simulation HTTPS complète) ───────"
	@echo "   https://collector.local      → Frontend Collector.shop"
	@echo "   Prérequis : 1) make hosts (une fois)   2) make tunnel (autre terminal)"
	@echo ""
	@echo "   ── Accès direct HTTP (debug / port-forward) ──────────────────"
	@echo "   http://localhost:3000        → Frontend"
	@echo "   http://localhost:4000        → Backend API"
	@echo "   http://localhost:4000/api/docs → Swagger UI"
	@echo "   (HTTP normal — HTTPS simulé uniquement via collector.local)"
	@echo ""
	@echo "   ── Monitoring & outils ──────────────────────────────────────"
	@echo "   http://localhost:3002        → Grafana  (admin/admin)"
	@echo "   http://localhost:9090        → Prometheus"
	@echo "   localhost:5432               → PostgreSQL"
	@echo "   localhost:6379               → Redis"

# 6. Reset DB (make reset uniquement)
#    Si le pod DB tourne déjà → vide le schéma avant redéploiement
_db-reset:
	@echo ""; echo "── Reset de la base de données ──"
	@kubectl wait --for=condition=Ready pod -l app=db -n collector \
		--timeout=60s 2>/dev/null || true
	@if kubectl get pod -l app=db -n collector 2>/dev/null | grep -q "Running"; then \
		DB_USER=$$(kubectl exec -n collector db-0 -- \
			printenv POSTGRES_USER 2>/dev/null || echo "user"); \
		kubectl exec -n collector db-0 -- psql -U "$$DB_USER" -d collector -c \
			"DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; \
			GRANT ALL ON SCHEMA public TO \"$$DB_USER\";" 2>/dev/null; \
		echo "✅ Schéma réinitialisé."; \
	else \
		echo "⚠  Pod DB absent — déploiement fresh (pas de reset nécessaire)."; \
	fi
