const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const { eventId, customer, holdToken, seatIds } = req.body;
      const result = await bookingService.createBooking({
        eventId,
        customer,
        holdToken,
        seatIds
      });

      res.status(201).json({
        success: true,
        message: 'Booking created in PENDING status',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      res.json({
        success: true,
        data: booking
      });
    } catch (err) {
      next(err);
    }
  }

  async getBookings(req, res, next) {
    try {
      const { email, phone } = req.query;
      const query = email || phone;
      if (!query) {
        const bookings = await bookingService.listRecentBookings();
        return res.json({
          success: true,
          count: bookings.length,
          data: bookings
        });
      }

      const bookings = await bookingService.listBookings(query);
      res.json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (err) {
      next(err);
    }
  }

  async processPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { status = 'SUCCESS', idempotencyKey, paymentMethod } = req.body;

      const result = await paymentService.processSimulatedPayment({
        bookingId: id,
        simulationStatus: status,
        idempotencyKey,
        paymentMethod
      });

      const isSuccess = result.status === 'SUCCESS' || (result.isDuplicate && result.payment?.status === 'SUCCESS');
      res.json({
        success: isSuccess,
        message: isSuccess ? 'Payment processed successfully' : 'Payment simulation failed',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bookingService.cancelBooking(id);
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
