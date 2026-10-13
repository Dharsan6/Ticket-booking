require('dotenv').config();
const app = require('./app');
const seatInventoryService = require('./services/seatInventoryService');
const seedDatabase = require('./database/seed');

const PORT = process.env.PORT || 5001;
const CLEANUP_INTERVAL_SECONDS = parseInt(process.env.HOLD_CLEANUP_INTERVAL_SECONDS || '30', 10);

// Ensure seed data is initialized on startup if empty
seedDatabase();

// Background worker for cleaning up expired holds
const cleanupTimer = setInterval(async () => {
  try {
    const expiredCount = await seatInventoryService.cleanExpiredHolds();
    if (expiredCount > 0) {
      console.log(`[HoldCleanupWorker] Released ${expiredCount} expired seat hold(s).`);
    }
  } catch (err) {
    console.error('[HoldCleanupWorker] Error during hold cleanup:', err.message);
  }
}, CLEANUP_INTERVAL_SECONDS * 1000);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EventEase Backend Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎫 Events API:  http://localhost:${PORT}/api/events`);
  console.log(`⏱️ Hold Expiry:  Auto-clearing every ${CLEANUP_INTERVAL_SECONDS} seconds`);
  console.log(`====================================================`);
});

// Graceful shutdown
function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');
  clearInterval(cleanupTimer);
  server.close(() => {
    console.log('[Server] Closed HTTP server.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
