const mongoose = require('mongoose');

const GameCaptureSchema = new mongoose.Schema({
  gameName: { type: String, required: true },
  image: {
    url: String,
    publicId: String,
  },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GameCapture', GameCaptureSchema);
