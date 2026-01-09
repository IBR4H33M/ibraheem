const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get games by category
router.get('/category/:category', async (req, res) => {
  try {
    const games = await Game.find({ category: req.params.category });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new game
router.post('/', async (req, res) => {
  const game = new Game({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    platform: req.body.platform,
    genre: req.body.genre,
    releaseYear: req.body.releaseYear,
    rating: req.body.rating
  });

  try {
    const newGame = await game.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a game
router.put('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a game
router.delete('/:id', async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
