// ========================================
// backend/services/wave.service.js
// ========================================
const axios = require('axios');
require('dotenv').config();

class WaveService {
  constructor() {
    this.apiKey = process.env.WAVE_API_KEY;
    this.apiSecret = process.env.WAVE_API_SECRET;
    this.baseUrl = 'https://api.wave.com/v1'; // URL fictive - à adapter
  }

  /**
   * Initialiser un paiement Wave
   */
  async initiatePayment(amount, currency, metadata) {
    try {
      // IMPORTANT: Wave n'a pas encore d'API publique bien documentée
      // Cette implémentation est un exemple - adaptez selon la doc officielle
      
      console.log('📱 Initialisation paiement Wave:', { amount, currency, metadata });

      // Simulation pour le développement
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        console.log('⚠️ Mode développement: Simulation Wave');
        return {
          success: true,
          payment_url: `http://localhost:5173/payment/wave-test?amount=${amount}`,
          payment_id: `WAVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/checkout/sessions`,
        {
          amount: amount,
          currency: currency,
          callback_url: process.env.WAVE_CALLBACK_URL,
          metadata: metadata,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Paiement Wave initié');
      return {
        success: true,
        payment_url: response.data.wave_launch_url,
        payment_id: response.data.id,
      };
    } catch (error) {
      console.error('❌ Erreur paiement Wave:', error.response?.data || error.message);
      
      // En développement, retourner une simulation même en cas d'erreur
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Erreur Wave - Utilisation de la simulation');
        return {
          success: true,
          payment_url: `http://localhost:5173/payment/wave-test?amount=${amount}`,
          payment_id: `WAVE_SIM_${Date.now()}`,
        };
      }
      
      throw new Error('Erreur lors de l\'initialisation du paiement Wave');
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentId) {
    try {
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        return {
          success: true,
          status: 'SUCCESS',
          data: { id: paymentId, status: 'SUCCESS' },
        };
      }

      const response = await axios.get(
        `${this.baseUrl}/checkout/sessions/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Erreur vérification Wave:', error);
      throw error;
    }
  }
}

module.exports = new WaveService();

