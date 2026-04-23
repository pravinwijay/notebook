# 1. Utiliser une image Node.js officielle légère comme base
FROM node:18-alpine

# 2. Définir le dossier de travail à l'intérieur du conteneur
WORKDIR /usr/src/app

# 3. Copier uniquement les fichiers de dépendances en premier (pour optimiser le cache Docker)
COPY package*.json ./

# 4. Installer les dépendances (uniquement pour la production)
RUN npm install --only=production

# 5. Copier tout le reste du code source de l'application
COPY . .

# 6. Exposer le port sur lequel l'API écoute
EXPOSE 3000

# 7. Commande pour démarrer l'application
CMD ["npm", "start"]