const db = require('./db');

function seedDatabase() {
  console.log('[Seed] Starting EventEase database seeding...');

  const insertVenue = db.prepare(`
    INSERT INTO venues (id, name, city, address, total_capacity)
    VALUES (@id, @name, @city, @address, @total_capacity)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      city = excluded.city,
      address = excluded.address,
      total_capacity = excluded.total_capacity
  `);

  const insertSeat = db.prepare(`
    INSERT INTO seats (id, venue_id, seat_number, seat_row, tier, price_multiplier)
    VALUES (@id, @venue_id, @seat_number, @seat_row, @tier, @price_multiplier)
    ON CONFLICT(venue_id, seat_number) DO UPDATE SET
      seat_row = excluded.seat_row,
      tier = excluded.tier,
      price_multiplier = excluded.price_multiplier
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (id, venue_id, title, description, category, date, time, banner_url, base_price, status)
    VALUES (@id, @venue_id, @title, @description, @category, @date, @time, @banner_url, @base_price, @status)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      date = excluded.date,
      time = excluded.time,
      banner_url = excluded.banner_url,
      base_price = excluded.base_price,
      status = excluded.status
  `);

  const venues = [
    {
      id: 'venue_codissia',
      name: 'CODISSIA Trade Fair Complex, Hall D',
      city: 'Coimbatore',
      address: 'Avinashi Road, Civil Aerodrome Post, Coimbatore, Tamil Nadu 641014',
      total_capacity: 60
    },
    {
      id: 'venue_chennai_trade',
      name: 'Chennai Trade Centre Convention Hall',
      city: 'Chennai',
      address: 'Mount Poonamallee Rd, Nandambakkam, Chennai, Tamil Nadu 600089',
      total_capacity: 60
    },
    {
      id: 'venue_nehru_indoor',
      name: 'Nehru Indoor Stadium Arena',
      city: 'Coimbatore',
      address: 'VOC Park Grounds, Gopalapuram, Coimbatore, Tamil Nadu 641018',
      total_capacity: 60
    },
    {
      id: 'venue_music_academy',
      name: 'The Music Academy Grand Auditorium',
      city: 'Chennai',
      address: '168, TTK Road, Royapettah, Chennai, Tamil Nadu 600014',
      total_capacity: 60
    },
    {
      id: 'venue_hindusthan',
      name: 'Hindusthan Performing Arts Centre',
      city: 'Coimbatore',
      address: 'Nava India Road, Peelamedu, Coimbatore, Tamil Nadu 641028',
      total_capacity: 60
    },
    {
      id: 'venue_le_royal',
      name: 'Le Royal Méridien Grand Ballroom',
      city: 'Chennai',
      address: '1 GST Road, St Thomas Mount, Chennai, Tamil Nadu 600016',
      total_capacity: 60
    }
  ];

  const events = [
    {
      id: 'evt_tamil_rock_2026',
      venue_id: 'venue_codissia',
      title: 'Tamil Rock Fusion Fest 2026',
      category: 'Music',
      date: '2026-11-14',
      time: '06:30 PM',
      banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      base_price: 1200,
      description: 'An electrifying open-air evening celebrating contemporary Tamil indie rock, progressive folk-fusion, and high-energy live acoustic guitar riffs featuring top independent bands.',
      status: 'ACTIVE'
    },
    {
      id: 'evt_ai_summit_2026',
      venue_id: 'venue_chennai_trade',
      title: 'Global AI & Deep Tech Summit 2026',
      category: 'Technology',
      date: '2026-11-20',
      time: '09:30 AM',
      banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      base_price: 2499,
      description: 'South India’s premier artificial intelligence conference bringing together frontier LLM researchers, enterprise ML architects, and robotics innovators for keynotes and hands-on masterclasses.',
      status: 'ACTIVE'
    },
    {
      id: 'evt_pro_kabaddi_2026',
      venue_id: 'venue_nehru_indoor',
      title: 'Southern Pro Kabaddi Championship Finals',
      category: 'Sports',
      date: '2026-11-28',
      time: '07:00 PM',
      banner_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      base_price: 750,
      description: 'Witness the intense final showdown between Tamil Thalaivas and Bengaluru Bulls for the prestigious Southern Championship Trophy in an action-packed indoor stadium atmosphere.',
      status: 'ACTIVE'
    },
    {
      id: 'evt_carnatic_symphony',
      venue_id: 'venue_music_academy',
      title: 'Carnatic Symphony & Western Fusion Orchestra',
      category: 'Arts',
      date: '2026-12-05',
      time: '06:00 PM',
      banner_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
      base_price: 1500,
      description: 'A rare cross-cultural musical spectacle pairing traditional Carnatic veena and violin ragas with a 40-piece philharmonic western chamber orchestra.',
      status: 'ACTIVE'
    },
    {
      id: 'evt_standup_riot',
      venue_id: 'venue_hindusthan',
      title: 'Laughter Riot 2026: Standup Comedy Special',
      category: 'Comedy',
      date: '2026-12-12',
      time: '07:30 PM',
      banner_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
      base_price: 599,
      description: 'A rib-tickling bilingual stand-up comedy showcase featuring top regional comics delivering uninhibited observations on IT jobs, engineering college life, and matrimony.',
      status: 'ACTIVE'
    },
    {
      id: 'evt_cloud_conclave',
      venue_id: 'venue_le_royal',
      title: 'NextGen Cloud, Kubernetes & DevOps Conclave',
      category: 'Technology',
      date: '2026-12-18',
      time: '10:00 AM',
      banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      base_price: 1899,
      description: 'Deep dive into cloud-native scalability, zero-trust container security, distributed state management, and real-time observability patterns for engineering leaders.',
      status: 'ACTIVE'
    }
  ];

  const seedTransaction = db.transaction(() => {
    // 1. Insert Venues
    for (const venue of venues) {
      insertVenue.run(venue);

      // Generate 60 seats per venue (Rows A-F, Seats 1-10)
      const rows = [
        { row: 'A', tier: 'VIP', mult: 1.5 },
        { row: 'B', tier: 'VIP', mult: 1.5 },
        { row: 'C', tier: 'PREMIUM', mult: 1.25 },
        { row: 'D', tier: 'PREMIUM', mult: 1.25 },
        { row: 'E', tier: 'STANDARD', mult: 1.0 },
        { row: 'F', tier: 'STANDARD', mult: 1.0 }
      ];

      for (const r of rows) {
        for (let num = 1; num <= 10; num++) {
          const seatNumber = `${r.row}${num}`;
          const seatId = `seat_${venue.id}_${seatNumber}`;
          insertSeat.run({
            id: seatId,
            venue_id: venue.id,
            seat_number: seatNumber,
            seat_row: r.row,
            tier: r.tier,
            price_multiplier: r.mult
          });
        }
      }
    }

    // 2. Insert Events
    for (const event of events) {
      insertEvent.run(event);
    }

    // 3. Insert a demo customer and initial booked seats for demo realism
    const customerId = 'cust_demo_rajesh';
    db.prepare(`
      INSERT INTO customers (id, full_name, email, phone)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET full_name = excluded.full_name
    `).run(customerId, 'Rajesh Kannan', 'rajesh.k@example.com', '+91 9876543210');

    // Sample pre-booked seats for Tamil Rock Fest (A1 and A2)
    const bookingId = 'BK-DEMO-7001';
    const eventId = 'evt_tamil_rock_2026';
    const existingBooking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);
    
    if (!existingBooking) {
      db.prepare(`
        INSERT INTO bookings (id, event_id, customer_id, total_amount, currency, status, hold_token)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(bookingId, eventId, customerId, 3600, 'INR', 'CONFIRMED', 'hold_token_seed_demo');

      const seatA1 = 'seat_venue_codissia_A1';
      const seatA2 = 'seat_venue_codissia_A2';
      
      const bs1 = 'bs_demo_1';
      const bs2 = 'bs_demo_2';
      db.prepare(`
        INSERT INTO booking_seats (id, booking_id, seat_id, event_id, price_at_booking)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
      `).run(bs1, bookingId, seatA1, eventId, 1800, bs2, bookingId, seatA2, eventId, 1800);

      db.prepare(`
        INSERT INTO payments (id, booking_id, amount, currency, payment_method, status, idempotency_key, transaction_reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('PAY-DEMO-7001', bookingId, 3600, 'INR', 'DEMO_SIMULATION', 'SUCCESS', 'idemp_seed_demo_7001', 'TXN-SEED-987654');

      db.prepare(`
        INSERT INTO tickets (id, booking_id, booking_seat_id, ticket_code, qr_data, status)
        VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)
      `).run(
        'TKT-DEMO-001', bookingId, bs1, 'TKT-EE-ROCK-A1', 'https://eventease.app/tickets/TKT-EE-ROCK-A1/verify', 'VALID',
        'TKT-DEMO-002', bookingId, bs2, 'TKT-EE-ROCK-A2', 'https://eventease.app/tickets/TKT-EE-ROCK-A2/verify', 'VALID'
      );
    }
  });

  seedTransaction();
  console.log('[Seed] Database successfully seeded with 6 venues, 360 seats, 6 events, and demo bookings!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
