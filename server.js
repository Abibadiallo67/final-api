// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/user_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modèle Utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: {
    whatsapp: String,
    telegram: String,
    phone: String
  },
  credit: { type: Number, default: 0 },
  country: String,
  city: String,
  type: { 
    type: String, 
    enum: ['user', 'affiliate', 'partner', 'team', 'admin'],
    default: 'user'
  },
  affiliateCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Veuillez vous authentifier' });
  }
};

// ROUTES

// 1. Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, contact, country, city, type, affiliateCode } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer un code d'affilié
    const userAffiliateCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Créer l'utilisateur
    const user = new User({
      username,
      email,
      password: hashedPassword,
      contact,
      country,
      city,
      type,
      affiliateCode: userAffiliateCode,
      referredBy: affiliateCode ? await User.findOne({ affiliateCode }) : null
    });

    await user.save();

    // Créer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credit: user.credit,
        type: user.type,
        affiliateCode: user.affiliateCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Connexion
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123');

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credit: user.credit,
        type: user.type,
        affiliateCode: user.affiliateCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Obtenir le profil utilisateur
app.get('/api/profile', auth, async (req, res) => {
  res.json(req.user);
});

// 4. Transférer des crédits
app.post('/api/transfer', auth, async (req, res) => {
  try {
    const { toUsername, amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    if (req.user.credit < amount) {
      return res.status(400).json({ error: 'Crédit insuffisant' });
    }

    const receiver = await User.findOne({ username: toUsername });
    if (!receiver) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les crédits
    req.user.credit -= amount;
    receiver.credit += amount;

    await req.user.save();
    await receiver.save();

    res.json({
      success: true,
      message: `Transfert de ${amount} crédits à ${receiver.username} effectué`,
      newBalance: req.user.credit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Admin: Obtenir tous les utilisateurs
app.get('/api/admin/users', auth, async (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  const users = await User.find().select('-password');
  res.json(users);
});

// 6. Admin: Mettre à jour un utilisateur
app.put('/api/admin/users/:id', auth, async (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Statistiques
app.get('/api/stats', auth, async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    totalCredit: await User.aggregate([{ $group: { _id: null, total: { $sum: '$credit' } } }]),
    usersByType: await User.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    usersByCountry: await User.aggregate([{ $group: { _id: '$country', count: { $sum: 1 } } }])
  };
  
  res.json(stats);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
