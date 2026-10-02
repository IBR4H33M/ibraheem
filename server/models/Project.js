const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  slug:            { type: String, unique: true, sparse: true }, // URL-friendly slug
  description:     { type: String, default: '' }, // legacy fallback
  introduction:    { type: String, default: '' },
  background:      { type: String, default: '' },
  datasetTitle:    { type: String, default: '' },
  datasetUrl:      { type: String, default: '' },
  techStack:       { type: String, default: '' }, // Legacy plain text tech stack
  tools:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tool' }], // Universal tools
  myRole:          { type: String, default: '' },
  url:             { type: String, default: '' },
  githubUrl:       { type: String, default: '' },
  customButtonText: { type: String, default: '' },
  customButtonUrl: { type: String, default: '' },
  image: {
    url:      String,
    publicId: String,
  },
  order:     { type: Number, default: 0 },
  featured:  { type: Boolean, default: true }, // Show on homepage slider
  createdAt: { type: Date,   default: Date.now },
});

module.exports = mongoose.model('Project', ProjectSchema);
