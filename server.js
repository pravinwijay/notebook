const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de l'API
app.use('/api/books', bookRoutes);

// Route de base de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Library !' });
});

// Lancement
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
