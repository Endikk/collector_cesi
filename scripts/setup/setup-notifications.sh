#!/bin/bash

echo "🔔 Installation du système de notifications avancé"
echo ""

# 1. Vérifier que nous sommes dans le bon répertoire
# 1. Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet collector"
    exit 1
fi

# 2. Installer nodemailer dans le backend
echo "📦 Installation de nodemailer..."
cd backend
npm install nodemailer @types/nodemailer
cd ..

# 3. Régénérer les clients Prisma
echo "🔄 Régénération des clients Prisma..."
cd backend
npx prisma generate
cd ..

cd frontend
npx prisma generate
cd ..

# 4. Appliquer les migrations (si Docker est disponible)
echo "🗄️  Application des migrations..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec -T backend npx prisma migrate deploy
else
    echo "⚠️  Docker non détecté, veuillez appliquer les migrations manuellement:"
    echo "   cd backend && npx prisma migrate dev"
fi

# 5. Redémarrer les services
echo "🔄 Redémarrage des services..."
if command -v docker-compose &> /dev/null; then
    docker-compose restart
else
    echo "⚠️  Docker non détecté, veuillez redémarrer les services manuellement"
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Configurer MailHog pour le développement:"
echo "     brew install mailhog && mailhog"
echo "     Interface: http://localhost:8025"
echo ""
echo "  2. Configurer les variables d'environnement (backend/.env):"
echo "     SMTP_HOST=localhost"
echo "     SMTP_PORT=1025"
echo "     FRONTEND_URL=http://localhost:3000"
echo ""
echo "  3. Tester le système:"
echo "     - Se connecter à l'application"
echo "     - Aller dans Profil > Préférences notifications"
echo "     - Configurer des centres d'intérêt"
echo "     - Publier un article correspondant avec un autre compte"
echo ""
echo "📚 Documentation: docs/NOTIFICATION_SYSTEM.md"
