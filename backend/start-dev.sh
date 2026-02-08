#!/bin/sh

# Lancer Prisma Studio en arrière-plan
echo "🚀 Démarrage de Prisma Studio sur le port 5555..."
npx prisma studio --port 5555 &

# Lancer l'application NestJS en mode développement
echo "🚀 Démarrage de l'API NestJS en mode dev sur le port 3000..."
npm run start:dev
