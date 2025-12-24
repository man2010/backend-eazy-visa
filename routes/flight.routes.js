const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');

// GET /api/flights/search - Rechercher des vols
router.get('/search', flightController.searchFlights);

// POST /api/flights/confirm-price - Confirmer le prix d'un vol
router.post('/confirm-price', flightController.confirmPrice);

// POST /api/flights/seatmaps - Obtenir les plans de siège
router.post('/seatmaps', flightController.getSeatmaps);

// GET /api/flights/locations - Rechercher des lieux (aéroports, villes)
router.get('/locations', flightController.searchLocations);

module.exports = router;