import React, { useState, useEffect } from 'react';
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

  // Add JSON-LD structured data for SEO
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Sentiment Analysis of Product Reviews",
      "description": "Advanced machine learning application for analyzing customer product reviews and predicting sentiment polarity. Trained on 40,000 Amazon customer reviews using multiple models including Logistic Regression, Support Vector Machine (SVM), Multinomial Naive Bayes, and Ridge Classifier. Uses TF-IDF text feature extraction and majority voting across four models to determine overall sentiment. Demonstrates natural language processing, text classification, and ensemble learning techniques. Built with Python scikit-learn backend (Flask REST API), Express.js proxy server, and React frontend for real-time interactive predictions.",
      "url": "https://ibraheemibnanwar.me/techspace/Sentiment-Analysis-of-Product-Reviews",
      "applicationCategory": "AnalyticsApplication",
      "author": {
        "@type": "Person",
        "name": "Ibraheem Ibn Anwar",
        "url": "https://ibraheemibnanwar.me"
      },
      "datePublished": "2024-01-15",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "keywords": "sentiment analysis, product reviews, Amazon reviews, machine learning, NLP, text classification, natural language processing, customer feedback analysis, sentiment prediction, Logistic Regression, SVM, Naive Bayes, Ridge Classifier, ensemble learning, TF-IDF, text mining, data science, deep learning alternative",
      "programmingLanguage": ["Python", "JavaScript"],
      "image": "https://ibraheemibnanwar.me/assets/sentiment-analysis-image.jpg",
      "codeRepository": {
        "@type": "Thing",
        "name": "GitHub - Sentiment Analysis",
        "url": "https://github.com/IBR4H33M/Sentiment-Analysis-of-product-reviews"
      },
      "dataset": {
        "@type": "Thing",
        "name": "Amazon Reviews for Sentiment Analysis",
        "url": "https://www.kaggle.com/datasets/bittlingmayer/amazonreviews",
        "description": "40,000 customer reviews from Amazon used for model training"
      }
    };

    // Remove old schema script if exists
    const existingScript = document.querySelector('script[data-schema="sentiment-jsonld"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject new script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'sentiment-jsonld');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="sentiment-jsonld"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

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
