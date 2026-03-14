const mongoose = require('mongoose');

const MovieRecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  tmdbId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: String,
    default: '',
    trim: true,
  },
  posterPath: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('MovieRecommendation', MovieRecommendationSchema);
