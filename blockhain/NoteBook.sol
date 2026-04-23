// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookRating {
    // Structure pour stocker les détails d'un avis
    struct Rating {
        uint256 bookId;
        uint8 stars;
        address rater;
        uint256 timestamp;
    }

    // Un tableau pour garder une trace de tous les avis
    Rating[] public ratings;

    // Événement émis à chaque nouvel avis (crucial pour la traçabilité C26.1)
    event RatingAdded(uint256 indexed bookId, uint8 stars, address indexed rater, uint256 timestamp);

    // Fonction principale pour enregistrer un avis
    function addRating(uint256 _bookId, uint8 _stars) public {
        require(_stars >= 1 && _stars <= 5, "La note doit etre entre 1 et 5");

        ratings.push(Rating({
            bookId: _bookId,
            stars: _stars,
            rater: msg.sender,
            timestamp: block.timestamp
        }));

        // On émet l'événement sur la blockchain
        emit RatingAdded(_bookId, _stars, msg.sender, block.timestamp);
    }

    // Fonction utilitaire pour compter le nombre total d'avis
    function getTotalRatings() public view returns (uint256) {
        return ratings.length;
    }
}