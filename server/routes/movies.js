const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Movie = require('../models/Movie');
const MovieRecommendation = require('../models/MovieRecommendation');
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

// GET /api/movies/tmdb/search?q=... — public TMDB v3 proxy search
router.get('/tmdb/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    if (!process.env.TMDB_BEARER_TOKEN) {
      return res.status(500).json({ message: 'TMDB token is not configured' });
    }

    const tmdbHeaders = {
      Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      accept: 'application/json',
    };

    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const tmdbRes = await fetch(tmdbUrl, {
      headers: tmdbHeaders,
    });

    if (!tmdbRes.ok) {
      return res.status(502).json({ message: 'TMDB request failed' });
    }

    const data = await tmdbRes.json();
    const baseResults = (data.results || []).slice(0, 8);

    const results = await Promise.all(baseResults.map(async (movie) => {
      let publisher = 'Unknown';

      try {
        const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`;
        const detailRes = await fetch(detailUrl, { headers: tmdbHeaders });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (Array.isArray(detail.production_companies) && detail.production_companies.length > 0) {
            publisher = detail.production_companies[0].name || 'Unknown';
          }
        }
      } catch {
        publisher = 'Unknown';
      }

      return {
        tmdbId: movie.id,
        title: movie.title,
        releaseDate: movie.release_date || '',
        year: movie.release_date ? movie.release_date.slice(0, 4) : '',
        posterPath: movie.poster_path || null,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : null,
        publisher,
      };
    }));

    res.json(results);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/movies/recommend — public movie recommendation submit
router.post('/recommend', async (req, res) => {
  try {
    const { name, tmdbId, title, year, posterPath } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!tmdbId || !title) {
      return res.status(400).json({ message: 'Movie selection is required' });
    }

    const recommendation = await MovieRecommendation.create({
      name: String(name).trim(),
      tmdbId: Number(tmdbId),
      title: String(title).trim(),
      year: year ? String(year).trim() : '',
      posterPath: posterPath || null,
    });

    res.status(201).json({
      message: 'Recommendation received',
      recommendation,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/movies/recommendations — admin only
router.get('/recommendations', adminAuth, async (req, res) => {
  try {
    const recommendations = await MovieRecommendation.find().sort({ createdAt: -1 });
    res.json(recommendations);
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
