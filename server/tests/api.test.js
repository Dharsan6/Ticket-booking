import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/database/db';
import seedDatabase from '../src/database/seed';

describe('EventEase Backend API Comprehensive Test Suite', () => {
  beforeAll(() => {
    // Clean prior test records to ensure isolated, repeatable test run
    db.prepare("DELETE FROM tickets WHERE id NOT LIKE 'TKT-DEMO-%'").run();
    db.prepare("DELETE FROM payments WHERE id NOT LIKE 'PAY-DEMO-%'").run();
    db.prepare("DELETE FROM booking_seats WHERE booking_id NOT LIKE 'BK-DEMO-%'").run();
    db.prepare("DELETE FROM bookings WHERE id NOT LIKE 'BK-DEMO-%'").run();
    db.prepare("DELETE FROM seat_holds WHERE customer_session_id NOT LIKE '%seed%'").run();
    seedDatabase();
  });

  // 1. Health Endpoint
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.database).toBe('CONNECTED');
  });

  // 2. Event Listing and Filtering
  it('GET /api/events should return list of active events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
    
    const first = res.body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('venue_name');
    expect(first).toHaveProperty('available_seats_count');
  });

  it('GET /api/events?category=Music should filter events by category', async () => {
    const res = await request(app).get('/api/events?category=Music');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const evt of res.body.data) {
      expect(evt.category.toLowerCase()).toBe('music');
    }
  });

  it('GET /api/events?search=Coimbatore should search events by city/venue/title', async () => {
    const res = await request(app).get('/api/events?search=Coimbatore');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 3. Event Details
  it('GET /api/events/:id should return single event details', async () => {
    const res = await request(app).get('/api/events/evt_ai_summit_2026');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('evt_ai_summit_2026');
    expect(res.body.data.title).toContain('Global AI');
  });

  it('GET /api/events/unknown-id should return 404', async () => {
    const res = await request(app).get('/api/events/non_existent_event_id');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 4. Seat Inventory Retrieval
  it('GET /api/events/:id/seats should return seats and availability statistics', async () => {
    const res = await request(app).get('/api/events/evt_ai_summit_2026/seats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('seats');
    expect(res.body.data.seats.length).toBe(60);
    expect(res.body.data.stats).toHaveProperty('available');
    expect(res.body.data.stats).toHaveProperty('booked');
  });

  // 5. Temporary Seat Hold Creation
  let testHoldToken = null;
  const testSessionId = 'session_test_user_alpha';
  const testSeatId1 = 'seat_venue_chennai_trade_C1';
  const testSeatId2 = 'seat_venue_chennai_trade_C2';

  it('POST /api/holds should reserve seats with 5-minute expiry', async () => {
    const res = await request(app)
      .post('/api/holds')
      .send({
        eventId: 'evt_ai_summit_2026',
        seatIds: [testSeatId1, testSeatId2],
        customerSessionId: testSessionId,
        durationSeconds: 300
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('holdToken');
    expect(res.body.data.seatIds).toEqual([testSeatId1, testSeatId2]);
    expect(res.body.data.totalAmount).toBeGreaterThan(0);
    testHoldToken = res.body.data.holdToken;
  });

  // 6. Concurrency Protection: Another session trying to hold the same seat
  it('POST /api/holds should reject hold attempt by another user for already held seat (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/holds')
      .send({
        eventId: 'evt_ai_summit_2026',
        seatIds: [testSeatId1], // already held by session_test_user_alpha
        customerSessionId: 'session_test_user_beta'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('currently held');
  });

  // 7. Booking Creation from Active Hold
  let createdBookingId = null;

  it('POST /api/bookings should create booking in PENDING status from valid hold', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        eventId: 'evt_ai_summit_2026',
        customer: {
          fullName: 'Arun Kumar',
          email: 'arun.k@example.com',
          phone: '+91 9443322110'
        },
        holdToken: testHoldToken,
        seatIds: [testSeatId1, testSeatId2]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('bookingId');
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.seats.length).toBe(2);
    createdBookingId = res.body.data.bookingId;
  });

  // 8. Rejection of Invalid or Expired Hold
  it('POST /api/bookings should fail when given invalid hold token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        eventId: 'evt_ai_summit_2026',
        customer: {
          fullName: 'Fake User',
          email: 'fake@example.com',
          phone: '+91 9000000000'
        },
        holdToken: 'invalid_hold_token_123',
        seatIds: [testSeatId1]
      });

    expect(res.status).toBe(410);
    expect(res.body.success).toBe(false);
  });

  // 9. Simulated Successful Payment & Ticket Issuance
  let issuedTicketCode = null;

  it('POST /api/bookings/:id/payments (SUCCESS) should confirm booking and issue unique tickets', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdBookingId}/payments`)
      .send({
        status: 'SUCCESS',
        idempotencyKey: 'idemp_key_test_001'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUCCESS');
    expect(res.body.data.tickets.length).toBe(2);
    expect(res.body.data.tickets[0]).toHaveProperty('ticketCode');
    expect(res.body.data.tickets[0]).toHaveProperty('qrData');
    issuedTicketCode = res.body.data.tickets[0].ticketCode;

    // Verify booking is now CONFIRMED in DB
    const checkBooking = await request(app).get(`/api/bookings/${createdBookingId}`);
    expect(checkBooking.body.data.status).toBe('CONFIRMED');
  });

  // 10. Idempotency Check: Repeating the same payment submission
  it('POST /api/bookings/:id/payments should return existing result for duplicate idempotency key', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdBookingId}/payments`)
      .send({
        status: 'SUCCESS',
        idempotencyKey: 'idemp_key_test_001'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isDuplicate).toBe(true);
  });

  // 11. Seat Map Shows Booked Seats
  it('Seat map should now reflect newly booked seats as BOOKED', async () => {
    const res = await request(app).get('/api/events/evt_ai_summit_2026/seats');
    const seat1 = res.body.data.seats.find(s => s.id === testSeatId1);
    expect(seat1.status).toBe('BOOKED');
  });

  // 12. Ticket Verification via QR Code / Ticket Code
  it('GET /api/tickets/:id/verify should verify valid ticket', async () => {
    const res = await request(app).get(`/api/tickets/${issuedTicketCode}/verify`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket.ticketCode).toBe(issuedTicketCode);
    expect(res.body.data.ticket.attendeeName).toBe('Arun Kumar');
    expect(res.body.data.ticket.status).toBe('VALID');
  });

  it('GET /api/tickets/invalid_code/verify should return 404 for unknown ticket', async () => {
    const res = await request(app).get('/api/tickets/INVALID-TICKET-CODE/verify');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 13. Simulated Failed Payment Handling
  it('Simulated FAILED payment should mark booking CANCELLED and release seats', async () => {
    const seatToFail = 'seat_venue_codissia_D5';
    const failSessionId = 'session_fail_tester';

    // 1. Hold seat
    const holdRes = await request(app)
      .post('/api/holds')
      .send({
        eventId: 'evt_tamil_rock_2026',
        seatIds: [seatToFail],
        customerSessionId: failSessionId
      });
    expect(holdRes.status).toBe(201);
    const holdToken = holdRes.body.data.holdToken;

    // 2. Create booking
    const bookingRes = await request(app)
      .post('/api/bookings')
      .send({
        eventId: 'evt_tamil_rock_2026',
        customer: {
          fullName: 'Priya Mani',
          email: 'priya.m@example.com',
          phone: '+91 9988776655'
        },
        holdToken,
        seatIds: [seatToFail]
      });
    expect(bookingRes.status).toBe(201);
    const failBookingId = bookingRes.body.data.bookingId;

    // 3. Simulate payment FAILURE
    const payRes = await request(app)
      .post(`/api/bookings/${failBookingId}/payments`)
      .send({
        status: 'FAILED',
        idempotencyKey: 'idemp_fail_001'
      });
    expect(payRes.status).toBe(200);
    expect(payRes.body.data.status).toBe('FAILED');

    // 4. Verify seat is released and available again
    const seatRes = await request(app).get('/api/events/evt_tamil_rock_2026/seats');
    const checkedSeat = seatRes.body.data.seats.find(s => s.id === seatToFail);
    expect(checkedSeat.status).toBe('AVAILABLE');
  });

  // 14. Booking Cancellation & Seat Release
  it('POST /api/bookings/:id/cancel should cancel confirmed booking, void tickets, and release seats', async () => {
    const cancelRes = await request(app).post(`/api/bookings/${createdBookingId}/cancel`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);

    // Check booking is CANCELLED
    const bookingRes = await request(app).get(`/api/bookings/${createdBookingId}`);
    expect(bookingRes.body.data.status).toBe('CANCELLED');

    // Check tickets are voided
    const ticketRes = await request(app).get(`/api/tickets/${issuedTicketCode}/verify`);
    expect(ticketRes.body.data.isValid).toBe(false);
    expect(ticketRes.body.data.status).toBe('CANCELLED');

    // Check seat is available again
    const seatsRes = await request(app).get('/api/events/evt_ai_summit_2026/seats');
    const seat1 = seatsRes.body.data.seats.find(s => s.id === testSeatId1);
    expect(seat1.status).toBe('AVAILABLE');
  });

  // 15. Customer Bookings History Lookup
  it('GET /api/bookings?email=... should return customer bookings list', async () => {
    const res = await request(app).get('/api/bookings?email=rajesh.k@example.com');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('event_title');
    expect(res.body.data[0]).toHaveProperty('seats');
  });
});
