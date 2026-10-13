# EventEase — REST API Documentation

Base URL: `http://localhost:5001/api`

---

## 1. System Health

### `GET /api/health`
Checks server responsiveness and SQLite database connection status.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "HEALTHY",
  "database": "CONNECTED",
  "timestamp": "2026-10-13T14:30:00.000Z",
  "uptime": 124.5
}
```

---

## 2. Events & Seat Inventory

### `GET /api/events`
Lists all scheduled events with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category: `Music`, `Technology`, `Sports`, `Arts`, `Comedy` |
| `search` | string | Keyword search in event title, venue name, or city |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "evt_tamil_rock_2026",
      "venue_id": "venue_codissia",
      "title": "Tamil Rock Fusion Fest 2026",
      "category": "Music",
      "date": "2026-11-14",
      "time": "06:30 PM",
      "banner_url": "https://images.unsplash.com/...",
      "base_price": 1200,
      "venue_name": "CODISSIA Trade Fair Complex, Hall D",
      "venue_city": "Coimbatore",
      "total_seats": 60,
      "booked_seats_count": 2,
      "available_seats_count": 58
    }
  ]
}
```

---

### `GET /api/events/:id`
Retrieves comprehensive details for a specific event.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "evt_ai_summit_2026",
    "title": "Global AI & Deep Tech Summit 2026",
    "category": "Technology",
    "date": "2026-11-20",
    "time": "09:30 AM",
    "base_price": 2499,
    "venue_name": "Chennai Trade Centre Convention Hall",
    "venue_city": "Chennai",
    "venue_address": "Mount Poonamallee Rd, Nandambakkam, Chennai"
  }
}
```

---

### `GET /api/events/:id/seats`
Retrieves all 60 venue seats with real-time availability states and price calculations.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `sessionId` | string | Client session ID to identify seats held by current user |
| `holdToken` | string | Active hold token if held by current session |

**Seat Statuses:**
- `AVAILABLE`: Open for selection
- `HELD_BY_YOU`: Currently held by this user
- `HELD`: Held by another attendee under 5-minute hold
- `BOOKED`: Confirmed and paid

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "eventId": "evt_ai_summit_2026",
    "venueId": "venue_chennai_trade",
    "seats": [
      {
        "id": "seat_venue_chennai_trade_A1",
        "seat_number": "A1",
        "seat_row": "A",
        "tier": "VIP",
        "price_multiplier": 1.5,
        "calculated_price": 3748.5,
        "status": "AVAILABLE",
        "holdExpiresAt": null
      }
    ],
    "stats": {
      "total": 60,
      "available": 58,
      "held": 0,
      "booked": 2
    }
  }
}
```

---

## 3. Temporary Seat Holds

### `POST /api/holds`
Acquires an atomic temporary reservation hold on one or more seats for 5 minutes (300 seconds).

**Request Body:**
```json
{
  "eventId": "evt_ai_summit_2026",
  "seatIds": ["seat_venue_chennai_trade_C1", "seat_venue_chennai_trade_C2"],
  "customerSessionId": "session_alpha_123",
  "durationSeconds": 300
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Temporary hold acquired successfully",
  "data": {
    "holdToken": "hold_a8b9c1d2e3f4g5h6",
    "customerSessionId": "session_alpha_123",
    "eventId": "evt_ai_summit_2026",
    "seatIds": ["seat_venue_chennai_trade_C1", "seat_venue_chennai_trade_C2"],
    "totalAmount": 6248,
    "expiresAt": "2026-10-13T14:35:00.000Z",
    "durationSeconds": 300
  }
}
```

**Error Responses:**
- `409 Conflict`: Seat is already booked or currently held by another user.
- `404 Not Found`: Event or seats do not exist.

---

### `DELETE /api/holds/:id`
Manually releases an active hold before its expiry timer runs out.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Seat hold released successfully"
}
```

---

## 4. Bookings & Lifecycle

### `POST /api/bookings`
Creates a new booking in `PENDING` status linked to an active hold token. Prices are verified and calculated server-side.

**Request Body:**
```json
{
  "eventId": "evt_ai_summit_2026",
  "customer": {
    "fullName": "Arun Kumar",
    "email": "arun.k@example.com",
    "phone": "+91 9443322110"
  },
  "holdToken": "hold_a8b9c1d2e3f4g5h6",
  "seatIds": ["seat_venue_chennai_trade_C1", "seat_venue_chennai_trade_C2"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created in PENDING status",
  "data": {
    "bookingId": "BK-582910",
    "eventId": "evt_ai_summit_2026",
    "totalAmount": 6248,
    "currency": "INR",
    "status": "PENDING",
    "holdToken": "hold_a8b9c1d2e3f4g5h6",
    "seats": [
      { "seatId": "seat_venue_chennai_trade_C1", "seatNumber": "C1", "price": 3124 },
      { "seatId": "seat_venue_chennai_trade_C2", "seatNumber": "C2", "price": 3124 }
    ]
  }
}
```

---

### `GET /api/bookings/:id`
Retrieves complete booking details, attendee information, payment history, and issued tickets.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "BK-582910",
    "event_id": "evt_ai_summit_2026",
    "event_title": "Global AI & Deep Tech Summit 2026",
    "customer_name": "Arun Kumar",
    "customer_email": "arun.k@example.com",
    "total_amount": 6248,
    "status": "CONFIRMED",
    "seats": [...],
    "payments": [...],
    "tickets": [...]
  }
}
```

---

### `GET /api/bookings`
Lists bookings. Filterable by customer email/phone, or returns all recent bookings if no query is provided.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string | Customer email address |
| `phone` | string | Customer phone number |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [ ... ]
}
```

---

### `POST /api/bookings/:id/payments`
Processes a simulated demo payment (`SUCCESS` or `FAILED`).

**Request Body:**
```json
{
  "status": "SUCCESS",
  "idempotencyKey": "idemp_1728829182_xyz",
  "paymentMethod": "DEMO_SIMULATION"
}
```

**Response on SUCCESS (200 OK):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "PAY-829102",
    "transactionReference": "TXN-A1B2C3D4E5F6",
    "status": "SUCCESS",
    "bookingId": "BK-582910",
    "tickets": [
      {
        "ticketId": "TKT-192842",
        "ticketCode": "TKT-EE-2910-C1",
        "seatNumber": "C1",
        "qrData": "https://eventease.app/tickets/TKT-EE-2910-C1/verify",
        "status": "VALID"
      }
    ]
  }
}
```

**Response on FAILED (200 OK):**
```json
{
  "success": false,
  "message": "Payment simulation failed",
  "data": {
    "paymentId": "PAY-382910",
    "status": "FAILED",
    "bookingId": "BK-582910",
    "message": "Payment simulation failed. Seats have been released."
  }
}
```

---

### `POST /api/bookings/:id/cancel`
Cancels a confirmed booking, invalidates all issued tickets, marks the payment as refunded, and returns seats to inventory.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "bookingId": "BK-582910",
    "status": "CANCELLED",
    "message": "Booking cancelled successfully. Seats have been released and tickets voided."
  }
}
```

---

## 5. Ticket Verification

### `GET /api/tickets/:id/verify`
Verifies the cryptographic ticket code or ticket ID (scanned from QR code or checked manually).

**Response (200 OK - Valid Ticket):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "status": "VALID",
    "ticket": {
      "ticketId": "TKT-DEMO-001",
      "ticketCode": "TKT-EE-ROCK-A1",
      "status": "VALID",
      "attendeeName": "Rajesh Kannan",
      "eventTitle": "Tamil Rock Fusion Fest 2026",
      "eventDate": "2026-11-14",
      "eventTime": "06:30 PM",
      "venueName": "CODISSIA Trade Fair Complex, Hall D",
      "venueCity": "Coimbatore",
      "seatNumber": "A1",
      "seatTier": "VIP",
      "bookingId": "BK-DEMO-7001",
      "bookingStatus": "CONFIRMED"
    },
    "message": "Ticket is VALID and verified for entry."
  }
}
```

**Response (200 OK - Cancelled / Void Ticket):**
```json
{
  "success": false,
  "data": {
    "isValid": false,
    "status": "CANCELLED",
    "message": "Ticket is CANCELLED (Booking status: CANCELLED)."
  }
}
```

**Response (404 Not Found - Unknown Identifier):**
```json
{
  "success": false,
  "data": {
    "isValid": false,
    "status": "NOT_FOUND",
    "message": "No ticket was found matching this identifier or QR code."
  }
}
```
