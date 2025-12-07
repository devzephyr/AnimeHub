const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  checkInWatchlist,
  getWatchlistStats
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');
const { watchlistValidation } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.get('/', getWatchlist);
router.get('/stats', getWatchlistStats);
router.get('/check/:titleId', checkInWatchlist);
router.post('/', watchlistValidation.addItem, addToWatchlist);
router.put('/:titleId', watchlistValidation.updateItem, updateWatchlistItem);
router.delete('/:titleId', removeFromWatchlist);

module.exports = router;
