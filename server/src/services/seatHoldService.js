const bookingRepository = require('../repositories/bookingRepository');

const DEFAULT_HOLD_DURATION = parseInt(process.env.HOLD_DURATION_SECONDS || '300', 10);

class SeatHoldService {
  async holdSeats({ eventId, seatIds, customerSessionId, durationSeconds = DEFAULT_HOLD_DURATION }) {
    if (!eventId) {
      const err = new Error('eventId is required');
      err.statusCode = 400;
      throw err;
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      const err = new Error('At least one seat must be selected');
      err.statusCode = 400;
      throw err;
    }

    if (!customerSessionId) {
      const err = new Error('customerSessionId is required to associate temporary hold');
      err.statusCode = 400;
      throw err;
    }

    return bookingRepository.createHoldTransaction({
      eventId,
      seatIds,
      customerSessionId,
      holdDurationSeconds: durationSeconds
    });
  }

  async releaseHold(identifier) {
    if (!identifier) {
      const err = new Error('Hold token or ID is required');
      err.statusCode = 400;
      throw err;
    }

    const released = bookingRepository.releaseHold(identifier);
    return { released, identifier };
  }
}

module.exports = new SeatHoldService();
