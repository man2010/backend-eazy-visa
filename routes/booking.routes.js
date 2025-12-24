const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// POST /api/bookings - Créer une réservation
router.post('/', bookingController.createBooking);

// GET /api/bookings/:id - Récupérer une réservation
router.get('/:id', bookingController.getBooking);

module.exports = router;