-- EventEase Database Schema (SQLite)
PRAGMA foreign_keys = ON;

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  total_capacity INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- Music, Technology, Sports, Arts, Comedy
  date TEXT NOT NULL,      -- YYYY-MM-DD
  time TEXT NOT NULL,      -- e.g. '06:30 PM'
  banner_url TEXT NOT NULL,
  base_price REAL NOT NULL, -- INR
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seats Table (Associated with Venues)
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  seat_row TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'VIP', 'PREMIUM', 'STANDARD'
  price_multiplier REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(venue_id, seat_number)
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seat Holds Table (Temporary Hold before payment confirmation)
CREATE TABLE IF NOT EXISTS seat_holds (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  hold_token TEXT NOT NULL,
  customer_session_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'RELEASED', 'CONVERTED', 'EXPIRED'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'
  hold_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Booking Seats Table (Junction Table linking Bookings to Seats)
CREATE TABLE IF NOT EXISTS booking_seats (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  price_at_booking REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, seat_id, booking_id)
);

-- Payments Table (Simulated Demo Payments)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'DEMO_SIMULATION',
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
  idempotency_key TEXT UNIQUE,
  error_message TEXT,
  transaction_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table (Issued upon Confirmed Booking)
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_seat_id TEXT NOT NULL REFERENCES booking_seats(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL,
  qr_data TEXT NOT NULL,
  status TEXT DEFAULT 'VALID', -- 'VALID', 'USED', 'CANCELLED'
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Concurrency & Query Optimization
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_seats_venue ON seats(venue_id);
CREATE INDEX IF NOT EXISTS idx_holds_event_seat ON seat_holds(event_id, seat_id, status);
CREATE INDEX IF NOT EXISTS idx_holds_token ON seat_holds(hold_token);
CREATE INDEX IF NOT EXISTS idx_holds_expiry ON seat_holds(expires_at, status);
CREATE INDEX IF NOT EXISTS idx_booking_seats_event ON booking_seats(event_id, seat_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);
