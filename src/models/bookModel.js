const db = require('../config/database');

const BookModel = {
  // Récupérer la liste des livres
  getAllBooks: async () => {
    const result = await db.query('SELECT * FROM books ORDER BY id DESC');
    return result.rows;
  },

  // Ajouter un nouveau livre
  createBook: async (titre, auteur, description, cover_url) => {
    const queryText = `
      INSERT INTO books (titre, auteur, description, cover_url) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const values = [titre, auteur, description, cover_url];
    const result = await db.query(queryText, values);
    return result.rows[0];
  }
};

/*
* Script SQL utile pour configurer manuellement la table sur RDS :
* 
* CREATE TABLE books (
*   id SERIAL PRIMARY KEY,
*   titre VARCHAR(255) NOT NULL,
*   auteur VARCHAR(255) NOT NULL,
*   description TEXT,
*   cover_url VARCHAR(512)
* );
*/

module.exports = BookModel;
