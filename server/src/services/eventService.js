const bookingRepository = require('../repositories/bookingRepository');

class EventService {
  async getAllEvents(filters) {
    return bookingRepository.listEvents(filters);
  }

  async getEventById(eventId) {
    const event = bookingRepository.findEventById(eventId);
    if (!event) {
      const err = new Error(`Event with ID '${eventId}' not found`);
      err.statusCode = 404;
      throw err;
    }
    return event;
  }
}

module.exports = new EventService();
