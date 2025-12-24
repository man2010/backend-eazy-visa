// backend/routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// POST /api/appointments - Créer un rendez-vous
router.post('/', appointmentController.createAppointment);

// GET /api/appointments - Récupérer tous les rendez-vous (avec filtres optionnels)
router.get('/', appointmentController.getAllAppointments);

// PATCH /api/appointments/:id/status - Mettre à jour le statut d'un rendez-vous
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;