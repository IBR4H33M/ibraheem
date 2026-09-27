const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Frontend',
      'Backend',
      'Database',
      'Storage/Cloud',
      'Authentication',
      'DevOps/Deployment',
      'Tools/Build',
      'Testing',
      'Machine Learning',
      'API/Services',
      'Languages',
      'Frameworks',
      'Other',
    ],
    default: 'Other',
  },
  logo: {
    url: String,
    publicId: String, // Cloudinary public ID for deletion
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tool', ToolSchema);
