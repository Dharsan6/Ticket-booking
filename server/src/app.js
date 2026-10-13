const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRoutes = require('./routes/health');
const eventRoutes = require('./routes/events');
const holdRoutes = require('./routes/holds');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// REST API Routes
app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/holds', holdRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' not found`,
    statusCode: 404
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
