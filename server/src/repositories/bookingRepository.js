const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class BookingRepository {
  /**
   * Release any expired active seat holds
   */
  releaseExpiredHolds() {
    const stmt = db.prepare(`
      UPDATE seat_holds
      SET status = 'EXPIRED'
      WHERE status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
    `);
    const result = stmt.run();
    return result.changes;
  }

  /**
   * List events with optional category and search filters
   */
  listEvents({ category, search } = {}) {
    let sql = `
      SELECT 
        e.*,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address,
        v.total_capacity AS total_capacity,
        (
          SELECT COUNT(*) 
          FROM seats s 
          WHERE s.venue_id = e.venue_id
        ) AS total_seats,
        (
          SELECT COUNT(DISTINCT bs.seat_id)
          FROM booking_seats bs
          JOIN bookings b ON bs.booking_id = b.id
          WHERE bs.event_id = e.id AND b.status = 'CONFIRMED'
        ) AS booked_seats_count
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      WHERE e.status = 'ACTIVE'
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ` AND LOWER(e.category) = LOWER(?)`;
      params.push(category);
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(e.title) LIKE ? OR LOWER(v.name) LIKE ? OR LOWER(v.city) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY e.date ASC`;

    const events = db.prepare(sql).all(...params);
    return events.map(e => ({
      ...e,
      available_seats_count: Math.max(0, e.total_seats - e.booked_seats_count)
    }));
  }

  /**
   * Get single event by ID with venue details
   */
  findEventById(eventId) {
    const event = db.prepare(`
      SELECT 
        e.*,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address,
        v.total_capacity AS total_capacity
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      WHERE e.id = ?
    `).get(eventId);

    return event || null;
  }

  /**
   * Get all seats for an event with real-time availability status
   * States: 'AVAILABLE', 'HELD', 'BOOKED', or 'HELD_BY_YOU'
   */
  getSeatsForEvent(eventId, currentSessionId = null, currentHoldToken = null) {
    // 1. Lazy cleanup of expired holds
    this.releaseExpiredHolds();

    const event = this.findEventById(eventId);
    if (!event) return null;

    // Fetch all venue seats
    const allSeats = db.prepare(`
      SELECT 
        s.id,
        s.venue_id,
        s.seat_number,
        s.seat_row,
        s.tier,
        s.price_multiplier,
        ROUND(? * s.price_multiplier, 2) AS calculated_price
      FROM seats s
      WHERE s.venue_id = ?
      ORDER BY s.seat_row ASC, CAST(SUBSTR(s.seat_number, 2) AS INTEGER) ASC
    `).all(event.base_price, event.venue_id);

    // Fetch confirmed booked seat IDs for this event
    const bookedSeatRows = db.prepare(`
      SELECT bs.seat_id
      FROM booking_seats bs
      JOIN bookings b ON bs.booking_id = b.id
      WHERE bs.event_id = ? AND b.status = 'CONFIRMED'
    `).all(eventId);
    const bookedSeatIds = new Set(bookedSeatRows.map(r => r.seat_id));

    // Fetch currently active unexpired holds for this event
    const activeHoldRows = db.prepare(`
      SELECT seat_id, hold_token, customer_session_id, expires_at
      FROM seat_holds
      WHERE event_id = ? AND status = 'ACTIVE' AND datetime(expires_at) > datetime('now')
    `).all(eventId);
    
    const holdsBySeatId = new Map();
    for (const h of activeHoldRows) {
      holdsBySeatId.set(h.seat_id, h);
    }

    // Determine status for each seat
    return allSeats.map(seat => {
      let status = 'AVAILABLE';
      let holdExpiresAt = null;

      if (bookedSeatIds.has(seat.id)) {
        status = 'BOOKED';
      } else if (holdsBySeatId.has(seat.id)) {
        const hold = holdsBySeatId.get(seat.id);
        holdExpiresAt = hold.expires_at;
        const isCurrentHolder = 
          (currentHoldToken && hold.hold_token === currentHoldToken) ||
          (currentSessionId && hold.customer_session_id === currentSessionId);

        status = isCurrentHolder ? 'HELD_BY_YOU' : 'HELD';
      }

      return {
        ...seat,
        status,
        holdExpiresAt
      };
    });
  }

  /**
   * Acquire a temporary seat hold for one or more seats
   * Uses an atomic transaction to prevent race conditions
   */
  createHoldTransaction({ eventId, seatIds, customerSessionId, holdDurationSeconds = 300 }) {
    this.releaseExpiredHolds();

    const holdToken = `hold_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + holdDurationSeconds * 1000).toISOString();

    const transaction = db.transaction(() => {
      // 1. Verify event exists
      const event = db.prepare('SELECT id, venue_id, base_price FROM events WHERE id = ?').get(eventId);
      if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
      }

      // 2. Check if all seats belong to this venue
      const placeholders = seatIds.map(() => '?').join(',');
      const validSeats = db.prepare(`
        SELECT id, seat_number, price_multiplier FROM seats 
        WHERE venue_id = ? AND id IN (${placeholders})
      `).all(event.venue_id, ...seatIds);

      if (validSeats.length !== seatIds.length) {
        const err = new Error('One or more selected seats do not belong to the event venue');
        err.statusCode = 400;
        throw err;
      }

      // 3. Concurrency check: Check if any seat is already CONFIRMED booked
      const bookedConflicts = db.prepare(`
        SELECT bs.seat_id, s.seat_number
        FROM booking_seats bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.event_id = ? AND b.status = 'CONFIRMED' AND bs.seat_id IN (${placeholders})
      `).all(eventId, ...seatIds);

      if (bookedConflicts.length > 0) {
        const conflictSeats = bookedConflicts.map(c => c.seat_number).join(', ');
        const err = new Error(`Seat(s) [${conflictSeats}] are already booked`);
        err.statusCode = 409;
        err.conflictSeats = bookedConflicts.map(c => c.seat_id);
        throw err;
      }

      // 4. Concurrency check: Check if any seat is already actively held by another session
      const activeHoldConflicts = db.prepare(`
        SELECT sh.seat_id, s.seat_number, sh.customer_session_id
        FROM seat_holds sh
        JOIN seats s ON sh.seat_id = s.id
        WHERE sh.event_id = ? 
          AND sh.status = 'ACTIVE' 
          AND datetime(sh.expires_at) > datetime('now')
          AND sh.seat_id IN (${placeholders})
          AND sh.customer_session_id != ?
      `).all(eventId, ...seatIds, customerSessionId);

      if (activeHoldConflicts.length > 0) {
        const conflictSeats = activeHoldConflicts.map(c => c.seat_number).join(', ');
        const err = new Error(`Seat(s) [${conflictSeats}] are currently held by another user`);
        err.statusCode = 409;
        err.conflictSeats = activeHoldConflicts.map(c => c.seat_id);
        throw err;
      }

      // 5. Release any existing holds previously held by this same customer session for these seats
      db.prepare(`
        UPDATE seat_holds
        SET status = 'RELEASED'
        WHERE event_id = ? AND customer_session_id = ? AND status = 'ACTIVE'
      `).run(eventId, customerSessionId);

      // 6. Insert new holds
      const insertStmt = db.prepare(`
        INSERT INTO seat_holds (id, event_id, seat_id, hold_token, customer_session_id, expires_at, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `);

      const heldSeatDetails = [];
      let totalAmount = 0;

      for (const seat of validSeats) {
        const holdId = `sh_${uuidv4()}`;
        insertStmt.run(holdId, eventId, seat.id, holdToken, customerSessionId, expiresAt);
        const seatPrice = Math.round(event.base_price * seat.price_multiplier);
        totalAmount += seatPrice;
        heldSeatDetails.push({
          seatId: seat.id,
          seatNumber: seat.seat_number,
          tier: seat.tier,
          price: seatPrice
        });
      }

      return {
        holdToken,
        customerSessionId,
        eventId,
        seatIds,
        heldSeatDetails,
        totalAmount,
        expiresAt,
        durationSeconds: holdDurationSeconds
      };
    });

    return transaction();
  }

  /**
   * Release hold by token or ID
   */
  releaseHold(identifier) {
    const stmt = db.prepare(`
      UPDATE seat_holds 
      SET status = 'RELEASED' 
      WHERE (hold_token = ? OR id = ?) AND status = 'ACTIVE'
    `);
    const result = stmt.run(identifier, identifier);
    return result.changes > 0;
  }

  /**
   * Find hold by token
   */
  findHoldByToken(holdToken) {
    this.releaseExpiredHolds();
    return db.prepare(`
      SELECT * FROM seat_holds 
      WHERE hold_token = ? AND status = 'ACTIVE' AND datetime(expires_at) > datetime('now')
    `).all(holdToken);
  }

  /**
   * Upsert customer
   */
  findOrCreateCustomer({ fullName, email, phone }) {
    const existing = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
    if (existing) {
      db.prepare(`
        UPDATE customers 
        SET full_name = ?, phone = ? 
        WHERE id = ?
      `).run(fullName, phone, existing.id);
      return { ...existing, full_name: fullName, phone };
    }

    const id = `cust_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    db.prepare(`
      INSERT INTO customers (id, full_name, email, phone)
      VALUES (?, ?, ?, ?)
    `).run(id, fullName, email, phone);

    return { id, full_name: fullName, email, phone };
  }

  /**
   * Create Booking in PENDING status
   * Validates hold_token and calculates prices server-side
   */
  createBookingTransaction({ eventId, customer, holdToken, seatIds }) {
    this.releaseExpiredHolds();

    const transaction = db.transaction(() => {
      // 1. Verify Event
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
      if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
      }

      // 2. Validate holdToken
      const activeHolds = db.prepare(`
        SELECT sh.*, s.seat_number, s.tier, s.price_multiplier
        FROM seat_holds sh
        JOIN seats s ON sh.seat_id = s.id
        WHERE sh.hold_token = ? 
          AND sh.event_id = ? 
          AND sh.status = 'ACTIVE' 
          AND datetime(sh.expires_at) > datetime('now')
      `).all(holdToken, eventId);

      if (activeHolds.length === 0) {
        const err = new Error('Seat hold has expired or is invalid. Please select seats again.');
        err.statusCode = 410; // Gone / Expired
        throw err;
      }

      const heldSeatIds = activeHolds.map(h => h.seat_id);
      const isSubset = seatIds.every(id => heldSeatIds.includes(id));
      if (!isSubset || seatIds.length === 0) {
        const err = new Error('Seats do not match active hold reservation');
        err.statusCode = 400;
        throw err;
      }

      // 3. Upsert Customer
      const cust = this.findOrCreateCustomer(customer);

      // 4. Calculate total amount server-side based on event.base_price & multipliers
      let totalAmount = 0;
      const seatsToBook = [];
      for (const seatId of seatIds) {
        const seat = activeHolds.find(h => h.seat_id === seatId);
        const price = Math.round(event.base_price * seat.price_multiplier);
        totalAmount += price;
        seatsToBook.push({
          seatId: seat.seat_id,
          seatNumber: seat.seat_number,
          tier: seat.tier,
          price
        });
      }

      // 5. Insert Booking
      const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      db.prepare(`
        INSERT INTO bookings (id, event_id, customer_id, total_amount, currency, status, hold_token)
        VALUES (?, ?, ?, ?, 'INR', 'PENDING', ?)
      `).run(bookingId, eventId, cust.id, totalAmount, holdToken);

      // 6. Insert Booking Seats
      const insertBookingSeat = db.prepare(`
        INSERT INTO booking_seats (id, booking_id, seat_id, event_id, price_at_booking)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const s of seatsToBook) {
        insertBookingSeat.run(`bs_${uuidv4()}`, bookingId, s.seatId, eventId, s.price);
      }

      return {
        bookingId,
        eventId,
        customer: cust,
        totalAmount,
        currency: 'INR',
        status: 'PENDING',
        holdToken,
        seats: seatsToBook
      };
    });

    return transaction();
  }

  /**
   * Process Simulated Payment (SUCCESS or FAILED) with Idempotency
   */
  processPaymentTransaction({ bookingId, simulationStatus, idempotencyKey = null, paymentMethod = 'DEMO_SIMULATION' }) {
    const transaction = db.transaction(() => {
      // 1. Check idempotency
      if (idempotencyKey) {
        const existingPayment = db.prepare('SELECT * FROM payments WHERE idempotency_key = ?').get(idempotencyKey);
        if (existingPayment) {
          return {
            payment: existingPayment,
            booking: this.findBookingById(bookingId),
            isDuplicate: true
          };
        }
      }

      // 2. Fetch booking
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
      if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      if (booking.status === 'CONFIRMED') {
        const err = new Error('Booking is already confirmed and paid');
        err.statusCode = 400;
        throw err;
      }

      if (booking.status === 'CANCELLED') {
        const err = new Error('Booking has been cancelled');
        err.statusCode = 400;
        throw err;
      }

      const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnRef = `TXN-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

      if (simulationStatus === 'SUCCESS') {
        // Record successful payment
        db.prepare(`
          INSERT INTO payments (id, booking_id, amount, currency, payment_method, status, idempotency_key, transaction_reference)
          VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?, ?)
        `).run(paymentId, bookingId, booking.total_amount, booking.currency, paymentMethod, idempotencyKey, txnRef);

        // Update booking to CONFIRMED
        db.prepare(`
          UPDATE bookings 
          SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(bookingId);

        // Convert the hold so it can never be released or re-held
        if (booking.hold_token) {
          db.prepare(`
            UPDATE seat_holds 
            SET status = 'CONVERTED' 
            WHERE hold_token = ?
          `).run(booking.hold_token);
        }

        // Issue unique tickets with QR verification code
        const bookingSeats = db.prepare(`
          SELECT bs.*, s.seat_number
          FROM booking_seats bs
          JOIN seats s ON bs.seat_id = s.id
          WHERE bs.booking_id = ?
        `).all(bookingId);

        const insertTicket = db.prepare(`
          INSERT INTO tickets (id, booking_id, booking_seat_id, ticket_code, qr_data, status)
          VALUES (?, ?, ?, ?, ?, 'VALID')
        `);

        const issuedTickets = [];
        for (const bs of bookingSeats) {
          const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
          const ticketCode = `TKT-EE-${bookingId.slice(-4)}-${bs.seat_number}`;
          const qrData = `https://eventease.app/tickets/${ticketCode}/verify`;

          insertTicket.run(ticketId, bookingId, bs.id, ticketCode, qrData);
          issuedTickets.push({
            ticketId,
            ticketCode,
            seatNumber: bs.seat_number,
            qrData,
            status: 'VALID'
          });
        }

        return {
          paymentId,
          transactionReference: txnRef,
          status: 'SUCCESS',
          bookingId,
          tickets: issuedTickets
        };
      } else {
        // Record FAILED payment
        db.prepare(`
          INSERT INTO payments (id, booking_id, amount, currency, payment_method, status, idempotency_key, error_message, transaction_reference)
          VALUES (?, ?, ?, ?, ?, 'FAILED', ?, 'Simulated demo payment declined by user request', ?)
        `).run(paymentId, bookingId, booking.total_amount, booking.currency, paymentMethod, idempotencyKey, txnRef);

        // Release the seat hold immediately so seats are freed!
        if (booking.hold_token) {
          db.prepare(`
            UPDATE seat_holds 
            SET status = 'RELEASED' 
            WHERE hold_token = ?
          `).run(booking.hold_token);
        }

        // Update booking status to CANCELLED
        db.prepare(`
          UPDATE bookings 
          SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(bookingId);

        return {
          paymentId,
          transactionReference: txnRef,
          status: 'FAILED',
          bookingId,
          message: 'Payment simulation failed. Seats have been released.'
        };
      }
    });

    return transaction();
  }

  /**
   * Cancel an existing CONFIRMED booking and release seats
   */
  cancelBookingTransaction(bookingId) {
    const transaction = db.transaction(() => {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
      if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      if (booking.status === 'CANCELLED') {
        const err = new Error('Booking is already cancelled');
        err.statusCode = 400;
        throw err;
      }

      // Cancel booking
      db.prepare(`
        UPDATE bookings 
        SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(bookingId);

      // Cancel all tickets issued for this booking
      db.prepare(`
        UPDATE tickets 
        SET status = 'CANCELLED' 
        WHERE booking_id = ?
      `).run(bookingId);

      // Update payment to REFUNDED
      db.prepare(`
        UPDATE payments 
        SET status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP 
        WHERE booking_id = ? AND status = 'SUCCESS'
      `).run(bookingId);

      return {
        bookingId,
        status: 'CANCELLED',
        message: 'Booking cancelled successfully. Seats have been released and tickets voided.'
      };
    });

    return transaction();
  }

  /**
   * Find full booking details by ID
   */
  findBookingById(bookingId) {
    const booking = db.prepare(`
      SELECT 
        b.*,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        e.title AS event_title,
        e.date AS event_date,
        e.time AS event_time,
        e.banner_url AS event_banner,
        e.category AS event_category,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN events e ON b.event_id = e.id
      JOIN venues v ON e.venue_id = v.id
      WHERE b.id = ?
    `).get(bookingId);

    if (!booking) return null;

    // Fetch seats
    const seats = db.prepare(`
      SELECT 
        bs.id AS booking_seat_id,
        bs.seat_id,
        bs.price_at_booking,
        s.seat_number,
        s.seat_row,
        s.tier
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = ?
    `).all(bookingId);

    // Fetch payments
    const payments = db.prepare(`
      SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC
    `).all(bookingId);

    // Fetch tickets
    const tickets = db.prepare(`
      SELECT 
        t.*,
        s.seat_number
      FROM tickets t
      JOIN booking_seats bs ON t.booking_seat_id = bs.id
      JOIN seats s ON bs.seat_id = s.id
      WHERE t.booking_id = ?
    `).all(bookingId);

    return {
      ...booking,
      seats,
      payments,
      tickets
    };
  }

  /**
   * List bookings for a given customer email or customerId
   */
  listBookingsByCustomer(emailOrPhone) {
    const customer = db.prepare(`
      SELECT id FROM customers WHERE LOWER(email) = LOWER(?) OR phone = ?
    `).get(emailOrPhone, emailOrPhone);

    if (!customer) return [];

    const bookings = db.prepare(`
      SELECT 
        b.*,
        e.title AS event_title,
        e.date AS event_date,
        e.time AS event_time,
        e.banner_url AS event_banner,
        v.name AS venue_name,
        v.city AS venue_city
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN venues v ON e.venue_id = v.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `).all(customer.id);

    return bookings.map(b => {
      const seats = db.prepare(`
        SELECT s.seat_number, s.tier, bs.price_at_booking
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.booking_id = ?
      `).all(b.id);

      const tickets = db.prepare(`
        SELECT ticket_code, status FROM tickets WHERE booking_id = ?
      `).all(b.id);

      return {
        ...b,
        seats,
        tickets
      };
    });
  }

  /**
   * List recent bookings across the platform
   */
  listRecentBookings(limit = 25) {
    const bookings = db.prepare(`
      SELECT 
        b.*,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        e.title AS event_title,
        e.date AS event_date,
        e.time AS event_time,
        e.banner_url AS event_banner,
        v.name AS venue_name,
        v.city AS venue_city
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN events e ON b.event_id = e.id
      JOIN venues v ON e.venue_id = v.id
      ORDER BY b.created_at DESC
      LIMIT ?
    `).all(limit);

    return bookings.map(b => {
      const seats = db.prepare(`
        SELECT s.seat_number, s.tier, bs.price_at_booking
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.booking_id = ?
      `).all(b.id);

      const tickets = db.prepare(`
        SELECT ticket_code, status FROM tickets WHERE booking_id = ?
      `).all(b.id);

      return {
        ...b,
        seats,
        tickets
      };
    });
  }

  /**
   * Verify Ticket by Code or ID
   */
  findTicketByCodeOrId(codeOrId) {
    const ticket = db.prepare(`
      SELECT 
        t.id AS ticket_id,
        t.ticket_code,
        t.status AS ticket_status,
        t.issued_at,
        b.id AS booking_id,
        b.status AS booking_status,
        c.full_name AS attendee_name,
        c.email AS attendee_email,
        e.title AS event_title,
        e.date AS event_date,
        e.time AS event_time,
        e.category AS event_category,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address,
        s.seat_number,
        s.tier AS seat_tier
      FROM tickets t
      JOIN bookings b ON t.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      JOIN events e ON b.event_id = e.id
      JOIN venues v ON e.venue_id = v.id
      JOIN booking_seats bs ON t.booking_seat_id = bs.id
      JOIN seats s ON bs.seat_id = s.id
      WHERE t.ticket_code = ? OR t.id = ?
    `).get(codeOrId, codeOrId);

    return ticket || null;
  }
}

module.exports = new BookingRepository();
