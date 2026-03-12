const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const RecentGame = require('../models/RecentGame');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ibraheem-recent-games',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 800, crop: 'fill' }],
  },
});
const upload = multer({ storage });

// GET — public
router.get('/', async (req, res) => {
  try {
    const games = await RecentGame.find().sort({ order: 1, createdAt: 1 });
    res.json(games);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST — admin
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const count = await RecentGame.countDocuments();
    const game = await RecentGame.create({
      title: req.body.title,
      image: req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : { url: null, publicId: null },
      order: count,
    });
    res.status(201).json(game);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE — admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const game = await RecentGame.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Not found' });
    if (game.image?.publicId) {
      await cloudinary.uploader.destroy(game.image.publicId);
    }
    await game.deleteOne();
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
