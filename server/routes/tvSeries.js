const express = require('express');
const router = express.Router();
const TVSeries = require('../models/TVSeries');
const TVSeriesRecommendation = require('../models/TVSeriesRecommendation');
const adminAuth = require('../middleware/adminAuth');

// Seed default 10 TV series if empty
async function seedIfEmpty() {
  const count = await TVSeries.countDocuments();
  if (count === 0) {
    const defaults = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      title: 'Coming Soon',
      image: { url: null, publicId: null },
    }));
    await TVSeries.insertMany(defaults);
  }
}
seedIfEmpty();

// GET /api/tv-series — public
router.get('/', async (req, res) => {
  try {
    const series = await TVSeries.find().sort({ rank: 1 });
    res.json(series);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tv-series/tmdb/search?q=... — public TMDB TV search
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

    const tmdbUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const tmdbRes = await fetch(tmdbUrl, {
      headers: tmdbHeaders,
    });

    if (!tmdbRes.ok) {
      return res.status(502).json({ message: 'TMDB request failed' });
    }

    const data = await tmdbRes.json();
    const baseResults = (data.results || []).slice(0, 8);

    const results = await Promise.all(baseResults.map(async (tv) => {
      let network = 'Unknown';

      try {
        const detailUrl = `https://api.themoviedb.org/3/tv/${tv.id}?language=en-US`;
        const detailRes = await fetch(detailUrl, { headers: tmdbHeaders });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (Array.isArray(detail.networks) && detail.networks.length > 0) {
            network = detail.networks[0].name || 'Unknown';
          }
        }
      } catch {
        network = 'Unknown';
      }

      return {
        tmdbId: tv.id,
        title: tv.name,
        firstAirDate: tv.first_air_date || '',
        year: tv.first_air_date ? tv.first_air_date.slice(0, 4) : '',
        posterPath: tv.poster_path || null,
        posterUrl: tv.poster_path ? `https://image.tmdb.org/t/p/w185${tv.poster_path}` : null,
        network,
      };
    }));

    res.json(results);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tv-series/recommend — public TV series recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { name, tmdbId, title, year, posterPath } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!tmdbId || !title) {
      return res.status(400).json({ message: 'TV series selection is required' });
    }

    const recommendation = await TVSeriesRecommendation.create({
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

// GET /api/tv-series/recommendations — admin only
router.get('/recommendations', adminAuth, async (req, res) => {
  try {
    const recommendations = await TVSeriesRecommendation.find().sort({ createdAt: -1 });
    res.json(recommendations);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tv-series/:rank — admin only, update from TMDB selection
router.put('/:rank', adminAuth, async (req, res) => {
  try {
    const rank = parseInt(req.params.rank, 10);
    if (rank < 1 || rank > 10) {
      return res.status(400).json({ message: 'Rank must be 1–10' });
    }

    const { title, posterUrl } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const update = {
      title,
      image: {
        url: posterUrl || null,
        publicId: null,
      },
    };

    const series = await TVSeries.findOneAndUpdate(
      { rank },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/tv-series/reorder — admin only, reorder series
router.post('/reorder', adminAuth, async (req, res) => {
  try {
    const { series } = req.body;
    if (!Array.isArray(series)) {
      return res.status(400).json({ message: 'Series array is required' });
    }

    const bulkOps = series.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { rank: item.rank } },
      },
    }));

    await TVSeries.bulkWrite(bulkOps);
    const updated = await TVSeries.find().sort({ rank: 1 });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
