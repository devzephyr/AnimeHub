const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  titleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Title',
    required: [true, 'Title ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  text: {
    type: String,
    maxlength: [5000, 'Review text cannot exceed 5000 characters'],
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per title
reviewSchema.index({ userId: 1, titleId: 1 }, { unique: true });
reviewSchema.index({ titleId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

// Static method to calculate average rating for a title
reviewSchema.statics.calculateAverageRating = async function(titleId) {
  const result = await this.aggregate([
    { $match: { titleId: titleId } },
    {
      $group: {
        _id: '$titleId',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    const Title = mongoose.model('Title');
    if (result.length > 0) {
      await Title.findByIdAndUpdate(titleId, {
        'rating.average': Math.round(result[0].averageRating * 10) / 10,
        'rating.count': result[0].count
      });
    } else {
      await Title.findByIdAndUpdate(titleId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (error) {
    console.error('Error updating title rating:', error);
  }
};

// Update title rating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.titleId);
});

// Update title rating after remove
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.titleId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
