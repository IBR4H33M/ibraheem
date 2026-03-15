const express = require('express');
const GameRecommendation = require('../models/GameRecommendation');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getTwitchAppAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt > now + 30000) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Twitch client credentials not set');
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Failed to fetch Twitch token: ${data.message || res.statusText}`);
  }

  cachedToken = data.access_token;
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 0;
  cachedTokenExpiresAt = now + (expiresIn * 1000);
  return cachedToken;
}

async function searchIgdbGames(query) {
  if (!query || !query.trim()) return [];
  const token = await getTwitchAppAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;
  const body = `search "${query.replace(/"/g, '')}"; fields name,first_release_date,cover.url,platforms.name; limit 12;`;

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB search error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data || []).map(game => {
    const releaseYear = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : '';
    const coverUrl = game.cover?.url ? `https:${game.cover.url.replace(/t_thumb/, 't_cover_big')}` : null;
    const platforms = Array.isArray(game.platforms) ? game.platforms.map(p => p.name).filter(Boolean) : [];
    return {
      igdbId: game.id,
      title: game.name,
      year: releaseYear,
      coverUrl,
      platforms,
    };
  });
}

router.get('/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) return res.json([]);
    const results = await searchIgdbGames(query);
    res.json(results);
  } catch (err) {
    console.error('IGDB search failed', err);
    res.status(500).json({ message: 'Search failed' });
  }
});

router.post('/recommend', async (req, res) => {
  try {
    const { name, igdbId, title, year, coverUrl, platforms } = req.body || {};
    if (!name?.trim() || !igdbId || !title) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const rec = await GameRecommendation.create({
      name: name.trim(),
      igdbId: Number(igdbId),
      title: title.trim(),
      year: year ? String(year).trim() : '',
      coverUrl: coverUrl || null,
      platforms: Array.isArray(platforms) ? platforms.slice(0, 5) : [],
    });
    res.status(201).json({ message: 'Recommendation saved', recommendation: rec });
  } catch (err) {
    console.error('Save recommendation failed', err);
    res.status(500).json({ message: 'Save failed' });
  }
});

router.get('/recommendations', adminAuth, async (req, res) => {
  try {
    const recs = await GameRecommendation.find().sort({ createdAt: -1 });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
