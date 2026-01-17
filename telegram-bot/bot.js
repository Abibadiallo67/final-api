// telegram-bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Remplace par ton token de bot
const token = 'TON_TOKEN_BOT_TELEGRAM';
const bot = new TelegramBot(token, { polling: true });

const API_URL = 'http://localhost:5000/api';

console.log('🤖 Bot Telegram démarré...');

// Commande /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  bot.sendMessage(chatId, `👋 Bonjour ${firstName} !\n\nBienvenue dans le système de gestion !\n\nCommandes disponibles:\n/login - Se connecter\n/register - S'inscrire\n/balance - Voir mon solde\n/transfer - Transférer des crédits\n/stats - Statistiques`);
});

// Commande /register
bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, "📝 Inscription:\n\nVeuillez répondre avec vos informations au format:\n\nemail motdepasse username\n\nExemple: john@mail.com password123 JohnDoe");
  
  bot.once('message', async (responseMsg) => {
    if (responseMsg.chat.id === chatId) {
      const [email, password, username] = responseMsg.text.split(' ');
      
      try {
        const res = await axios.post(`${API_URL}/register`, {
          email,
          password,
          username,
          contact: { telegram: `@${msg.from.username}` }
        });
        
        bot.sendMessage(chatId, `✅ Inscription réussie !\n\nVotre compte a été créé:\nUsername: ${res.data.user.username}\nCrédit: ${res.data.user.credit}\nCode affilié: ${res.data.user.affiliateCode}`);
      } catch (error) {
        bot.sendMessage(chatId, `❌ Erreur: ${error.response?.data?.error || error.message}`);
      }
    }
  });
});

// Commande /login
bot.onText(/\/login/, async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, "🔐 Connexion:\n\nVeuillez répondre avec:\nemail motdepasse\n\nExemple: john@mail.com password123");
  
  bot.once('message', async (responseMsg) => {
    if (responseMsg.chat.id === chatId) {
      const [email, password] = responseMsg.text.split(' ');
      
      try {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        const user = res.data.user;
        
        // Stocker le token dans la session
        bot.sendMessage(chatId, `✅ Connecté !\n\n👤 ${user.username}\n💰 Crédit: ${user.credit}\n📊 Type: ${user.type}\n🔗 Code affilié: ${user.affiliateCode}`);
      } catch (error) {
        bot.sendMessage(chatId, `❌ Erreur de connexion`);
      }
    }
  });
});

// Commande /balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Demander l'email pour vérifier le solde
  bot.sendMessage(chatId, "Veuillez entrer votre email pour vérifier votre solde:");
  
  bot.once('message', async (responseMsg) => {
    if (responseMsg.chat.id === chatId) {
      try {
        const loginRes = await axios.post(`${API_URL}/login`, {
          email: responseMsg.text,
          password: 'dummy' // Dans un vrai cas, il faudrait gérer l'authentification
        });
        
        bot.sendMessage(chatId, `💰 Votre solde: ${loginRes.data.user.credit} crédits`);
      } catch (error) {
        bot.sendMessage(chatId, `❌ Impossible de récupérer le solde`);
      }
    }
  });
});

// Commande /transfer
bot.onText(/\/transfer/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, "💸 Transfert de crédits:\n\nFormat: username montant\n\nExemple: johnDoe 100");
  
  bot.once('message', async (responseMsg) => {
    if (responseMsg.chat.id === chatId) {
      const [toUsername, amount] = responseMsg.text.split(' ');
      
      try {
        // Ici, il faudrait gérer l'authentification réelle
        bot.sendMessage(chatId, `Transfert de ${amount} crédits à ${toUsername} en cours...`);
        
        // Simuler un transfert
        setTimeout(() => {
          bot.sendMessage(chatId, `✅ Transfert effectué !\n${amount} crédits envoyés à ${toUsername}`);
        }, 2000);
      } catch (error) {
        bot.sendMessage(chatId, `❌ Erreur de transfert`);
      }
    }
  });
});

// Commande /stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const res = await axios.get(`${API_URL}/stats`);
    const stats = res.data;
    
    let message = `📊 STATISTIQUES GLOBALES\n\n`;
    message += `👥 Total utilisateurs: ${stats.totalUsers || 0}\n`;
    message += `💰 Crédit total: ${stats.totalCredit?.[0]?.total || 0}\n\n`;
    
    if (stats.usersByType) {
      message += `📈 Répartition par type:\n`;
      stats.usersByType.forEach(type => {
        message += `• ${type._id}: ${type.count}\n`;
      });
    }
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Impossible de récupérer les statistiques`);
  }
});

// Menu interactif
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  
  const options = {
    reply_markup: {
      keyboard: [
        ['💰 Mon solde', '📊 Statistiques'],
        ['💸 Transférer', '👥 Réseau'],
        ['🔧 Paramètres']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  bot.sendMessage(chatId, '📱 Menu principal:', options);
});

// Gestion des boutons du menu
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  switch(text) {
    case '💰 Mon solde':
      bot.sendMessage(chatId, 'Votre solde est de: 1,250 crédits');
      break;
    case '📊 Statistiques':
      bot.sendMessage(chatId, '📈 Statistiques:\n\nUtilisateurs actifs: 150\nTransactions aujourd\'hui: 45\nCrédit total: 25,000');
      break;
    case '💸 Transférer':
      bot.sendMessage(chatId, 'Utilisez la commande /transfer');
      break;
  }
});

console.log('✅ Bot prêt ! Parlez-lui sur Telegram');
