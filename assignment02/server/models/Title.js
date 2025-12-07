const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Title name is required'],
    trim: true,
    maxlength: [200, 'Title name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['anime', 'movie', 'series', 'ova', 'special'],
    default: 'anime'
  },
  genres: [{
    type: String,
    trim: true
  }],
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [2100, 'Year must be before 2100']
  },
  synopsis: {
    type: String,
    maxlength: [5000, 'Synopsis cannot exceed 5000 characters'],
    default: ''
  },
  poster: {
    type: String,
    default: ''
  },
  episodes: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    enum: ['airing', 'completed', 'upcoming', 'cancelled'],
    default: 'completed'
  },
  studio: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for common queries
titleSchema.index({ name: 'text', synopsis: 'text' });
titleSchema.index({ genres: 1 });
titleSchema.index({ type: 1 });
titleSchema.index({ year: -1 });
titleSchema.index({ 'rating.average': -1 });
titleSchema.index({ createdAt: -1 });

// Virtual for reviews
titleSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'titleId'
});

// Enable virtuals in JSON
titleSchema.set('toJSON', { virtuals: true });
titleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Title', titleSchema);
