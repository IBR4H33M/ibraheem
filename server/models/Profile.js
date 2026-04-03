const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'main',
  },
  image: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
