const multer = require('multer');

// Utilisation de memoryStorage pour traiter le fichier en mémoire RAM
// et l'envoyer directement vers S3 depuis le contrôleur, sans l'écrire localement.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite fixée à 5 Mo
  },
});

module.exports = upload;
