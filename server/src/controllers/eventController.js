const eventService = require('../services/eventService');
const seatInventoryService = require('../services/seatInventoryService');

class EventController {
  async getEvents(req, res, next) {
    try {
      const { category, search } = req.query;
      const events = await eventService.getAllEvents({ category, search });
      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (err) {
      next(err);
    }
  }

  async getEventById(req, res, next) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);
      res.json({
        success: true,
        data: event
      });
    } catch (err) {
      next(err);
    }
  }

  async getEventSeats(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId, holdToken } = req.query;
      const result = await seatInventoryService.getSeatsForEvent(id, sessionId, holdToken);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventController();
