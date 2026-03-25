import pandas as pd
import numpy as np
import pickle
import re
from pathlib import Path
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score

# ── Clean text (must match app.py) ────────────────────────────
def clean_text(s):
    s = (s or "").lower()
    s = re.sub(r'http\S+|<[^>]+>', ' ', s)
    s = re.sub(r"[^a-z0-9\s']", ' ', s)
    return re.sub(r"\s+", ' ', s).strip()

# ── Lexical features (must match app.py) ──────────────────────
def extract_lexical_features(df):
    features = pd.DataFrame()
    features['char_count']        = df['text_clean'].str.len()
    features['word_count']        = df['text_clean'].str.split().str.len()
    features['avg_word_length']   = features['char_count'] / (features['word_count'] + 1)
    features['exclamation_count'] = df['text_clean'].str.count('!')
    features['question_count']    = df['text_clean'].str.count(r'\?')
    return features

# ── Load dataset ───────────────────────────────────────────────
print("Loading dataset...")
p = Path('test.ft.txt')
if not p.exists():
    raise FileNotFoundError("test.ft.txt not found. Place it in the same folder as this script.")

text  = p.read_text(encoding='utf-8', errors='replace')
lines = [l.strip() for l in text.splitlines() if l.strip()]
rows  = []
for l in lines:
    if ' ' in l:
        label_token, review = l.split(' ', 1)
    else:
        label_token, review = l, ''
    m = re.match(r"__label__([0-9]+)", label_token)
    label = int(m.group(1)) if m else label_token
    rows.append({'label': label, 'text': review})

df = pd.DataFrame(rows)
df['text_clean'] = df['text'].apply(clean_text)
print(f"Dataset loaded: {df.shape[0]} rows")

# ── Train/val split ───────────────────────────────────────────
train_df, val_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['label'])

# ── Feature engineering ───────────────────────────────────────
vectorizer    = TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_df=0.95, stop_words='english')
X_train_tfidf = vectorizer.fit_transform(train_df['text_clean'])
X_val_tfidf   = vectorizer.transform(val_df['text_clean'])

train_lex = csr_matrix(extract_lexical_features(train_df).values)
val_lex   = csr_matrix(extract_lexical_features(val_df).values)

# Explicit csr_matrix cast fixes Pylance type error on .fit() calls
X_train: csr_matrix = csr_matrix(hstack([X_train_tfidf, train_lex]))
X_val:   csr_matrix = csr_matrix(hstack([X_val_tfidf,   val_lex]))

y_train = train_df['label'].values
y_val   = val_df['label'].values

# ── Train models ──────────────────────────────────────────────
print("\nTraining models...")

model_lr    = LogisticRegression(max_iter=1000)
model_svm   = LinearSVC(max_iter=2000)
model_nb    = MultinomialNB()
model_ridge = RidgeClassifier()

model_lr.fit(X_train,    y_train)
model_svm.fit(X_train,   y_train)
model_nb.fit(X_train,    y_train)
model_ridge.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────────
print("\nValidation Accuracy:")
for name, model in [
    ('Logistic Regression', model_lr),
    ('SVM (LinearSVC)',     model_svm),
    ('Multinomial NB',      model_nb),
    ('Ridge Classifier',    model_ridge),
]:
    acc = accuracy_score(y_val, model.predict(X_val))
    print(f"  {name}: {acc:.4f}")

# ── Save ──────────────────────────────────────────────────────
pickle.dump(vectorizer,  open('vectorizer.pkl',  'wb'))
pickle.dump(model_lr,    open('model_lr.pkl',    'wb'))
pickle.dump(model_svm,   open('model_svm.pkl',   'wb'))
pickle.dump(model_nb,    open('model_nb.pkl',    'wb'))
pickle.dump(model_ridge, open('model_ridge.pkl', 'wb'))

print("\n✅ Saved: vectorizer.pkl, model_lr.pkl, model_svm.pkl, model_nb.pkl, model_ridge.pkl")
