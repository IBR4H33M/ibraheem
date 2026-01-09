const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  category: {
    type: String,
    required: true,
    enum: ['always-love', 'currently-playing', 'looking-forward']
  },
  platform: [String],
  genre: [String],
  releaseYear: Number,
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', GameSchema);
