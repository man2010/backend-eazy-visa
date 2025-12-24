require('dotenv').config();

module.exports = {
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  apiUrl: process.env.AMADEUS_API_URL || 'https://test.api.amadeus.com',
  
  // Configuration des endpoints
  endpoints: {
    oauth: '/v1/security/oauth2/token',
    flightOffers: '/v2/shopping/flight-offers',
    flightPricing: '/v1/shopping/flight-offers/pricing',
    flightBooking: '/v1/booking/flight-orders',
    seatmaps: '/v1/shopping/seatmaps',
  },
  
  // Configuration par défaut
  defaults: {
    currencyCode: 'XOF', // Franc CFA
    maxResults: 20,
    timeout: 30000, // 30 secondes
  }
};