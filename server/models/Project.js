const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  url:         { type: String, default: '' },
  githubUrl:   { type: String, default: '' },
  customButtonText: { type: String, default: '' },
  customButtonUrl: { type: String, default: '' },
  image: {
    url:      String,
    publicId: String,
  },
  order:     { type: Number, default: 0 },
  createdAt: { type: Date,   default: Date.now },
});

module.exports = mongoose.model('Project', ProjectSchema);
