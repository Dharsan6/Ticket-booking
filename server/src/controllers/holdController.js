const seatHoldService = require('../services/seatHoldService');

class HoldController {
  async createHold(req, res, next) {
    try {
      const { eventId, seatIds, customerSessionId, durationSeconds } = req.body;
      const result = await seatHoldService.holdSeats({
        eventId,
        seatIds,
        customerSessionId,
        durationSeconds
      });

      res.status(201).json({
        success: true,
        message: 'Seats reserved temporarily',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async releaseHold(req, res, next) {
    try {
      const { id } = req.params;
      const result = await seatHoldService.releaseHold(id);
      res.json({
        success: true,
        message: 'Seat hold released',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HoldController();
