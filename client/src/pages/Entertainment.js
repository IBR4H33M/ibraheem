import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './Entertainment.css';

const DEFAULT_MOVIES = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  title: i === 0 ? 'The Lord of the Rings: The Return of the King' : 'Coming Soon',
  image: { url: i === 0 ? '/assets/movie1.webp' : null },
}));

const Entertainment = () => {
  const [movies, setMovies]       = useState(DEFAULT_MOVIES);
  const [current, setCurrent]     = useState(0);
  const [editing, setEditing]     = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editFile, setEditFile]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [recommenderName, setRecommenderName] = useState('');
  const [movieQuery, setMovieQuery] = useState('');
  const [searchingMovies, setSearchingMovies] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);
  const [recommendationMsg, setRecommendationMsg] = useState('');
  const fileInputRef              = useRef(null);
  const { isAdmin, token }        = useAuth();
  const titleVisible              = useScrollTitle();

  useEffect(() => {
    axios.get('/api/movies')
      .then(({ data }) => { if (data.length) setMovies(data); })
      .catch(() => {/* use defaults */});
  }, []);

  useEffect(() => {
    const query = movieQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSelectedMovie(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingMovies(true);
      try {
        const { data } = await axios.get('/api/movies/tmdb/search', { params: { q: query } });
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchingMovies(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [movieQuery]);

  const prev = () => { setCurrent(i => (i - 1 + movies.length) % movies.length); setEditing(false); };
  const next = () => { setCurrent(i => (i + 1) % movies.length); setEditing(false); };

  const movie = movies[current];

  const startEdit = () => {
    setEditTitle(movie.title);
    setEditFile(null);
    setSaveMsg('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const form = new FormData();
      form.append('title', editTitle);
      if (editFile) form.append('image', editFile);

      const { data } = await axios.put(`/api/movies/${movie.rank}`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      setMovies(prev => prev.map(m => m.rank === data.rank ? data : m));
      setSaveMsg('Saved!');
      setEditing(false);
    } catch {
      setSaveMsg('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRecommend = async () => {
    if (!recommenderName.trim()) {
      setRecommendationMsg('Please enter your name first.');
      return;
    }
    if (!selectedMovie) {
      setRecommendationMsg('Please select a movie from search results.');
      return;
    }

    setSubmittingRecommendation(true);
    setRecommendationMsg('');
    try {
      await axios.post('/api/movies/recommend', {
        name: recommenderName.trim(),
        tmdbId: selectedMovie.tmdbId,
        title: selectedMovie.title,
        year: selectedMovie.year,
        posterPath: selectedMovie.posterPath,
      });
      setRecommendationMsg('Thanks, your recommendation was submitted.');
      setMovieQuery('');
      setSearchResults([]);
      setSelectedMovie(null);
    } catch {
      setRecommendationMsg('Could not submit recommendation. Please try again.');
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  return (
    <div className="fandom-page">
      <h1 className="fandom-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>FANDOM</h1>

      {/* Hero Video — full width 21:9 */}
      <div className="fandom-hero-video-wrap">
        <video className="fandom-hero-video" muted loop autoPlay playsInline preload="metadata">
          <source src="/assets/fandom.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="top10-outer">
        <div className="top10-wrapper">
          <h2 className="top10-title">Ibraheem's Top 10 Movies</h2>
          <div className="top10-movies-section">

          <div className="movie-slide">
            <button className="slide-btn slide-prev" onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            <div className="slide-content">
              <div className="slide-poster" onClick={isAdmin && editing ? () => fileInputRef.current.click() : undefined}
                   style={isAdmin && editing ? { cursor: 'pointer', outline: '2px dashed #90ee90' } : {}}>
                {movie.image?.url
                  ? <img src={movie.image.url} alt={movie.title} className="slide-poster-img" />
                  : <div className="slide-poster-placeholder" />}
                {isAdmin && editing && (
                  <div className="slide-poster-overlay">Click to change image</div>
                )}
              </div>
              <div className="slide-info">
                <span className="slide-rank">{movie.rank}</span>
                {editing ? (
                  <input
                    className="slide-edit-input"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span className="slide-name">{movie.title}</span>
                )}
              </div>
            </div>

            <button className="slide-btn slide-next" onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {isAdmin && (
            <div className="admin-slide-controls">
              {editing ? (
                <>
                  <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button className="admin-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="admin-edit-btn" onClick={startEdit}>Edit Slide</button>
              )}
              {saveMsg && <span className="admin-save-msg">{saveMsg}</span>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => setEditFile(e.target.files[0])}
              />
            </div>
          )}

          </div>

          <div className="recommend-movie-section">
            <h3 className="recommend-movie-title">Recommend a movie to Ibraheem</h3>

            <div className="recommend-form-row">
              <input
                className="recommend-name-input"
                type="text"
                placeholder="Who are you? -_-"
                value={recommenderName}
                onChange={(e) => setRecommenderName(e.target.value)}
              />
            </div>

            <div className="recommend-form-row">
              <input
                className="recommend-search-input"
                type="text"
                placeholder="Search a movie title"
                value={movieQuery}
                onChange={(e) => {
                  setMovieQuery(e.target.value);
                  setRecommendationMsg('');
                }}
              />
            </div>

            <div className="recommend-results-wrap">
              {searchingMovies && <p className="recommend-search-state">Searching TMDB...</p>}

              {!searchingMovies && movieQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="recommend-search-state">No movies found.</p>
              )}

              {searchResults.length > 0 && (
                <ul className="recommend-results-list">
                  {searchResults.map((result) => (
                    <li key={result.tmdbId}>
                      <button
                        type="button"
                        className={`recommend-result-btn ${selectedMovie?.tmdbId === result.tmdbId ? 'selected' : ''}`}
                        onClick={() => setSelectedMovie(result)}
                      >
                        <span className="recommend-result-line">
                          {result.title} | {result.year || 'N/A'} | {result.publisher || 'Unknown'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="recommend-submit-row">
              <button
                type="button"
                className="recommend-submit-btn"
                onClick={handleRecommend}
                disabled={submittingRecommendation}
              >
                {submittingRecommendation ? 'Submitting...' : 'recommend this movie'}
              </button>
            </div>

            {recommendationMsg && <p className="recommend-message">{recommendationMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entertainment;
