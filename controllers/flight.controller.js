const amadeusService = require('../services/amadeus.service');

/**
 * Rechercher des vols
 */
exports.searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, adults } = req.query;

    // Validation basique
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants: origin, destination, departureDate sont requis',
      });
    }

    const searchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: returnDate || null,
      adults: parseInt(adults) || 1,
    };

    const result = await amadeusService.searchFlights(searchParams);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Confirmer le prix d'un vol
 */
exports.confirmPrice = async (req, res, next) => {
  try {
    const { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({
        success: false,
        error: 'flightOffer est requis',
      });
    }

    const result = await amadeusService.confirmPrice(flightOffer);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les plans de siège
 */
exports.getSeatmaps = async (req, res, next) => {
  try {
    const { flightOffers } = req.body;

    if (!flightOffers || !Array.isArray(flightOffers)) {
      return res.status(400).json({
        success: false,
        error: 'flightOffers array est requis',
      });
    }

    const result = await amadeusService.getSeatmaps(flightOffers);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
  * Rechercher des lieux (aéroports, villes)
 */

exports.searchLocations = async (req, res, next) => {
  try {
    const { keyword, subType = 'AIRPORT,CITY' } = req.query;
    if (!keyword) return res.status(400).json({ success: false, error: 'keyword requis' });

    const result = await amadeusService.searchLocations({ keyword: keyword.toString(), subType });
    res.json(result);
  } catch (error) {
    next(error);
  }
};