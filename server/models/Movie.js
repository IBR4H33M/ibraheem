const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 10,
  },
  title: {
    type: String,
    required: true,
    default: 'Coming Soon',
  },
  image: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
