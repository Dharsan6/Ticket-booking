const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/payments', bookingController.processPayment);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
