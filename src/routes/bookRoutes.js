const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const upload = require('../middlewares/upload');

// Route GET pour récupérer les livres
router.get('/', BookController.getBooks);

// Route POST pour créer un livre
// 'coverImage' correspond à la clé à envoyer via form-data dans l'application cliente ou Postman
router.post('/', upload.single('coverImage'), BookController.createBook);

module.exports = router;
