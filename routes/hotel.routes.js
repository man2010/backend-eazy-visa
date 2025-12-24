// backend/routes/hotel.routes.js
const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');

router.get('/search', hotelController.searchHotelsByCity);
router.post('/offers', hotelController.getHotelOffers);

module.exports = router;