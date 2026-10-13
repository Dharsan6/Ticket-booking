const bookingRepository = require('../repositories/bookingRepository');

class SeatInventoryService {
  async getSeatsForEvent(eventId, currentSessionId, currentHoldToken) {
    const event = bookingRepository.findEventById(eventId);
    if (!event) {
      const err = new Error(`Event with ID '${eventId}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const seats = bookingRepository.getSeatsForEvent(eventId, currentSessionId, currentHoldToken);
    
    // Summary statistics
    const total = seats.length;
    const available = seats.filter(s => s.status === 'AVAILABLE').length;
    const held = seats.filter(s => s.status === 'HELD' || s.status === 'HELD_BY_YOU').length;
    const booked = seats.filter(s => s.status === 'BOOKED').length;

    return {
      eventId,
      venueId: event.venue_id,
      venueName: event.venue_name,
      basePrice: event.base_price,
      stats: { total, available, held, booked },
      seats
    };
  }

  async cleanExpiredHolds() {
    return bookingRepository.releaseExpiredHolds();
  }
}

module.exports = new SeatInventoryService();
