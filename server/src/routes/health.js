const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  try {
    const dbCheck = db.prepare("SELECT 1 AS ok").get();
    res.json({
      success: true,
      service: 'EventEase API',
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      database: dbCheck.ok === 1 ? 'CONNECTED' : 'UNKNOWN'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      service: 'EventEase API',
      status: 'UNHEALTHY',
      error: err.message
    });
  }
});

module.exports = router;
