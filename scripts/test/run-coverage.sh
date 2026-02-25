#!/bin/bash
# ============================================================================
# Collector.shop — Script de couverture de code complète
# Génère les rapports de couverture backend + frontend et un résumé consolidé
# Usage : bash scripts/test/run-coverage.sh
# ============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_DIR="$SCRIPT_DIR/coverage-report"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     COLLECTOR.SHOP — Rapport de Couverture de Code      ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Créer le dossier de rapport consolidé
mkdir -p "$REPORT_DIR"

# ─── BACKEND ───────────────────────────────────────────────────────────────────
echo -e "${BLUE}▶ [1/3] Tests + couverture BACKEND (Jest --coverage)${NC}"
echo "────────────────────────────────────────────────────────"
cd "$ROOT_DIR/backend"
npx jest --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=json-summary 2>&1 | tail -n 80

# Extraire les métriques backend
if [ -f coverage/coverage-summary.json ]; then
  BACK_STMTS=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.statements.pct)")
  BACK_BRANCH=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.branches.pct)")
  BACK_FUNCS=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.functions.pct)")
  BACK_LINES=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.lines.pct)")
else
  BACK_STMTS="N/A"
  BACK_BRANCH="N/A"
  BACK_FUNCS="N/A"
  BACK_LINES="N/A"
fi

cp -r coverage "$REPORT_DIR/backend-coverage" 2>/dev/null || true
echo ""

# ─── FRONTEND ──────────────────────────────────────────────────────────────────
echo -e "${BLUE}▶ [2/3] Tests + couverture FRONTEND (Jest --coverage)${NC}"
echo "────────────────────────────────────────────────────────"
cd "$ROOT_DIR/frontend"
npx jest --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=json-summary 2>&1 | tail -n 40

if [ -f coverage/coverage-summary.json ]; then
  FRONT_STMTS=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.statements.pct)")
  FRONT_BRANCH=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.branches.pct)")
  FRONT_FUNCS=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.functions.pct)")
  FRONT_LINES=$(node -e "const d=require('./coverage/coverage-summary.json'); console.log(d.total.lines.pct)")
else
  FRONT_STMTS="N/A"
  FRONT_BRANCH="N/A"
  FRONT_FUNCS="N/A"
  FRONT_LINES="N/A"
fi

cp -r coverage "$REPORT_DIR/frontend-coverage" 2>/dev/null || true
echo ""

# ─── RÉSUMÉ ────────────────────────────────────────────────────────────────────
echo -e "${BLUE}▶ [3/3] Résumé consolidé${NC}"
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║              RÉSUMÉ COUVERTURE COLLECTOR.SHOP               ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║  Composant  │ Stmts    │ Branch   │ Funcs    │ Lines       ║${NC}"
echo -e "${BOLD}╠═════════════╪══════════╪══════════╪══════════╪═════════════╣${NC}"
printf  "${BOLD}║  Backend    │ %6s%%  │ %6s%%  │ %6s%%  │ %6s%%      ║${NC}\n" "$BACK_STMTS" "$BACK_BRANCH" "$BACK_FUNCS" "$BACK_LINES"
printf  "${BOLD}║  Frontend   │ %6s%%  │ %6s%%  │ %6s%%  │ %6s%%      ║${NC}\n" "$FRONT_STMTS" "$FRONT_BRANCH" "$FRONT_FUNCS" "$FRONT_LINES"
echo -e "${BOLD}╚═════════════╧══════════╧══════════╧══════════╧═════════════╝${NC}"
echo ""

# ─── Rapports HTML ─────────────────────────────────────────────────────────────
echo -e "${GREEN}✅ Rapports HTML générés :${NC}"
echo "   Backend  → $REPORT_DIR/backend-coverage/lcov-report/index.html"
echo "   Frontend → $REPORT_DIR/frontend-coverage/lcov-report/index.html"
echo ""

# ─── Évaluation objectif ──────────────────────────────────────────────────────
echo -e "${YELLOW}📊 Objectifs qualité :${NC}"
echo "   Sprint actuel  : ≥ 6% (POC MVP — dette technique maîtrisée)"
echo "   Sprint +1      : ≥ 40% (modules critiques : payment, fraud, moderation)"
echo "   Sprint +3      : ≥ 70% (cible production)"
echo ""
echo -e "${BOLD}Date du rapport : $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
