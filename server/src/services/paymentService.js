const bookingRepository = require('../repositories/bookingRepository');

class PaymentService {
  async processSimulatedPayment({ bookingId, simulationStatus = 'SUCCESS', idempotencyKey = null, paymentMethod = 'DEMO_SIMULATION' }) {
    if (!bookingId) {
      const err = new Error('bookingId is required');
      err.statusCode = 400;
      throw err;
    }

    const normalizedStatus = simulationStatus.toUpperCase();
    if (normalizedStatus !== 'SUCCESS' && normalizedStatus !== 'FAILED') {
      const err = new Error("simulationStatus must be either 'SUCCESS' or 'FAILED'");
      err.statusCode = 400;
      throw err;
    }

    return bookingRepository.processPaymentTransaction({
      bookingId,
      simulationStatus: normalizedStatus,
      idempotencyKey,
      paymentMethod
    });
  }
}

module.exports = new PaymentService();
