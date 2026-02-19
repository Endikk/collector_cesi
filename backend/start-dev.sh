#!/bin/sh

# Lancer Prisma Studio en arrière-plan
echo "🚀 Démarrage de Prisma Studio sur le port 5555..."
npx prisma studio --port 5555 &

# Appliquer les migrations
echo "📦 Application des migrations..."
npx prisma migrate deploy

# Seeder la base de données
echo "🌱 Seeding de la base de données..."
npx prisma db seed

# Lancer l'application NestJS en mode développement
echo "🚀 Démarrage de l'API NestJS en mode dev sur le port 3000..."
npm run start:dev
