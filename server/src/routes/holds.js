const express = require('express');
const router = express.Router();
const holdController = require('../controllers/holdController');

router.post('/', holdController.createHold);
router.delete('/:id', holdController.releaseHold);

module.exports = router;
