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
  about: {
    title: {
      type: String,
      default: 'Hi, this is Ibraheem,',
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      default: "a bounty hunter from Mandalore. When I'm not out hunting people, I dive deep into gaming, or just watch car videos on youtube.",
      trim: true,
      maxlength: 3000,
    },
  },
  interests: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
