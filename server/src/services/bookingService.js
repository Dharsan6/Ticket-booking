const bookingRepository = require('../repositories/bookingRepository');

class BookingService {
  async createBooking({ eventId, customer, holdToken, seatIds }) {
    if (!eventId) {
      const err = new Error('eventId is required');
      err.statusCode = 400;
      throw err;
    }

    if (!holdToken) {
      const err = new Error('holdToken is required. Please reserve seats first.');
      err.statusCode = 400;
      throw err;
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      const err = new Error('seatIds array is required');
      err.statusCode = 400;
      throw err;
    }

    if (!customer || !customer.fullName || !customer.email || !customer.phone) {
      const err = new Error('Customer details (fullName, email, phone) are required');
      err.statusCode = 400;
      throw err;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email.trim())) {
      const err = new Error('Invalid email address format');
      err.statusCode = 400;
      throw err;
    }

    return bookingRepository.createBookingTransaction({
      eventId,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim()
      },
      holdToken,
      seatIds
    });
  }

  async getBookingById(bookingId) {
    const booking = bookingRepository.findBookingById(bookingId);
    if (!booking) {
      const err = new Error(`Booking with ID '${bookingId}' not found`);
      err.statusCode = 404;
      throw err;
    }
    return booking;
  }

  async listBookings(emailOrPhone) {
    if (!emailOrPhone) {
      const err = new Error('Customer email or phone is required to retrieve bookings');
      err.statusCode = 400;
      throw err;
    }
    return bookingRepository.listBookingsByCustomer(emailOrPhone.trim());
  }

  async listRecentBookings(limit = 25) {
    return bookingRepository.listRecentBookings(limit);
  }

  async cancelBooking(bookingId) {
    return bookingRepository.cancelBookingTransaction(bookingId);
  }
}

module.exports = new BookingService();
