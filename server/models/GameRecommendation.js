const mongoose = require('mongoose');

const GameRecommendationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  igdbId: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  year: { type: String, default: '', trim: true },
  coverUrl: { type: String, default: null },
  platforms: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('GameRecommendation', GameRecommendationSchema);
