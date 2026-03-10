const express = require('express');
const router = express.Router();
const ContactSettings = require('../models/ContactSettings');
const adminAuth = require('../middleware/adminAuth');

async function getSettings() {
  let settings = await ContactSettings.findOne({ singleton: 'main' });
  if (!settings) settings = await ContactSettings.create({ singleton: 'main' });
  return settings;
}

// GET /api/contact-settings — public
router.get('/', async (req, res) => {
  try {
    res.json(await getSettings());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/contact-settings — admin only
router.put('/', adminAuth, async (req, res) => {
  try {
    const { contactEmail, socialLinks } = req.body;
    const update = {};
    if (contactEmail) update.contactEmail = contactEmail;
    if (socialLinks)  update.socialLinks  = socialLinks;

    const settings = await ContactSettings.findOneAndUpdate(
      { singleton: 'main' },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
