.PHONY: run dev reset stop ports logs help \
        _minikube _namespace _images _db-reset _forward _kill-ports

# =============================================================================
#  Collector — Commandes de développement local (Minikube)
#
#  make run    → Build + deploy complet sur Minikube + port-forward
#  make dev    → Mode continu avec hot-reload backend (.ts)
#  make reset  → Reset DB + redéploiement + port-forward
#  make ports  → (Re)ouvre les port-forwards si fermés
#  make stop   → Libère les ports + supprime namespace K8s + arrête Minikube
#  make logs   → Logs en temps réel du namespace collector
#
#  Note : Terraform cible GCP (CI/CD production).
#         Le namespace local est créé directement via kubectl.
# =============================================================================

# Ports exposés localement
PORTS := 3000 4000 3002 9090

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
# Commandes publiques
# -----------------------------------------------------------------------------

run: _minikube _namespace _images
	skaffold run --cache-artifacts=false
	@$(MAKE) --no-print-directory _forward

dev: _minikube _namespace _images _kill-ports
	skaffold dev -p dev --cache-artifacts=false

reset: _minikube _namespace _images _db-reset
	skaffold run --cache-artifacts=false
	@$(MAKE) --no-print-directory _forward

## (Re)ouvre les port-forwards sans redéployer
ports: _forward

stop: _kill-ports
	@echo "── Suppression des ressources K8s ──"
	-kubectl delete namespace collector --ignore-not-found
	@echo "── Arrêt de Minikube ──"
	minikube stop

logs:
	kubectl logs -n collector -l app --all-containers --follow --max-log-requests=10

help:
	@echo "make run    → Build + deploy complet + port-forward"
	@echo "make dev    → Mode hot-reload backend"
	@echo "make reset  → Reset DB + redéploiement"
	@echo "make ports  → (Re)ouvre les port-forwards"
	@echo "make stop   → Arrêt propre"
	@echo "make logs   → Logs en temps réel"

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

# 4a. Tuer les processus occupant les ports cibles (kubectl port-forward + autres)
_kill-ports:
	@echo "── Libération des ports $(PORTS) ──"
	@pkill -f "kubectl port-forward.*collector" 2>/dev/null || true
	@for port in $(PORTS); do \
		lsof -ti :$$port 2>/dev/null | xargs kill -9 2>/dev/null || true; \
	done
	@sleep 1

# 4b. Port-forward en arrière-plan (persistant après make run)
#     Lance kubectl port-forward avec nohup → survive à la fermeture du terminal
_forward: _kill-ports
	@echo ""; echo "── Port-forward (background) ──"
	@nohup kubectl port-forward svc/frontend   -n collector 3000:3000 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/backend    -n collector 4000:4000 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/grafana    -n collector 3002:3002 > /dev/null 2>&1 &
	@nohup kubectl port-forward svc/prometheus -n collector 9090:9090 > /dev/null 2>&1 &
	@sleep 2
	@echo "✅ Services disponibles :"
	@echo "   http://localhost:3000  → Frontend (Collector.shop)"
	@echo "   http://localhost:4000  → Backend API"
	@echo "   http://localhost:3002  → Grafana (admin/admin)"
	@echo "   http://localhost:9090  → Prometheus"

# 5. Reset DB (make reset uniquement)
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
