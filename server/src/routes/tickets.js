const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/:id/verify', ticketController.verifyTicket);

module.exports = router;
