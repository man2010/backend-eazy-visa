// ========================================
// backend/services/orange.service.js
// ========================================
const axios = require('axios');
require('dotenv').config();

class OrangeMoneyService {
  constructor() {
    this.apiKey = process.env.ORANGE_API_KEY;
    this.merchantKey = process.env.ORANGE_MERCHANT_KEY;
    this.baseUrl = 'https://api.orange.com/orange-money-webpay/dev/v1';
  }

  /**
   * Générer un token d'accès
   */
  async getAccessToken() {
    try {
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        return 'DEV_TOKEN_' + Date.now();
      }

      const response = await axios.post(
        `${this.baseUrl}/token`,
        {
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${process.env.ORANGE_API_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('❌ Erreur auth Orange Money:', error);
      throw error;
    }
  }

  /**
   * Initialiser un paiement Orange Money
   */
  async initiatePayment(amount, currency, metadata) {
    try {
      console.log('🍊 Initialisation paiement Orange Money:', { amount, currency, metadata });

      // Simulation pour le développement
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        console.log('⚠️ Mode développement: Simulation Orange Money');
        return {
          success: true,
          payment_url: `http://localhost:5173/payment/orange-test?amount=${amount}`,
          payment_token: `OM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      }

      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/webpayment`,
        {
          merchant_key: this.merchantKey,
          currency: currency,
          order_id: metadata.booking_reference,
          amount: amount,
          return_url: process.env.ORANGE_CALLBACK_URL,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          notif_url: process.env.ORANGE_CALLBACK_URL,
          lang: 'fr',
          reference: metadata.booking_reference,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Paiement Orange Money initié');
      return {
        success: true,
        payment_url: response.data.payment_url,
        payment_token: response.data.payment_token,
      };
    } catch (error) {
      console.error('❌ Erreur paiement Orange Money:', error.response?.data || error.message);
      
      // En développement, retourner une simulation même en cas d'erreur
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Erreur Orange Money - Utilisation de la simulation');
        return {
          success: true,
          payment_url: `http://localhost:5173/payment/orange-test?amount=${amount}`,
          payment_token: `OM_SIM_${Date.now()}`,
        };
      }
      
      throw new Error('Erreur lors de l\'initialisation du paiement Orange Money');
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentToken) {
    try {
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        return {
          success: true,
          status: 'SUCCESS',
          data: { token: paymentToken, status: 'SUCCESS' },
        };
      }

      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/transactionstatus`,
        {
          order_id: paymentToken,
          amount: 0,
          pay_token: paymentToken,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Erreur vérification Orange Money:', error);
      throw error;
    }
  }
}

module.exports = new OrangeMoneyService();