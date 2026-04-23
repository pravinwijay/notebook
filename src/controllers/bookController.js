const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const BookModel = require('../models/bookModel');
const { v4: uuidv4 } = require('uuid');

const bucketName = process.env.AWS_S3_BUCKET_NAME;

const BookController = {
  // GET /books
  getBooks: async (req, res) => {
    try {
      const books = await BookModel.getAllBooks();
      res.status(200).json(books);
    } catch (error) {
      console.error('Erreur SQL:', error);
      res.status(500).json({ error: 'Erreur de récupération des livres depuis PostgreSQL.' });
    }
  },

  // POST /books
  createBook: async (req, res) => {
    try {
      const { titre, auteur, description } = req.body;
      const file = req.file; // Fichier intercepté par multer

      if (!titre || !auteur) {
        return res.status(400).json({ error: 'Le titre et l\'auteur sont requis.' });
      }

      let cover_url = null;

      // 1. Gérer l'upload vers AWS S3 si une image est fournie
      if (file) {
        // Extraction de l'extension originale (ex: .png, .jpg)
        const fileExtension = file.originalname.split('.').pop();
        // Création d'une clé (chemin) unique sur S3
        const fileName = `covers/${uuidv4()}.${fileExtension}`;

        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        // Exécution de l'upload
        await s3Client.send(command);

        // URL publique reconstituée du fichier déposé sur S3
        cover_url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      }

      // 2. Insérer le livre avec l'URL en DB PostgreSQL
      const newBook = await BookModel.createBook(titre, auteur, description, cover_url);

      // TODO: Intégration Web3 pour l'enregistrement de la note sur la blockchain
      // Placer l'appel du Smart Contract ici. Par exemple :
      // const tx = await smartContract.recordBook(newBook.id, initialRating);
      // await tx.wait();

      res.status(201).json({
        message: 'Livre ajouté avec succès dans PostgreSQL !',
        book: newBook
      });
    } catch (error) {
      console.error('Erreur Serveur:', error);
      res.status(500).json({ error: 'Un problème est survenu lors de la création du livre.' });
    }
  }
};

module.exports = BookController;
