const ticketService = require('../services/ticketService');

class TicketController {
  async verifyTicket(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ticketService.verifyTicket(id);
      
      const statusCode = result.status === 'NOT_FOUND' ? 404 : 200;
      res.status(statusCode).json({
        success: result.isValid,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketController();
