const mongoose = require('mongoose');

const tvSeriesRecommendationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tmdbId: { type: Number, required: true },
  title: { type: String, required: true },
  year: String,
  posterPath: String,
}, { timestamps: true });

module.exports = mongoose.model('TVSeriesRecommendation', tvSeriesRecommendationSchema);
