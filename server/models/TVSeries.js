const mongoose = require('mongoose');

const tvSeriesSchema = new mongoose.Schema({
  rank: { type: Number, required: true, unique: true, min: 1, max: 10 },
  title: { type: String, required: true },
  image: {
    url: String,
    publicId: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('TVSeries', tvSeriesSchema);
