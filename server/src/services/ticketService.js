const bookingRepository = require('../repositories/bookingRepository');

class TicketService {
  async verifyTicket(ticketCodeOrId) {
    if (!ticketCodeOrId) {
      const err = new Error('Ticket code or ID is required for verification');
      err.statusCode = 400;
      throw err;
    }

    const ticket = bookingRepository.findTicketByCodeOrId(ticketCodeOrId);
    if (!ticket) {
      return {
        isValid: false,
        status: 'NOT_FOUND',
        message: 'No ticket was found matching this identifier or QR code.'
      };
    }

    const isValid = ticket.ticket_status === 'VALID' && ticket.booking_status === 'CONFIRMED';

    return {
      isValid,
      status: ticket.ticket_status,
      ticket: {
        ticketId: ticket.ticket_id,
        ticketCode: ticket.ticket_code,
        status: ticket.ticket_status,
        issuedAt: ticket.issued_at,
        attendeeName: ticket.attendee_name,
        attendeeEmail: ticket.attendee_email,
        eventTitle: ticket.event_title,
        eventDate: ticket.event_date,
        eventTime: ticket.event_time,
        eventCategory: ticket.event_category,
        venueName: ticket.venue_name,
        venueCity: ticket.venue_city,
        venueAddress: ticket.venue_address,
        seatNumber: ticket.seat_number,
        seatTier: ticket.seat_tier,
        bookingId: ticket.booking_id,
        bookingStatus: ticket.booking_status
      },
      message: isValid 
        ? 'Ticket is VALID and verified for entry.' 
        : `Ticket is ${ticket.ticket_status} (Booking status: ${ticket.booking_status}).`
    };
  }
}

module.exports = new TicketService();
