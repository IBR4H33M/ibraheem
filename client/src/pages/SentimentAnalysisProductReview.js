import React, { useState } from 'react';
import axios from 'axios';
import useScrollTitle from '../hooks/useScrollTitle';
import './SentimentAnalysisProductReview.css';

const SentimentAnalysisProductReview = () => {
  const titleVisible = useScrollTitle();
  const predictionTimeoutMs = 120000;
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [showWakingNotice, setShowWakingNotice] = useState(false);
  const spinnerChars = ['|', '/', '-', '\\'];

  const logMessage = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLogs([]);
    setShowWakingNotice(false);

    const trimmed = String(reviewText || '').trim();
    if (!trimmed) {
      setError('Please enter a product review to analyze.');
      return;
    }

    setLoading(true);
    logMessage('Starting sentiment analysis request...');
    
    // Start spinner animation
    let frame = 0;
    const spinnerInterval = setInterval(() => {
      frame = (frame + 1) % spinnerChars.length;
      setSpinnerFrame(frame);
    }, 150);
    
    const startTime = Date.now();
    logMessage('Calling /api/product-review/predict');

    const coldStartNoticeTimer = setTimeout(() => {
      logMessage('Starting Flask server...');
      setShowWakingNotice(true);
    }, 6000);
    
    try {
      const response = await axios.post('/api/product-review/predict', { text: trimmed }, {
        timeout: predictionTimeoutMs
      });
      
      clearTimeout(coldStartNoticeTimer);
      clearInterval(spinnerInterval);
      setShowWakingNotice(false);
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
      clearTimeout(coldStartNoticeTimer);
      clearInterval(spinnerInterval);
      setShowWakingNotice(false);
      
      if (err.code === 'ECONNABORTED' || err.response?.status === 504) {
        logMessage('Flask server is starting (cold start)...');
        logMessage('This may take 30-60 seconds on free tier. Please wait...');
        setError('Server is waking up from sleep. Please try again in a moment.');
      } else {
        const errMsg = err.response?.data?.error || err.message || 'Failed to connect to product review service';
        setError(errMsg);
        logMessage(`Network error: ${errMsg}`);
      }
    } finally {
      clearTimeout(coldStartNoticeTimer);
      clearInterval(spinnerInterval);
      setShowWakingNotice(false);
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
                {loading && showWakingNotice && (
                  <div className="spr-log-line spr-spinner">
                    {spinnerChars[spinnerFrame]} The Python service may be waking from sleep. Please wait...
                  </div>
                )}
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
                  <div className="spr-majority-confidence">
                    <span className="spr-card-title">Confidence</span>
                    <span className="spr-card-value">{result.confidence}%</span>
                  </div>
                </div>

                <div className="spr-runtime-panel spr-score-card">
                  <span className="spr-card-title">ML Processing Runtime</span>
                  <span className="spr-card-value">{result.timing?.total_ms ?? result.timingMs} ms</span>
                </div>

                <div className="spr-bottom-right-panel spr-score-card">
                  <div className="spr-predictions-subpanel">
                    <h3 className="spr-card-title" style={{ marginBottom: '0.6rem' }}>Model Predictions</h3>
                    <ul className="spr-no-bullets">
                      {Object.entries(result.predictions || {}).map(([model, sentiment]) => {
                        const isPositive = String(sentiment).toLowerCase() === 'positive';
                        return (
                          <li key={model} className={`spr-prediction-item ${isPositive ? 'spr-prediction-positive' : 'spr-prediction-negative'}`}>
                            <span className="spr-prediction-model">{model.replace('_', ' ')}</span>
                            <span className="spr-prediction-badge">
                              <span className="spr-prediction-icon" aria-hidden="true">
                                {isPositive ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M8.5 14.5c1 1.2 2 1.8 3.5 1.8s2.5-.6 3.5-1.8" />
                                    <circle cx="9" cy="10" r="0.5" fill="currentColor" />
                                    <circle cx="15" cy="10" r="0.5" fill="currentColor" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M8.5 16c1-1.1 2-1.6 3.5-1.6s2.5.5 3.5 1.6" />
                                    <path d="M9 10h.01" />
                                    <path d="M15 10h.01" />
                                  </svg>
                                )}
                              </span>
                              <span>{sentiment}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
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
