const express = require('express');
const router = express.Router();
const { sendOrderConfirmation } = require('../controllers/orderController');

// Route pour la confirmation de commande et l'envoi d'email
router.post('/', async (req, res) => {
  try {
    await sendOrderConfirmation(req, res);
  } catch (error) {
    console.error('Erreur lors de la confirmation de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation de la commande' });
  }
});

module.exports = router;
