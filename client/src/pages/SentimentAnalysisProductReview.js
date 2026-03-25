import React, { useState } from 'react';
import axios from 'axios';
import useScrollTitle from '../hooks/useScrollTitle';
import './SentimentAnalysisProductReview.css';

const SentimentAnalysisProductReview = () => {
  const titleVisible = useScrollTitle();
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const logMessage = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLogs([]);

    const trimmed = String(reviewText || '').trim();
    if (!trimmed) {
      setError('Please enter a product review to analyze.');
      return;
    }

    setLoading(true);
    logMessage('Starting sentiment analysis request...');
    const startTime = Date.now();
    logMessage('Calling /api/product-review/predict');
    try {
      const response = await axios.post('/api/product-review/predict', { text: trimmed });
      const timingMs = Date.now() - startTime;

      if (response.data.success) {
        const payload = { ...response.data, timingMs };
        setResult(payload);
        if (response.data.timing) {
          logMessage(`Text clean + TF-IDF + lexical feature extraction: ${response.data.timing.preprocessing_ms} ms`);
          Object.entries(response.data.timing.model_ms).forEach(([m, t]) => {
            logMessage(`${m} runtime: ${t} ms`);
          });
          logMessage(`Server-side processing time: ${response.data.timing.total_ms} ms`);
        }
        logMessage(`API request complete in ${timingMs} ms`);
      } else {
        setError(response.data.error || 'Prediction failed');
        logMessage(`Prediction error: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to connect to product review service';
      setError(errMsg);
      logMessage(`Network error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReviewText('');
    setResult(null);
    setError('');
    setLogs([]);
    logMessage('Form and logs reset');
  };

  return (
    <div className="spr-page">
      <h1 className="spr-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>
        SENTIMENT ANALYSIS OF PRODUCT REVIEWS
      </h1>

      <div className="spr-container">
        <div className="spr-inner">
          <h2 className="spr-section-title">ENTER A PRODUCT REVIEW</h2>

          <form className="spr-form-section" onSubmit={handleSubmit}>
            <div className="spr-form-grid spr-form-grid-main">
              <div className="spr-form-group">
                <div className="spr-label-row">
                  <label htmlFor="review">Review Text</label>
                  <button
                    type="button"
                    className="spr-clipboard-btn"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setReviewText(text);
                        logMessage('Pasted text from clipboard');
                      } catch {
                        logMessage('Clipboard paste failed');
                      }
                    }}
                  >
                    Paste text
                  </button>
                </div>
                <textarea
                  id="review"
                  rows={6}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Type or paste a product review (e.g., 'This product is excellent and arrived on time')"
                />
              </div>

              <div className="spr-form-actions-col">
                <div className="spr-form-actions">
                  <button type="submit" className="spr-submit-btn" disabled={loading}>
                    {loading ? 'ANALYZING...' : 'ANALYZE TEXT'}
                  </button>
                  <button type="button" className="spr-reset-btn" onClick={handleReset}>
                    RESET
                  </button>
                </div>
              </div>
            </div>

            <div className="spr-log-console spr-log-console-fullwidth">
              <h3>Execution Log</h3>
              <div className="spr-log-lines">
                {logs.length === 0
                  ? <p>No logs yet</p>
                  : logs.map((line, idx) => <div key={idx} className="spr-log-line">{line}</div>)}
              </div>
            </div>
          </form>

          {error && <div className="spr-error">{error}</div>}

          {result && (
            <div className="spr-result-section">
              <h2 className="spr-section-title">RESULT</h2>
              <div className="spr-result-grid">
                <div className={`spr-majority-panel spr-score-card ${result.majority === 'Positive' ? 'spr-majority-positive' : 'spr-majority-negative'}`}>
                  <span className="spr-card-title">Majority Sentiment</span>
                  <span className="spr-card-value spr-majority-value">
                    {result.majority}
                  </span>
                </div>

                <div className="spr-runtime-panel spr-score-card">
                  <span className="spr-card-title">ML Endpoint Runtime</span>
                  <span className="spr-card-value">{result.timingMs} ms</span>
                </div>

                <div className="spr-bottom-right-panel spr-score-card">
                  <div className="spr-bottom-right-row">
                    <div className="spr-confidence-subpanel">
                      <span className="spr-card-title">Confidence</span>
                      <span className="spr-card-value">{result.confidence}%</span>
                    </div>
                    <div className="spr-predictions-subpanel">
                      <h3 className="spr-card-title" style={{ marginBottom: '0.6rem' }}>Model Predictions</h3>
                      <ul className="spr-no-bullets">
                        {Object.entries(result.predictions || {}).map(([model, sentiment]) => (
                          <li key={model}>{model.replace('_', ' ')}: {sentiment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisProductReview;
