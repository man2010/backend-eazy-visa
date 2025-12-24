// backend/controllers/contact.controller.js
const emailService = require('../services/email.service');

exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Nom, email et message sont obligatoires',
      });
    }

    // Envoyer email à l'admin
    await emailService.notifyAdminContactMessage({ name, email, subject, message });

    // Envoyer confirmation au client
    await emailService.sendContactConfirmation({ name, email });

    console.log('✅ Message de contact reçu et emails envoyés');

    res.json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons rapidement.',
    });
  } catch (error) {
    console.error('❌ Erreur envoi message contact:', error);
    next(error);
  }
};