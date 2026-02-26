#!/bin/bash
# =============================================================================
#  gen-certs.sh — Génère des certificats TLS auto-signés pour le développement
#
#  Produit :
#    certs/cert.pem + certs/key.pem       (source unique)
#    frontend/secrets/cert.pem + key.pem  (pour node server.js)
#    backend/secrets/cert.pem  + key.pem  (pour NestJS HTTPS)
#
#  Domaines couverts : localhost, collector.local, backend, frontend
#  Validité          : 365 jours
#
#  Usage : bash scripts/infra/gen-certs.sh
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
FRONTEND_SECRETS="$ROOT_DIR/frontend/secrets"
BACKEND_SECRETS="$ROOT_DIR/backend/secrets"

GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
NC=$'\033[0m'

# ── Vérifier si les certificats existants sont encore valides (> 7 jours) ──
if [ -f "$CERT_DIR/cert.pem" ] && [ -f "$CERT_DIR/key.pem" ]; then
  if openssl x509 -checkend 604800 -noout -in "$CERT_DIR/cert.pem" 2>/dev/null; then
    printf "%s✅ Certificats TLS déjà valides (> 7 jours) — copie dans secrets/...%s\n" "$GREEN" "$NC"
    mkdir -p "$FRONTEND_SECRETS" "$BACKEND_SECRETS"
    cp "$CERT_DIR/cert.pem" "$FRONTEND_SECRETS/cert.pem"
    cp "$CERT_DIR/key.pem"  "$FRONTEND_SECRETS/key.pem"
    cp "$CERT_DIR/cert.pem" "$BACKEND_SECRETS/cert.pem"
    cp "$CERT_DIR/key.pem"  "$BACKEND_SECRETS/key.pem"
    exit 0
  else
    printf "%s⚠️  Certificats expirés — regénération...%s\n" "$YELLOW" "$NC"
  fi
fi

mkdir -p "$CERT_DIR" "$FRONTEND_SECRETS" "$BACKEND_SECRETS"

printf "🔐 Génération des certificats TLS auto-signés...\n"

# ── Fichier de configuration OpenSSL (SAN multi-domaines) ──
OPENSSL_CONF="$CERT_DIR/openssl.conf"
cat > "$OPENSSL_CONF" << 'EOF'
[req]
default_bits       = 2048
prompt             = no
default_md         = sha256
distinguished_name = dn
x509_extensions    = v3_req

[dn]
CN = collector.local

[v3_req]
subjectAltName   = @alt_names
basicConstraints = CA:FALSE
keyUsage         = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = collector.local
DNS.3 = backend
DNS.4 = frontend
IP.1  = 127.0.0.1
IP.2  = 0.0.0.0
EOF

# ── Génération ──
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$CERT_DIR/key.pem" \
  -out    "$CERT_DIR/cert.pem" \
  -days   365 \
  -config "$OPENSSL_CONF" 2>/dev/null

rm -f "$OPENSSL_CONF"

# ── Distribution dans les dossiers secrets ──
cp "$CERT_DIR/cert.pem" "$FRONTEND_SECRETS/cert.pem"
cp "$CERT_DIR/key.pem"  "$FRONTEND_SECRETS/key.pem"
cp "$CERT_DIR/cert.pem" "$BACKEND_SECRETS/cert.pem"
cp "$CERT_DIR/key.pem"  "$BACKEND_SECRETS/key.pem"

printf "%s✅ Certificats TLS générés avec succès :%s\n" "$GREEN" "$NC"
printf "   Source     : certs/\n"
printf "   Frontend   : frontend/secrets/\n"
printf "   Backend    : backend/secrets/\n"
printf "   Domaines   : localhost, collector.local, backend, frontend\n"
printf "   Validité   : 365 jours\n"
printf "\n"
printf "   ℹ️  Certificats auto-signés — le navigateur affichera un avertissement.\n"
printf "   Pour l'éviter : ajoutez certs/cert.pem à votre trousseau de clés système.\n"
