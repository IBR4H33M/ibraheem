const mongoose = require('mongoose');

const RecentGameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  igdbId: { type: Number },
  coverUrl: { type: String },
  year: { type: Number },
  platforms: [String],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RecentGame', RecentGameSchema);
