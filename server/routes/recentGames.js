const express = require('express');
const router = express.Router();
const RecentGame = require('../models/RecentGame');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const games = await RecentGame.find().sort({ order: 1, createdAt: 1 });
    res.json(games);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const count = await RecentGame.countDocuments();
    const game = await RecentGame.create({
      title: req.body.title,
      igdbId: req.body.igdbId,
      coverUrl: req.body.coverUrl,
      year: req.body.year,
      platforms: req.body.platforms || [],
      order: count,
    });
    res.status(201).json(game);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const game = await RecentGame.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Not found' });
    await game.deleteOne();
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
