const mongoose = require('mongoose');

const RecentGameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: {
    url: String,
    publicId: String,
  },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RecentGame', RecentGameSchema);
