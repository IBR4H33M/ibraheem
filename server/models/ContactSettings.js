const mongoose = require('mongoose');

const ContactSettingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'main', unique: true },
  contactEmail: { type: String, default: 'contact@ibraheemibnanwar.me' },
  socialLinks: {
    facebook:  { type: String, default: 'https://facebook.com/ibraheemibnanwar' },
    instagram: { type: String, default: 'https://instagram.com/ibraheemibnanwar' },
    twitter:   { type: String, default: 'https://x.com/ibraheemibnanwar' },
    discord:   { type: String, default: 'https://discord.com/users/ibraheemibnanwar' },
  },
}, { timestamps: true });

module.exports = mongoose.model('ContactSettings', ContactSettingsSchema);
