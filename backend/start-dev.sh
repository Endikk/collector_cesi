#!/bin/sh

MAX_RETRIES=30

# ── 1. Attendre que PostgreSQL accepte les connexions ──
echo "⏳ Attente de la connexion PostgreSQL..."
RETRY_COUNT=0
# Extraire host et port depuis DATABASE_URL (format: postgresql://user:pass@host:port/db)
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
until node -e "const s=require('net').createConnection(${DB_PORT},'${DB_HOST}');s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000);" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ PostgreSQL n'est pas disponible après ${MAX_RETRIES} tentatives."
    exit 1
  fi
  echo "⏳ PostgreSQL pas encore prêt, tentative ${RETRY_COUNT}/${MAX_RETRIES}..."
  sleep 2
done
echo "✅ PostgreSQL connecté."

# ── 2. Résoudre les migrations échouées (P3009) ──
echo "🔎 Vérification des migrations..."
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?

if [ "$MIGRATE_EXIT" -ne 0 ]; then
  if echo "$MIGRATE_OUTPUT" | grep -q "P3009"; then
    echo "⚠️  Migrations échouées détectées, résolution automatique..."
    FAILED_MIGRATIONS=$(echo "$MIGRATE_OUTPUT" | grep "migration started at" | sed 's/.*The `\(.*\)` migration started at.*/\1/')
    for MIGRATION in $FAILED_MIGRATIONS; do
      echo "   → Résolution de $MIGRATION..."
      npx prisma migrate resolve --applied "$MIGRATION" 2>/dev/null || true
    done
    echo "🔄 Relancement des migrations..."
    npx prisma migrate deploy
  else
    echo "❌ Erreur de migration inattendue :"
    echo "$MIGRATE_OUTPUT"
    exit 1
  fi
fi
echo "✅ Migrations appliquées avec succès."

# ── 3. Attente de Redis ──
echo "⏳ Attente de Redis..."
REDIS_H="${REDIS_HOST:-redis}"
REDIS_P="${REDIS_PORT:-6379}"
RETRY_COUNT=0
until node -e "const s=require('net').createConnection($REDIS_P,'$REDIS_H');s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2000);" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Redis n'est pas disponible après ${MAX_RETRIES} tentatives."
    exit 1
  fi
  echo "⏳ Redis pas encore prêt, tentative ${RETRY_COUNT}/${MAX_RETRIES}..."
  sleep 2
done
echo "✅ Redis connecté."

# ── 4. Seed de la base de données ──
echo "🌱 Seeding de la base de données..."
npx prisma db seed || echo "⚠️ Seed ignoré (probablement déjà fait)."

# ── 5. Prisma Studio ──
echo "🚀 Démarrage de Prisma Studio sur le port 5555..."
npx prisma studio --port 5555 &

# ── 6. Lancer NestJS ──
echo "🚀 Démarrage de l'API NestJS en mode dev sur le port 3000..."
npm run start:dev
