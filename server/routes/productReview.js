const express = require('express');
const router = express.Router();
const axios = require('axios');

// Flask service URL - update this for production if needed
const FLASK_URL = process.env.PRODUCT_REVIEW_FLASK_URL || 'http://localhost:5002';
const PREDICTION_TIMEOUT_MS = 120000;

// Predict sentiment by proxying to Flask service
router.post('/predict', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_URL}/sentiment/predict`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: PREDICTION_TIMEOUT_MS,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Product review ML service error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, error: 'Product review ML service is unavailable.' });
    }

    res.status(500).json({ success: false, error: error.response?.data?.error || error.message || 'Prediction failed' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/sentiment/health`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Product review ML service unavailable' });
  }
});

module.exports = router;
