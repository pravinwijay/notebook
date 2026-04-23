const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const BookModel = require('../models/bookModel');
const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');

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
  },

  rateBook: async (req, res) => {
    try {
      const bookId = req.params.id; // L'ID du livre depuis l'URL
      const { stars } = req.body;   // La note envoyée (1 à 5)

      if (!stars || stars < 1 || stars > 5) {
        return res.status(400).json({ error: 'Une note entre 1 et 5 est requise.' });
      }

      // 1. Initialiser la connexion à la blockchain
      // On utilise JsonRpcProvider pour ethers v6
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

      // 2. Définir l'interface (ABI) stricte de notre contrat
      const contractABI = [
        "function addRating(uint256 _bookId, uint8 _stars) public",
        "event RatingAdded(uint256 indexed bookId, uint8 stars, address indexed rater, uint256 timestamp)"
      ];

      // 3. Connecter notre instance au Smart Contract
      const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

      // 4. Envoyer la transaction sur la blockchain (modifie l'état)
      console.log(`Envoi de la note ${stars} pour le livre ${bookId} sur la blockchain...`);
      const tx = await contract.addRating(bookId, stars);

      // 5. Attendre que la transaction soit validée (minée)
      const receipt = await tx.wait();

      res.status(200).json({
        message: 'Avis enregistré sur la blockchain avec succès ! (Infalsifiable)',
        transactionHash: receipt.hash,
        bookId: bookId,
        stars: stars
      });

    } catch (error) {
      console.error('Erreur Blockchain:', error);
      res.status(500).json({ error: 'Un problème est survenu lors de l\'enregistrement de la note sur la blockchain.' });
    }
  }
};

module.exports = BookController;
