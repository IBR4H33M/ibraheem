const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const adminAuth = require('../middleware/adminAuth');

// POST /api/contact-messages — public submit
router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const topic = String(req.body.topic || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const created = await ContactMessage.create({
      name,
      email,
      topic,
      message,
    });

    res.status(201).json({
      _id: created._id,
      name: created.name,
      email: created.email,
      topic: created.topic,
      message: created.message,
      createdAt: created.createdAt,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contact-messages — admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
