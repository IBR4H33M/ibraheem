const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    enum: ['home', 'about', 'techspace', 'gaming', 'entertainment', 'collectibles']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  images: [{
    url: String,
    alt: String,
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Content', ContentSchema);
