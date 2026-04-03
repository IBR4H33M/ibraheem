import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useScrollTitle from '../hooks/useScrollTitle';
import './Gaming.css';

const Gaming = () => {
  const [captures, setCaptures]     = useState([]);
  const [current, setCurrent]       = useState(0);
  const [adding, setAdding]         = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newFile, setNewFile]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const addFileRef                  = useRef(null);
  const { isAdmin, token }          = useAuth();
  const titleVisible                = useScrollTitle();

  // Recently Played Games state
  const [recentGames, setRecentGames]       = useState([]);
  const [rgAdding, setRgAdding]             = useState(false);
  const [rgSearchQuery, setRgSearchQuery]   = useState('');
  const [rgSearching, setRgSearching]       = useState(false);
  const [rgSearchResults, setRgSearchResults] = useState([]);
  const [rgSelectedGame, setRgSelectedGame] = useState(null);
  const [rgSaving, setRgSaving]             = useState(false);
  const [rgMsg, setRgMsg]                   = useState('');
  const rgTrackRef                          = useRef(null);
  const rgDraggingRef                       = useRef(false);
  const rgDragStartXRef                     = useRef(0);
  const rgStartScrollLeftRef                = useRef(0);
  const [rgDragging, setRgDragging]         = useState(false);
  const [rgCanScrollLeft, setRgCanScrollLeft]   = useState(false);
  const [rgCanScrollRight, setRgCanScrollRight] = useState(false);

  // Game recommendation states
  const [recommenderName, setRecommenderName] = useState('');
  const [gameQuery, setGameQuery] = useState('');
  const [searchingGames, setSearchingGames] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);
  const [recommendationMsg, setRecommendationMsg] = useState('');
  const [adminRecommendations, setAdminRecommendations] = useState([]);
  const [loadingAdminRecommendations, setLoadingAdminRecommendations] = useState(false);

  useEffect(() => {
    axios.get('/api/game-captures')
      .then(({ data }) => { if (data.length) setCaptures(data); })
      .catch(() => {});
    axios.get('/api/recent-games')
      .then(({ data }) => { if (data.length) setRecentGames(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const query = gameQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSelectedGame(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingGames(true);
      try {
        const { data } = await axios.get('/api/games/search', { params: { q: query } });
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchingGames(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [gameQuery]);

  useEffect(() => {
    const query = rgSearchQuery.trim();
    if (query.length < 2) {
      setRgSearchResults([]);
      setRgSelectedGame(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setRgSearching(true);
      try {
        const { data } = await axios.get('/api/games/search', { params: { q: query } });
        setRgSearchResults(data || []);
      } catch {
        setRgSearchResults([]);
      } finally {
        setRgSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [rgSearchQuery]);

  useEffect(() => {
    if (!isAdmin || !token) {
      setAdminRecommendations([]);
      return;
    }

    let mounted = true;
    const fetchRecommended = async () => {
      setLoadingAdminRecommendations(true);
      try {
        const { data } = await axios.get('/api/games/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setAdminRecommendations(data || []);
      } catch {
        if (mounted) setAdminRecommendations([]);
      } finally {
        if (mounted) setLoadingAdminRecommendations(false);
      }
    };

    fetchRecommended();
    return () => { mounted = false; };
  }, [isAdmin, token]);

  const total = captures.length;
  const prev  = () => setCurrent(i => (i - 1 + Math.max(total, 1)) % Math.max(total, 1));
  const next  = () => setCurrent(i => (i + 1) % Math.max(total, 1));

  // Auto-advance every 3 s
  useEffect(() => {
    if (total < 2) return;
    const id = setInterval(() => setCurrent(i => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total]);

  const handleAdd = async () => {
    if (!newGameName.trim() || !newFile) {
      setSaveMsg('Enter a game name and choose an image.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const form = new FormData();
      form.append('gameName', newGameName.trim());
      form.append('image', newFile);
      const { data } = await axios.post('/api/game-captures', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setCaptures(prev => [...prev, data]);
      setCurrent(captures.length);
      setAdding(false);
      setNewGameName('');
      setNewFile(null);
      setSaveMsg('Added!');
    } catch {
      setSaveMsg('Failed to add.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!total) return;
    const cap = captures[current];
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.delete(`/api/game-captures/${cap._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = captures.filter((_, i) => i !== current);
      setCaptures(updated);
      setCurrent(c => Math.min(c, Math.max(updated.length - 1, 0)));
      setSaveMsg('Removed!');
    } catch {
      setSaveMsg('Failed to remove.');
    } finally {
      setSaving(false);
    }
  };

  const capture = captures[current] || null;

  const handleRgAdd = async () => {
    if (!rgSelectedGame) { setRgMsg('Please select a game from search results.'); return; }
    setRgSaving(true); setRgMsg('');
    try {
      const { data } = await axios.post('/api/recent-games', {
        title: rgSelectedGame.title,
        igdbId: rgSelectedGame.igdbId,
        coverUrl: rgSelectedGame.coverUrl,
        year: rgSelectedGame.year,
        platforms: rgSelectedGame.platforms
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentGames(prev => [...prev, data]);
      setRgAdding(false); setRgSearchQuery(''); setRgSelectedGame(null); setRgSearchResults([]); setRgMsg('Added!');
    } catch { setRgMsg('Failed to add.'); }
    finally { setRgSaving(false); }
  };

  const handleRgDelete = async (id) => {
    setRgSaving(true); setRgMsg('');
    try {
      await axios.delete(`/api/recent-games/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRecentGames(prev => prev.filter(g => g._id !== id));
      setRgMsg('Removed!');
    } catch { setRgMsg('Failed to remove.'); }
    finally { setRgSaving(false); }
  };

  const handleRecommend = async () => {
    if (!recommenderName.trim()) {
      setRecommendationMsg('Please enter your name first.');
      return;
    }
    if (!selectedGame) {
      setRecommendationMsg('Please select a game from the search results.');
      return;
    }

    setSubmittingRecommendation(true);
    setRecommendationMsg('');
    try {
      const { data } = await axios.post('/api/games/recommend', {
        name: recommenderName.trim(),
        igdbId: selectedGame.igdbId,
        title: selectedGame.title,
        year: selectedGame.year,
        coverUrl: selectedGame.coverUrl,
        platforms: selectedGame.platforms,
      });

      if (isAdmin && data?.recommendation) {
        setAdminRecommendations(prev => [data.recommendation, ...prev]);
      }

      setRecommendationMsg('Thanks, your recommendation was submitted.');
      setGameQuery('');
      setSearchResults([]);
      setSelectedGame(null);
    } catch {
      setRecommendationMsg('Could not submit recommendation. Please try again.');
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  const updateRgScrollBtns = () => {
    const el = rgTrackRef.current;
    if (!el) return;
    setRgCanScrollLeft(el.scrollLeft > 0);
    setRgCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateRgScrollBtns();
  }, [recentGames]);

  const rgScrollBy = (dir) => {
    const el = rgTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const handleRgMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, textarea, select')) return;
    const el = rgTrackRef.current;
    if (!el) return;
    rgDraggingRef.current = true;
    setRgDragging(true);
    rgDragStartXRef.current = e.pageX - el.offsetLeft;
    rgStartScrollLeftRef.current = el.scrollLeft;
  };

  const handleRgMouseMove = (e) => {
    if (!rgDraggingRef.current) return;
    const el = rgTrackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - rgDragStartXRef.current) * 1.25;
    el.scrollLeft = rgStartScrollLeftRef.current - walk;
  };

  const stopRgDrag = () => {
    rgDraggingRef.current = false;
    setRgDragging(false);
  };

  return (
    <div className="gaming-page">
      <h1 className="gaming-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>GAMING</h1>

      {/* ── Full-width 16:9 in-game captures slideshow ── */}
      <section className="gaming-captures-section">
        <div className="gaming-captures-slider">
          {total > 1 && (
            <button className="gc-arrow gc-arrow-left" onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="gaming-captures-image-wrap">
            {capture?.image?.url
              ? <img key={current} src={capture.image.url} alt={capture.gameName} className="gc-img" />
              : <div className="gc-placeholder" />}
            {capture?.gameName && (
              <span className="gc-game-name">{capture.gameName}</span>
            )}
            {isAdmin && total > 0 && (
              <button
                className="gc-delete-btn"
                onClick={handleRemove}
                disabled={saving}
                title="Delete this capture"
              >
                ✕
              </button>
            )}
          </div>

          {total > 1 && (
            <button className="gc-arrow gc-arrow-right" onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        <div className="gaming-captures-footer">
          <span className="gaming-captures-label">RECENT IN-GAME CAPTURES <svg className="title-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg></span>

          {isAdmin && (
            <div className="gc-admin-controls">
              {!adding ? (
                <>
                  <button className="admin-edit-btn" onClick={() => { setAdding(true); setSaveMsg(''); }}>+ ADD</button>
                </>
              ) : (
                <div className="gc-add-form">
                  <input
                    className="gc-add-input"
                    placeholder="Game name"
                    value={newGameName}
                    onChange={e => setNewGameName(e.target.value)}
                  />
                  <button className="admin-edit-btn" onClick={() => addFileRef.current.click()}>
                    {newFile ? '✓ Image selected' : 'Choose Image'}
                  </button>
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => setNewFile(e.target.files[0])}
                  />
                  <button className="admin-save-btn" onClick={handleAdd} disabled={saving}>
                    {saving ? 'Saving…' : 'SAVE'}
                  </button>
                  <button className="admin-cancel-btn" onClick={() => { setAdding(false); setNewGameName(''); setNewFile(null); setSaveMsg(''); }}>
                    CANCEL
                  </button>
                </div>
              )}
              {saveMsg && <span className="admin-save-msg">{saveMsg}</span>}
            </div>
          )}
        </div>
      </section>

      {/* ── Recently Played Games ── */}
      <div className="rg-outer">
        <h2 className="rg-heading"><svg className="title-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>&nbsp;RECENTLY PLAYED GAMES</h2>
        <div className="rg-scroll-wrapper">
          {rgCanScrollLeft && (
            <button className="rg-arrow rg-arrow-left" onClick={() => rgScrollBy(-1)} aria-label="Scroll left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div
            className={`rg-section ${rgDragging ? 'is-dragging' : ''}`}
            ref={rgTrackRef}
            onScroll={updateRgScrollBtns}
            onMouseDown={handleRgMouseDown}
            onMouseMove={handleRgMouseMove}
            onMouseUp={stopRgDrag}
            onMouseLeave={stopRgDrag}
            onDragStart={(e) => e.preventDefault()}
          >
            <div className="rg-track">
              {recentGames.map(game => (
                <div key={game._id} className="rg-card">
                  {isAdmin && (
                    <button
                      className="rg-delete-btn"
                      onClick={() => handleRgDelete(game._id)}
                      disabled={rgSaving}
                      title="Remove game"
                    >✕</button>
                  )}
                  <div className="rg-img-wrap">
                    {game.coverUrl
                      ? <img src={game.coverUrl} alt={game.title} className="rg-img" />
                      : <div className="rg-img-placeholder" />}
                  </div>
                  <span className="rg-title">{game.title}</span>
                </div>
              ))}

              {recentGames.length === 0 && !isAdmin && (
                <p className="rg-empty">No games yet.</p>
              )}
            </div>
          </div>
          {rgCanScrollRight && (
            <button className="rg-arrow rg-arrow-right" onClick={() => rgScrollBy(1)} aria-label="Scroll right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="rg-admin-bar">
            {!rgAdding ? (
              <button className="admin-edit-btn" onClick={() => { setRgAdding(true); setRgMsg(''); }}>+ ADD GAME</button>
            ) : (
              <div className="rg-add-form">
                <input
                  className="gc-add-input"
                  placeholder="Search game title"
                  value={rgSearchQuery}
                  onChange={e => setRgSearchQuery(e.target.value)}
                />
                {rgSearching && <span className="rg-search-state">Searching...</span>}
                {!rgSearching && rgSearchQuery.trim().length >= 2 && rgSearchResults.length === 0 && (
                  <span className="rg-search-state">No games found.</span>
                )}
                {rgSearchResults.length > 0 && !rgSelectedGame && (
                  <div className="rg-search-results">
                    {rgSearchResults.slice(0, 5).map(result => (
                      <button
                        key={result.igdbId}
                        className="rg-search-result-btn"
                        onClick={() => setRgSelectedGame(result)}
                      >
                        {result.title} {result.year ? `(${result.year})` : ''}
                      </button>
                    ))}
                  </div>
                )}
                {rgSelectedGame && (
                  <div className="rg-selected-game">
                    <span>{rgSelectedGame.title} {rgSelectedGame.year ? `(${rgSelectedGame.year})` : ''}</span>
                    <button className="rg-clear-btn" onClick={() => setRgSelectedGame(null)}>✕</button>
                  </div>
                )}
                <button className="admin-save-btn" onClick={handleRgAdd} disabled={rgSaving}>
                  {rgSaving ? 'Saving…' : 'SAVE'}
                </button>
                <button className="admin-cancel-btn" onClick={() => { setRgAdding(false); setRgSearchQuery(''); setRgSelectedGame(null); setRgSearchResults([]); setRgMsg(''); }}>
                  CANCEL
                </button>
              </div>
            )}
            {rgMsg && <span className="admin-save-msg">{rgMsg}</span>}
          </div>
        )}
      </div>

      {/* ── Game Recommendations ── */}
      <div className="gr-outer">
        <h2 className="gr-heading"><svg className="title-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>&nbsp;RECOMMEND A GAME</h2>

        <div className="gr-container">
          <div className="gr-box">
          <div className="gr-form-row">
            <input
              className="gr-name-input"
              placeholder="Who are you? -_-"
              value={recommenderName}
              onChange={e => setRecommenderName(e.target.value)}
            />
          </div>

          <div className="gr-form-row">
            <input
              className="gr-search-input"
              placeholder="Search a game title"
              value={gameQuery}
              onChange={e => {
                setGameQuery(e.target.value);
                setRecommendationMsg('');
              }}
            />
          </div>

          <div className="gr-results-wrap">
            {searchingGames && <p className="gr-search-state">Searching IGDB...</p>}
            {!searchingGames && gameQuery.trim().length >= 2 && searchResults.length === 0 && (
              <p className="gr-search-state">No games found.</p>
            )}

            {!selectedGame && searchResults.length > 0 && (
              <ul className="gr-results-list">
                {searchResults.slice(0, 8).map(result => (
                  <li key={result.igdbId}>
                    <button
                      type="button"
                      className={`gr-result-btn ${selectedGame?.igdbId === result.igdbId ? 'selected' : ''}`}
                      onClick={() => setSelectedGame(result)}
                    >
                      <span className="gr-result-poster-wrap">
                        {result.coverUrl ? (
                          <img src={result.coverUrl} alt={result.title} className="gr-result-poster" />
                        ) : (
                          <span className="gr-result-poster-fallback">No Image</span>
                        )}
                      </span>
                      <span className="gr-result-meta">
                        <span className="gr-result-title">{result.title}</span>
                        <span className="gr-result-release">Release: {result.year || 'N/A'}</span>
                        <span className="gr-result-platform">{(result.platforms || []).join(', ') || 'Unknown'}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedGame && (
              <div className="gr-selected">
                <div className="gr-selected-poster">
                  {selectedGame.coverUrl ? (
                    <img src={selectedGame.coverUrl} alt={selectedGame.title} />
                  ) : (
                    <div className="gr-selected-poster-fallback">No Image</div>
                  )}
                </div>
                <div className="gr-selected-meta">
                  <div className="gr-selected-title">{selectedGame.title}</div>
                  <div className="gr-selected-sub">Release: {selectedGame.year || 'N/A'}</div>
                  <div className="gr-selected-sub">{(selectedGame.platforms || []).join(', ') || 'Unknown'}</div>
                </div>
                <button className="gr-clear-btn" type="button" onClick={() => setSelectedGame(null)}>
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="gr-submit-row">
            <button
              type="button"
              className="gr-submit-btn"
              onClick={handleRecommend}
              disabled={submittingRecommendation}
            >
              {submittingRecommendation ? 'Submitting...' : 'recommend this game'}
            </button>
          </div>

          {recommendationMsg && <p className="gr-message">{recommendationMsg}</p>}
          </div>
        </div>

        {isAdmin && (
          <div className="gr-admin-section">
            <h3 className="gr-admin-title">Received Recommendations</h3>
            {loadingAdminRecommendations ? (
              <p className="gr-admin-state">Loading recommendations...</p>
            ) : adminRecommendations.length === 0 ? (
              <p className="gr-admin-state">No recommendations yet.</p>
            ) : (
              <ul className="gr-admin-list">
                {adminRecommendations.map(rec => (
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
  );
};

export default Gaming;
