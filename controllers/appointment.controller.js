// backend/controllers/appointment.controller.js
const Appointment = require('../models/appointment.model');
const emailService = require('../services/email.service');

exports.createAppointment = async (req, res, next) => {
  try {
    const { name, email, phone, date, time, service, message } = req.body;

    if (!name || !email || !phone || !date || !time || !service) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis',
      });
    }

    const appointment = await Appointment.create({
      name,
      email,
      phone,
      date,
      time,
      service,
      message: message || '',
      status: 'pending',
    });

    // Envoyer emails
    await emailService.sendAppointmentConfirmation(appointment);
    await emailService.notifyAdminNewAppointment(appointment);

    console.log('✅ Rendez-vous créé:', appointment._id);

    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      data: appointment,
    });
  } catch (error) {
    console.error('❌ Erreur création rendez-vous:', error);
    next(error);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);

    const appointments = await Appointment.find(filter)
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide',
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Rendez-vous non trouvé',
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};