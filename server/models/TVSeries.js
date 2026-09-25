const mongoose = require('mongoose');

const tvSeriesSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  title: { type: String, required: true },
  image: {
    url: String,
    publicId: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('TVSeries', tvSeriesSchema);
