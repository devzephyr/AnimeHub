const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  titleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Title',
    required: true
  },
  status: {
    type: String,
    enum: ['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'],
    default: 'plan_to_watch'
  },
  progress: {
    type: Number,
    min: 0,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: [watchlistItemSchema]
}, {
  timestamps: true
});

// Index for efficient queries
watchlistSchema.index({ 'items.titleId': 1 });

// Method to add item to watchlist
watchlistSchema.methods.addItem = function (titleId, status = 'plan_to_watch') {
  const existingItem = this.items.find(
    item => item.titleId.toString() === titleId.toString()
  );

  if (existingItem) {
    existingItem.status = status;
    existingItem.addedAt = new Date();
  } else {
    this.items.push({ titleId, status });
  }

  return this.save();
};

// Method to remove item from watchlist
watchlistSchema.methods.removeItem = function (titleId) {
  this.items = this.items.filter(
    item => item.titleId.toString() !== titleId.toString()
  );
  return this.save();
};

// Method to update item status
watchlistSchema.methods.updateItemStatus = function (titleId, status, progress) {
  const item = this.items.find(
    item => item.titleId.toString() === titleId.toString()
  );

  if (item) {
    if (status) item.status = status;
    if (progress !== undefined) item.progress = progress;
    return this.save();
  }

  return null;
};

module.exports = mongoose.model('Watchlist', watchlistSchema);
