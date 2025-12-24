// backend/controllers/hotel.controller.js
const amadeusService = require('../services/amadeus.service');

exports.searchHotelsByCity = async (req, res, next) => {
  try {
    const { cityCode, ratings, amenities } = req.query;

    if (!cityCode) {
      return res.status(400).json({ success: false, error: 'cityCode requis' });
    }

    const result = await amadeusService.searchHotelsByCity({
      cityCode: cityCode.toUpperCase(),
      ratings: ratings ? ratings.split(',') : undefined,
      amenities: amenities ? amenities.split(',') : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getHotelOffers = async (req, res, next) => {
  try {
    const { hotelIds, checkInDate, checkOutDate, adults = 1 } = req.body;

    if (!hotelIds || !checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, error: 'Données manquantes' });
    }

    const result = await amadeusService.getHotelOffers({
      hotelIds,
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};