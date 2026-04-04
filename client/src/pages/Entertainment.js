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
  const [adminRecommendations, setAdminRecommendations] = useState([]);
  const [loadingAdminRecommendations, setLoadingAdminRecommendations] = useState(false);
  
  // TV Series states
  const [tvSeries, setTvSeries] = useState(Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, title: 'Coming Soon', image: { url: null } })));
  const [tvSearchQuery, setTvSearchQuery] = useState('');
  const [searchingTv, setSearchingTv] = useState(false);
  const [tvSearchResults, setTvSearchResults] = useState([]);
  const [selectedTvForRank, setSelectedTvForRank] = useState(null);
  const [editingTvRank, setEditingTvRank] = useState(null);
  const [tvRecommenderName, setTvRecommenderName] = useState('');
  const [tvRecommendQuery, setTvRecommendQuery] = useState('');
  const [searchingTvRecommend, setSearchingTvRecommend] = useState(false);
  const [tvRecommendResults, setTvRecommendResults] = useState([]);
  const [selectedTvRecommend, setSelectedTvRecommend] = useState(null);
  const [submittingTvRecommendation, setSubmittingTvRecommendation] = useState(false);
  const [tvRecommendationMsg, setTvRecommendationMsg] = useState('');
  const [adminTvRecommendations, setAdminTvRecommendations] = useState([]);
  const [loadingAdminTvRecommendations, setLoadingAdminTvRecommendations] = useState(false);
  const [draggedTvIndex, setDraggedTvIndex] = useState(null);
  const [dragOverTvIndex, setDragOverTvIndex] = useState(null);
  
  const fileInputRef              = useRef(null);
  const { isAdmin, token }        = useAuth();
  const titleVisible              = useScrollTitle();

  useEffect(() => {
    axios.get('/api/movies')
      .then(({ data }) => { if (data.length) setMovies(data); })
      .catch(() => {/* use defaults */});
    axios.get('/api/tv-series')
      .then(({ data }) => { if (data.length) setTvSeries(data); })
      .catch(() => {});
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

  useEffect(() => {
    if (!isAdmin || !token) {
      setAdminRecommendations([]);
      setAdminTvRecommendations([]);
      return;
    }

    let mounted = true;

    const fetchRecommendations = async () => {
      setLoadingAdminRecommendations(true);
      try {
        const { data } = await axios.get('/api/movies/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setAdminRecommendations(data || []);
      } catch {
        if (mounted) setAdminRecommendations([]);
      } finally {
        if (mounted) setLoadingAdminRecommendations(false);
      }
    };

    const fetchTvRecommendations = async () => {
      setLoadingAdminTvRecommendations(true);
      try {
        const { data } = await axios.get('/api/tv-series/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setAdminTvRecommendations(data || []);
      } catch {
        if (mounted) setAdminTvRecommendations([]);
      } finally {
        if (mounted) setLoadingAdminTvRecommendations(false);
      }
    };

    fetchRecommendations();
    fetchTvRecommendations();

    return () => {
      mounted = false;
    };
  }, [isAdmin, token]);

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
      const { data } = await axios.post('/api/movies/recommend', {
        name: recommenderName.trim(),
        tmdbId: selectedMovie.tmdbId,
        title: selectedMovie.title,
        year: selectedMovie.year,
        posterPath: selectedMovie.posterPath,
      });

      if (isAdmin && data?.recommendation) {
        setAdminRecommendations(prev => [data.recommendation, ...prev]);
      }

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

  // TV Series search for admin editing
  useEffect(() => {
    const query = tvSearchQuery.trim();
    if (query.length < 2) {
      setTvSearchResults([]);
      setSelectedTvForRank(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingTv(true);
      try {
        const { data } = await axios.get('/api/tv-series/tmdb/search', { params: { q: query } });
        setTvSearchResults(data || []);
      } catch {
        setTvSearchResults([]);
      } finally {
        setSearchingTv(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [tvSearchQuery]);

  // TV Series search for recommendations
  useEffect(() => {
    const query = tvRecommendQuery.trim();
    if (query.length < 2) {
      setTvRecommendResults([]);
      setSelectedTvRecommend(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingTvRecommend(true);
      try {
        const { data } = await axios.get('/api/tv-series/tmdb/search', { params: { q: query } });
        setTvRecommendResults(data || []);
      } catch {
        setTvRecommendResults([]);
      } finally {
        setSearchingTvRecommend(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [tvRecommendQuery]);

  const handleTvSeriesUpdate = async (rank) => {
    if (!selectedTvForRank) return;
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/tv-series/${rank}`, {
        title: selectedTvForRank.title,
        posterUrl: selectedTvForRank.posterUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTvSeries(prev => prev.map(s => s.rank === rank ? data : s));
      setEditingTvRank(null);
      setTvSearchQuery('');
      setSelectedTvForRank(null);
      setTvSearchResults([]);
    } catch {
      alert('Failed to update TV show');
    } finally {
      setSaving(false);
    }
  };

  const handleTvRecommend = async () => {
    if (!tvRecommenderName.trim()) {
      setTvRecommendationMsg('Please enter your name first.');
      return;
    }
    if (!selectedTvRecommend) {
      setTvRecommendationMsg('Please select a TV show from search results.');
      return;
    }

    setSubmittingTvRecommendation(true);
    setTvRecommendationMsg('');
    try {
      const { data } = await axios.post('/api/tv-series/recommend', {
        name: tvRecommenderName.trim(),
        tmdbId: selectedTvRecommend.tmdbId,
        title: selectedTvRecommend.title,
        year: selectedTvRecommend.year,
        posterPath: selectedTvRecommend.posterPath,
      });

      if (isAdmin && data?.recommendation) {
        setAdminTvRecommendations(prev => [data.recommendation, ...prev]);
      }

      setTvRecommendationMsg('Thanks, your recommendation was submitted.');
      setTvRecommendQuery('');
      setTvRecommendResults([]);
      setSelectedTvRecommend(null);
    } catch {
      setTvRecommendationMsg('Could not submit recommendation. Please try again.');
    } finally {
      setSubmittingTvRecommendation(false);
    }
  };

  const handleTvDragStart = (index) => {
    setDraggedTvIndex(index);
  };

  const handleTvDragOver = (e, index) => {
    e.preventDefault();
    setDragOverTvIndex(index);
  };

  const handleTvDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedTvIndex === null || draggedTvIndex === dropIndex) {
      setDraggedTvIndex(null);
      setDragOverTvIndex(null);
      return;
    }

    const reordered = [...tvSeries];
    const [draggedItem] = reordered.splice(draggedTvIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    // Update ranks
    const updated = reordered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setTvSeries(updated);
    setDraggedTvIndex(null);
    setDragOverTvIndex(null);

    // Save to backend
    try {
      await axios.post('/api/tv-series/reorder', {
        series: updated.map(s => ({ _id: s._id, rank: s.rank }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Reorder error:', err.response?.data || err.message);
      alert('Failed to save new order');
    }
  };

  const handleTvDragEnd = () => {
    setDraggedTvIndex(null);
    setDragOverTvIndex(null);
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
          {isAdmin && (
            <div className="admin-recommendations-section">
              <h2 className="admin-recommendations-title">Recommended Movies (Admin)</h2>

              {loadingAdminRecommendations ? (
                <p className="admin-recommendations-state">Loading recommendations...</p>
              ) : adminRecommendations.length === 0 ? (
                <p className="admin-recommendations-state">No recommendations yet.</p>
              ) : (
                <ul className="admin-recommendations-list">
                  {adminRecommendations.map((rec) => (
                    <li key={rec._id} className="admin-recommendation-item">
                      <div className="admin-recommendation-poster-wrap">
                        {rec.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${rec.posterPath}`}
                            alt={rec.title}
                            className="admin-recommendation-poster"
                          />
                        ) : (
                          <span className="admin-recommendation-poster-fallback">No Image</span>
                        )}
                      </div>

                      <div className="admin-recommendation-meta">
                        <span className="admin-recommendation-title">
                          {rec.title}{rec.year ? ` (${rec.year})` : ''}
                        </span>
                        <span className="admin-recommendation-by">Recommended by: {rec.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <h2 className="top10-title">Ibraheem's Top 10 Movies</h2>
          <div className="top10-movies-section">

          <div className="movie-slide">
            <button className="slide-btn slide-prev" onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            <div className="slide-content" key={current}>
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
                        <span className="recommend-result-poster-wrap">
                          {result.posterUrl ? (
                            <img
                              src={result.posterUrl}
                              alt={result.title}
                              className="recommend-result-poster"
                            />
                          ) : (
                            <span className="recommend-result-poster-fallback">No Image</span>
                          )}
                        </span>

                        <span className="recommend-result-meta">
                          <span className="recommend-result-title">{result.title}</span>
                          <span className="recommend-result-release">
                            Release date: {result.releaseDate || 'N/A'}
                          </span>
                          <span className="recommend-result-publisher">{result.publisher || 'Unknown'}</span>
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

          {/* TV Series Section */}
          <h2 className="top10-title" style={{ marginTop: '3rem' }}>Ibraheem's Top 10 TV Shows</h2>
          <div className="tv-series-grid">
            {tvSeries.map((series, index) => (
              <div
                key={series._id || series.rank}
                className={`tv-series-card ${dragOverTvIndex === index ? 'drag-over' : ''} ${draggedTvIndex === index ? 'dragging' : ''}`}
                draggable={isAdmin}
                onDragStart={() => handleTvDragStart(index)}
                onDragOver={(e) => handleTvDragOver(e, index)}
                onDrop={(e) => handleTvDrop(e, index)}
                onDragEnd={handleTvDragEnd}
              >
                <div className="tv-series-rank">{series.rank}</div>
                {isAdmin && <div className="tv-drag-handle">☰</div>}
                <div className="tv-series-poster">
                  {series.image?.url ? (
                    <img src={series.image.url} alt={series.title} className="tv-series-img" />
                  ) : (
                    <div className="tv-series-placeholder" />
                  )}
                </div>
                <div className="tv-series-title">{series.title}</div>
                {isAdmin && (
                  <div className="tv-series-admin">
                    {editingTvRank === series.rank ? (
                      <div className="tv-edit-form">
                        <input
                          className="tv-search-input"
                          placeholder="Search TV shows"
                          value={tvSearchQuery}
                          onChange={(e) => setTvSearchQuery(e.target.value)}
                        />
                        {searchingTv && <span className="tv-search-state">Searching...</span>}
                        {tvSearchResults.length > 0 && !selectedTvForRank && (
                          <div className="tv-search-results">
                            {tvSearchResults.slice(0, 5).map((result) => (
                              <button
                                key={result.tmdbId}
                                className="tv-search-result-btn"
                                onClick={() => setSelectedTvForRank(result)}
                              >
                                {result.title} {result.year ? `(${result.year})` : ''}
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedTvForRank && (
                          <div className="tv-selected">
                            <span>{selectedTvForRank.title}</span>
                            <button onClick={() => setSelectedTvForRank(null)}>✕</button>
                          </div>
                        )}
                        <div className="tv-edit-actions">
                          <button className="admin-save-btn" onClick={() => handleTvSeriesUpdate(series.rank)} disabled={saving}>
                            {saving ? 'Saving…' : 'SAVE'}
                          </button>
                          <button className="admin-cancel-btn" onClick={() => { setEditingTvRank(null); setTvSearchQuery(''); setSelectedTvForRank(null); setTvSearchResults([]); }}>
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="admin-edit-btn" onClick={() => setEditingTvRank(series.rank)}>EDIT</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* TV Series Recommendations */}
          <div className="recommend-movie-section" style={{ marginTop: '2rem' }}>
            <h3 className="recommend-movie-title">Recommend a TV Show to Ibraheem</h3>

            <div className="recommend-form-row">
              <input
                className="recommend-name-input"
                type="text"
                placeholder="Who are you? -_-"
                value={tvRecommenderName}
                onChange={(e) => setTvRecommenderName(e.target.value)}
              />
            </div>

            <div className="recommend-form-row">
              <input
                className="recommend-search-input"
                type="text"
                placeholder="Search a TV show title"
                value={tvRecommendQuery}
                onChange={(e) => {
                  setTvRecommendQuery(e.target.value);
                  setTvRecommendationMsg('');
                }}
              />
            </div>

            <div className="recommend-results-wrap">
              {searchingTvRecommend && <p className="recommend-search-state">Searching TMDB...</p>}

              {!searchingTvRecommend && tvRecommendQuery.trim().length >= 2 && tvRecommendResults.length === 0 && (
                <p className="recommend-search-state">No TV shows found.</p>
              )}

              {tvRecommendResults.length > 0 && (
                <ul className="recommend-results-list">
                  {tvRecommendResults.map((result) => (
                    <li key={result.tmdbId}>
                      <button
                        type="button"
                        className={`recommend-result-btn ${selectedTvRecommend?.tmdbId === result.tmdbId ? 'selected' : ''}`}
                        onClick={() => setSelectedTvRecommend(result)}
                      >
                        <span className="recommend-result-poster-wrap">
                          {result.posterUrl ? (
                            <img
                              src={result.posterUrl}
                              alt={result.title}
                              className="recommend-result-poster"
                            />
                          ) : (
                            <span className="recommend-result-poster-fallback">No Image</span>
                          )}
                        </span>

                        <span className="recommend-result-meta">
                          <span className="recommend-result-title">{result.title}</span>
                          <span className="recommend-result-release">
                            First aired: {result.firstAirDate || 'N/A'}
                          </span>
                          <span className="recommend-result-publisher">{result.network || 'Unknown'}</span>
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
                onClick={handleTvRecommend}
                disabled={submittingTvRecommendation}
              >
                {submittingTvRecommendation ? 'Submitting...' : 'recommend this show'}
              </button>
            </div>

            {tvRecommendationMsg && <p className="recommend-message">{tvRecommendationMsg}</p>}
          </div>

          {isAdmin && adminTvRecommendations.length > 0 && (
            <div className="gr-admin-section" style={{ marginTop: '1.5rem' }}>
              <h3 className="gr-admin-title">Received TV Show Recommendations</h3>
              {loadingAdminTvRecommendations ? (
                <p className="gr-admin-state">Loading recommendations...</p>
              ) : (
                <ul className="gr-admin-list">
                  {adminTvRecommendations.map(rec => (
                    <li key={rec._id} className="gr-admin-item">
                      <span className="gr-admin-game">{rec.title}{rec.year ? ` (${rec.year})` : ''}</span>
                      <span className="gr-admin-by">— {rec.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Entertainment;
