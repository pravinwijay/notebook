const { Pool } = require('pg');
require('dotenv').config();

// Initialisation du pool PostgreSQL - prêt pour AWS RDS
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base PostgreSQL:', err.stack);
  } else {
    console.log('Connecté à la base de données PostgreSQL.');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
