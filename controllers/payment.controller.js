// backend/controllers/payment.controller.js
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const waveService = require('../services/wave.service');
const orangeService = require('../services/orange.service');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée',
      });
    }

    let paymentResult;

    if (paymentMethod === 'wave') {
      paymentResult = await waveService.initiatePayment(amount, 'XOF', {
        booking_id: bookingId,
        booking_reference: booking.bookingReference,
      });
    } else if (paymentMethod === 'orange') {
      paymentResult = await orangeService.initiatePayment(amount, 'XOF', {
        booking_id: bookingId,
        booking_reference: booking.bookingReference,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Méthode de paiement non supportée',
      });
    }

    // Enregistrer
    await Payment.create({
      bookingId,
      amount,
      paymentMethod,
      paymentReference: paymentResult.payment_id || paymentResult.payment_token,
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        paymentUrl: paymentResult.payment_url,
        paymentId: paymentResult.payment_id || paymentResult.payment_token,
      },
    });
  } catch (error) {
    console.error('❌ Erreur initialisation paiement:', error);
    next(error);
  }
};

exports.waveCallback = async (req, res, next) => {
  try {
    const { payment_id, status } = req.body;

    console.log('📞 Callback Wave reçu:', { payment_id, status });

    await Payment.findOneAndUpdate(
      { paymentReference: payment_id },
      { 
        status: status === 'SUCCESS' ? 'paid' : 'failed',
        providerResponse: req.body,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur callback Wave:', error);
    next(error);
  }
};

exports.orangeCallback = async (req, res, next) => {
  try {
    const { order_id, status } = req.body;

    console.log('📞 Callback Orange Money reçu:', { order_id, status });

    await Payment.findOneAndUpdate(
      { paymentReference: order_id },
      { 
        status: status === 'SUCCESS' ? 'paid' : 'failed',
        providerResponse: req.body,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur callback Orange Money:', error);
    next(error);
  }
};