from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import re
import time
from scipy.sparse import hstack, csr_matrix

app = Flask(__name__)
CORS(app)

# ── Load models ───────────────────────────────────────────────
print("Loading sentiment models...")
vectorizer  = pickle.load(open('vectorizer.pkl',  'rb'))
model_lr    = pickle.load(open('model_lr.pkl',    'rb'))
model_svm   = pickle.load(open('model_svm.pkl',   'rb'))
model_nb    = pickle.load(open('model_nb.pkl',    'rb'))
model_ridge = pickle.load(open('model_ridge.pkl', 'rb'))
print("Sentiment models loaded!")

MODELS = {
    'logistic_regression': model_lr,
    'svm':                 model_svm,
    'naive_bayes':         model_nb,
    'ridge':               model_ridge,
}

# ── Text preprocessing (must match train_and_save.py) ─────────
def clean_text(s):
    s = (s or "").lower()
    s = re.sub(r'http\S+|<[^>]+>', ' ', s)
    s = re.sub(r"[^a-z0-9\s']", ' ', s)
    return re.sub(r"\s+", ' ', s).strip()

def extract_lexical_features(text_clean):
    words           = text_clean.split()
    char_count      = len(text_clean)
    word_count      = len(words)
    avg_word_length = char_count / (word_count + 1)
    exclamation     = text_clean.count('!')
    question        = text_clean.count('?')
    return [[char_count, word_count, avg_word_length, exclamation, question]]

def preprocess(text):
    cleaned = clean_text(text)
    tfidf   = vectorizer.transform([cleaned])
    lexical = csr_matrix(extract_lexical_features(cleaned))
    features = csr_matrix(hstack([tfidf, lexical]))
    return cleaned, tfidf, lexical, features

def label_to_sentiment(label):
    return 'Positive' if int(label) == 2 else 'Negative'

# ── Routes ────────────────────────────────────────────────────
@app.route('/sentiment/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        if not data or 'text' not in data or not str(data.get('text', '')).strip():
            return jsonify({'success': False, 'error': 'No text provided'}), 400

        text = str(data['text']).strip()
        if len(text) < 3:
            return jsonify({'success': False, 'error': 'Text too short'}), 400

        total_start = time.perf_counter()

        t0, t1, t2, X = None, None, None, None
        t0 = time.perf_counter()
        cleaned, tfidf, lexical, X = preprocess(text)
        t_preproc = (time.perf_counter() - t0) * 1000

        results = {}
        votes = []
        model_timings = {}
        for name, model in MODELS.items():
            m_start = time.perf_counter()
            pred = int(model.predict(X)[0])
            m_end = time.perf_counter()
            model_timings[name] = round((m_end - m_start) * 1000, 2)
            sentiment = label_to_sentiment(pred)
            results[name] = sentiment
            votes.append(pred)

        # Majority vote
        majority_label = 2 if votes.count(2) >= votes.count(1) else 1
        majority_sentiment = label_to_sentiment(majority_label)
        positive_votes = votes.count(2)
        confidence = round((positive_votes / len(votes)) * 100, 1)
        if majority_label == 1:
            confidence = round(100 - confidence, 1)

        total_ms = round((time.perf_counter() - total_start) * 1000, 2)

        return jsonify({
            'success':     True,
            'text':        text,
            'predictions': results,
            'majority':    majority_sentiment,
            'confidence':  confidence,
            'timing': {
                'preprocessing_ms': round(t_preproc, 2),
                'model_ms': model_timings,
                'total_ms': total_ms,
            },
        })

    except Exception as e:
        print(f"Sentiment prediction error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/sentiment/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'sentiment'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
