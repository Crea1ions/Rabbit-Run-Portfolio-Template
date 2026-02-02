// game-loader.js - Version simplifiée et utile
console.log('🎮 Chargeur de jeu prêt');

// Exporte une fonction d'initialisation simple
window.initializeMiniTrexGame = function() {
    const canvas = document.getElementById('trexMiniCanvas');
    if (!canvas || typeof MiniTrexGame === 'undefined') {
        return false;
    }
    
    try {
        new MiniTrexGame('trexMiniCanvas').init();
        return true;
    } catch (error) {
        console.error('Erreur chargement jeu:', error);
        return false;
    }
};
