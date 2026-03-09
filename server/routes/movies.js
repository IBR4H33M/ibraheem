const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Movie = require('../models/Movie');
const adminAuth = require('../middleware/adminAuth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ibraheem-movies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 560, crop: 'fill' }],
  },
});
const upload = multer({ storage });

// Seed default 10 movies if the collection is empty
async function seedIfEmpty() {
  const count = await Movie.countDocuments();
  if (count === 0) {
    const defaults = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      title: i === 0 ? 'The Lord of the Rings: The Return of the King' : 'Coming Soon',
      image: { url: i === 0 ? '/assets/movie1.webp' : null, publicId: null },
    }));
    await Movie.insertMany(defaults);
  }
}
seedIfEmpty();

// GET /api/movies — public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ rank: 1 });
    res.json(movies);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/movies/:rank — admin only, update title + optional image
router.put('/:rank', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const rank = parseInt(req.params.rank, 10);
    if (rank < 1 || rank > 10) {
      return res.status(400).json({ message: 'Rank must be 1–10' });
    }

    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title;

    if (req.file) {
      // Delete old Cloudinary image if it exists
      const existing = await Movie.findOne({ rank });
      if (existing?.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId);
      }
      update.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const movie = await Movie.findOneAndUpdate(
      { rank },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
