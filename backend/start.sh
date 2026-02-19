#!/bin/sh

echo "⏳ Attente de la base de données..."
MAX_RETRIES=30
RETRY_COUNT=0
until npx prisma migrate deploy 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ La base de données n'est pas disponible après ${MAX_RETRIES} tentatives."
    exit 1
  fi
  echo "⏳ DB pas encore prête, tentative ${RETRY_COUNT}/${MAX_RETRIES}..."
  sleep 2
done

echo "✅ Migrations appliquées avec succès."

# Attente de Redis
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

# Lancer Prisma Studio en arrière-plan
echo "🚀 Démarrage de Prisma Studio sur le port 5555..."
npx prisma studio --port 5555 &

# Lancer l'application NestJS
echo "🚀 Démarrage de l'API NestJS sur le port 3000..."
npm run start:prod
