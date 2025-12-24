// backend/controllers/booking.controller.js
const Booking = require('../models/booking.model');
const amadeusService = require('../services/amadeus.service');
const emailService = require('../services/email.service');

exports.createBooking = async (req, res, next) => {
  try {
    const { flightOffer, travelers, contacts, paymentMethod } = req.body;

    if (!flightOffer || !travelers || !contacts) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
      });
    }

    // Générer référence unique
    const bookingReference = `EV${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Confirmer le prix
    const pricingResult = await amadeusService.confirmPrice(flightOffer);
    if (!pricingResult.success) {
      throw new Error('Impossible de confirmer le prix');
    }

    const confirmedOffer = pricingResult.data.flightOffers[0];
    const totalPrice = parseFloat(confirmedOffer.price.total);

    // Créer la réservation
    const booking = await Booking.create({
      bookingReference,
      flightOffer: confirmedOffer,
      travelers,
      contacts,
      totalPrice,
      paymentMethod,
      bookingStatus: 'pending_payment',
    });

    console.log('✅ Réservation créée:', bookingReference);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        bookingReference,
        totalPrice,
        currency: 'XOF',
        bookingId: booking._id,
      },
    });
  } catch (error) {
    console.error('❌ Erreur création réservation:', error);
    next(error);
  }
};

exports.finalizeBooking = async (req, res, next) => {
  try {
    const { bookingId, paymentReference } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Réservation non trouvée');
    }

    // Créer commande Amadeus
    const amadeusResult = await amadeusService.createBooking(
      booking.flightOffer,
      booking.travelers,
      booking.contacts
    );

    if (!amadeusResult.success) {
      throw new Error('Échec de la création de la commande');
    }

    // Mettre à jour
    booking.amadeusOrderId = amadeusResult.data.id;
    booking.paymentReference = paymentReference;
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    // Envoyer email
    await emailService.sendFlightBookingConfirmation(booking);

    console.log('✅ Réservation finalisée:', booking.bookingReference);

    res.json({
      success: true,
      message: 'Réservation confirmée',
      data: {
        bookingReference: booking.bookingReference,
        amadeusOrderId: amadeusResult.data.id,
      },
    });
  } catch (error) {
    console.error('❌ Erreur finalisation:', error);
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({ bookingReference: reference });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};