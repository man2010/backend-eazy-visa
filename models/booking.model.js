// backend/models/booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amadeusOrderId: {
    type: String,
  },
  flightOffer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  travelers: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  contacts: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'XOF',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['wave', 'orange', 'card', 'cash'],
  },
  paymentReference: {
    type: String,
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'pending_payment', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);