const express = require('express');
const router = express.Router();
const {
  getTitles,
  getTitle,
  createTitle,
  updateTitle,
  deleteTitle,
  getGenres,
  getTopRated
} = require('../controllers/titleController');
const { protect } = require('../middleware/auth');
const { titleValidation, paramValidation, paginationValidation } = require('../middleware/validation');

// Public routes
router.get('/genres', getGenres);
router.get('/top-rated', getTopRated);
router.get('/', paginationValidation, getTitles);
router.get('/:id', paramValidation.mongoId, getTitle);

// Protected routes
router.post('/', protect, titleValidation.create, createTitle);
router.put('/:id', protect, paramValidation.mongoId, titleValidation.update, updateTitle);
router.delete('/:id', protect, paramValidation.mongoId, deleteTitle);

module.exports = router;
