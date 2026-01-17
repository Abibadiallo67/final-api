#!/bin/bash
echo "🚀 Installation du système complet..."

# 1. Installer MongoDB
echo "📦 Installation de MongoDB..."
sudo apt update
sudo apt install -y mongodb

# 2. Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 3. Créer la structure des dossiers
mkdir -p ~/USER_SYSTEM/{backend,frontend,telegram-bot}

# 4. Backend
echo "🔧 Configuration du backend..."
cd ~/USER_SYSTEM/backend

# Créer package.json
cat > package.json << 'EOF'
{
  "name": "user-system-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "helmet": "^7.0.0"
  }
}
EOF

# Créer server.js (copier le code fourni plus haut)
# ... copier le code server.js ici

# Installer les dépendances
npm install

# 5. Frontend
echo "🎨 Configuration du frontend..."
cd ~/USER_SYSTEM
npx create-react-app frontend
cd frontend

# Installer les dépendances supplémentaires
npm install axios react-router-dom chart.js react-chartjs-2

# 6. Bot Telegram
echo "🤖 Configuration du bot Telegram..."
cd ~/USER_SYSTEM/telegram-bot
npm init -y
npm install node-telegram-bot-api axios

# 7. Démarrer tout
echo "✅ Installation terminée !"
echo ""
echo "📋 Pour démarrer:"
echo "1. Backend: cd ~/USER_SYSTEM/backend && npm start"
echo "2. Frontend: cd ~/USER_SYSTEM/frontend && npm start"
echo "3. Bot: cd ~/USER_SYSTEM/telegram-bot && node bot.js"
echo ""
echo "🌐 Accès:"
echo "   - Dashboard: http://localhost:3000"
echo "   - API: http://localhost:5000"
