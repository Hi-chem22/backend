const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Routes
const sessionRoutes = require('./routes/sessionRoutes');
const speakerRoutes = require('./routes/speakerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adRoutes = require('./routes/adRoutes');
const roomRoutes = require('./routes/roomRoutes');
const dayRoutes = require('./routes/dayRoutes');
const subsessionRoutes = require('./routes/subsessionRoutes');
const chairpersonRoutes = require('./routes/chairpersonRoutes');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialisation du serveur Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/sessions', sessionRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/days', dayRoutes);
app.use('/api/subsessions', subsessionRoutes);
app.use('/api/chairpersons', chairpersonRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API pour le Congrès AFRAN 2025 est en ligne !');
});

// Démarrage du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Serveur démarré sur le port ${PORT}`);
}); 