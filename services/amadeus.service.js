const axios = require('axios');
const amadeusConfig = require('../config/amadeus.config');

class AmadeusService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Obtenir le token d'accès OAuth2
   */
  async getAccessToken() {
    try {
      // Vérifier si le token est encore valide
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: amadeusConfig.clientId,
        client_secret: amadeusConfig.clientSecret,
      });

      const response = await axios.post(
        `${amadeusConfig.apiUrl}${amadeusConfig.endpoints.oauth}`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Le token expire dans expires_in secondes (généralement 1800 = 30 min)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Token Amadeus obtenu avec succès');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Erreur authentification Amadeus:', error.response?.data || error.message);
      throw new Error('Échec de l\'authentification Amadeus');
    }
  }

  /**
   * Rechercher des vols
   */
  async searchFlights(searchParams) {
    try {
      const token = await this.getAccessToken();

      const params = {
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults || 1,
        currencyCode: amadeusConfig.defaults.currencyCode,
        max: searchParams.max || amadeusConfig.defaults.maxResults,
      };

      // Ajouter la date de retour si c'est un aller-retour
      if (searchParams.returnDate) {
        params.returnDate = searchParams.returnDate;
      }

      const response = await axios.get(
        `${amadeusConfig.apiUrl}${amadeusConfig.endpoints.flightOffers}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
          timeout: amadeusConfig.defaults.timeout,
        }
      );

      console.log(`✅ ${response.data.data.length} vols trouvés`);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error('❌ Erreur recherche vols:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0]?.detail || 'Erreur lors de la recherche de vols');
    }
  }

  /**
   * Confirmer le prix d'un vol
   */
  async confirmPrice(flightOffer) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${amadeusConfig.apiUrl}${amadeusConfig.endpoints.flightPricing}`,
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: amadeusConfig.defaults.timeout,
        }
      );

      console.log('✅ Prix confirmé');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Erreur confirmation prix:', error.response?.data || error.message);
      throw new Error('Erreur lors de la confirmation du prix');
    }
  }

  /**
   * Créer une réservation
   */
  async createBooking(flightOffer, travelers, contacts) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${amadeusConfig.apiUrl}${amadeusConfig.endpoints.flightBooking}`,
        {
          data: {
            type: 'flight-order',
            flightOffers: [flightOffer],
            travelers: travelers,
            contacts: contacts,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: amadeusConfig.defaults.timeout,
        }
      );

      console.log('✅ Réservation créée:', response.data.data.id);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Erreur création réservation:', error.response?.data || error.message);
      throw new Error('Erreur lors de la création de la réservation');
    }
  }

  /**
   * Obtenir les plans de siège
   */
  async getSeatmaps(flightOffers) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${amadeusConfig.apiUrl}${amadeusConfig.endpoints.seatmaps}`,
        {
          data: flightOffers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Erreur récupération seatmaps:', error.response?.data || error.message);
      throw new Error('Erreur lors de la récupération des plans de siège');
    }
  }

  // Ajoute ces méthodes dans ta classe AmadeusService

  async searchHotelsByCity({ cityCode, ratings, amenities }) {
    try {
      const token = await this.getAccessToken();

      let url = `${amadeusConfig.apiUrl}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=50&radiusUnit=KM`;

      if (ratings) url += `&ratings=${ratings.join(',')}`;
      if (amenities) url += `&amenities=${amenities.join(',')}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: amadeusConfig.defaults.timeout,
      });

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('Erreur recherche hôtels:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.errors?.[0]?.detail || 'Erreur recherche hôtels' };
    }
  }

  async getHotelOffers({ hotelIds, checkInDate, checkOutDate, adults = 1 }) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${amadeusConfig.apiUrl}/v3/shopping/hotel-offers`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            hotelIds: hotelIds.join(','),
            checkInDate,
            checkOutDate,
            adults,
            currency: amadeusConfig.defaults.currencyCode,
            bestRateOnly: true,
          },
          timeout: amadeusConfig.defaults.timeout,
        }
      );

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('Erreur offres hôtels:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.errors?.[0]?.detail || 'Aucune offre disponible' };
    }
  }

  async searchLocations({ keyword, subType }) {
  try {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `${amadeusConfig.apiUrl}/v1/reference-data/locations`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword, subType, page: { limit: 10 } },
      }
    );
    return { success: true, data: response.data.data || [] };
  } catch (error) {
    console.error('Erreur recherche locations:', error.response?.data || error.message);
    return { success: false, error: 'Erreur recherche aéroports' };
  }
  }
}

// Export une instance unique (Singleton)
module.exports = new AmadeusService();