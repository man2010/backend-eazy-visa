// backend/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// POST /api/payments/initiate - Initialiser un paiement
router.post('/initiate', paymentController.initiatePayment);

// POST /api/payments/wave/callback - Callback Wave
router.post('/wave/callback', paymentController.waveCallback);

// POST /api/payments/orange/callback - Callback Orange Money
router.post('/orange/callback', paymentController.orangeCallback);

module.exports = router;