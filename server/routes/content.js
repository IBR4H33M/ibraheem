const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Get all content for a specific page
router.get('/:page', async (req, res) => {
  try {
    const content = await Content.find({ page: req.params.page });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new content
router.post('/', async (req, res) => {
  const content = new Content({
    page: req.body.page,
    title: req.body.title,
    description: req.body.description,
    images: req.body.images
  });

  try {
    const newContent = await content.save();
    res.status(201).json(newContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(content);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
