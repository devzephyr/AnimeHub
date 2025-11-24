const express = require('express');
const router = express.Router();
const controller = require('../controllers/moria.controller');

router.get('/start', controller.getStart);
router.post('/ask', controller.postAsk);

module.exports = router;
