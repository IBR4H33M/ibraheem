const express = require('express');
const router = express.Router();
const axios = require('axios');

// Flask service URL - update this for production
const GRADE_PREDICT_FLASK_URL = process.env.GRADE_PREDICT_FLASK_URL || 'http://localhost:5001';
const PREDICTION_TIMEOUT_MS = 120000;

// Proxy prediction request to Flask ML service
router.post('/predict', async (req, res) => {
    try {
        const response = await axios.post(`${GRADE_PREDICT_FLASK_URL}/predict`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: PREDICTION_TIMEOUT_MS
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('ML Service Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'ML service is unavailable. Please try again later.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message || 'Prediction failed'
        });
    }
});

// Health check for ML service
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${GRADE_PREDICT_FLASK_URL}/health`, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'ML service unavailable'
        });
    }
});

module.exports = router;
