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
  const [rgTitle, setRgTitle]               = useState('');
  const [rgFile, setRgFile]                 = useState(null);
  const [rgSaving, setRgSaving]             = useState(false);
  const [rgMsg, setRgMsg]                   = useState('');
  const rgFileRef                           = useRef(null);
  const rgTrackRef                          = useRef(null);
  const [rgCanScrollLeft, setRgCanScrollLeft]   = useState(false);
  const [rgCanScrollRight, setRgCanScrollRight] = useState(false);

  useEffect(() => {
    axios.get('/api/game-captures')
      .then(({ data }) => { if (data.length) setCaptures(data); })
      .catch(() => {});
    axios.get('/api/recent-games')
      .then(({ data }) => { if (data.length) setRecentGames(data); })
      .catch(() => {});
  }, []);

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
    if (!rgTitle.trim() || !rgFile) { setRgMsg('Enter a title and choose an image.'); return; }
    setRgSaving(true); setRgMsg('');
    try {
      const form = new FormData();
      form.append('title', rgTitle.trim());
      form.append('image', rgFile);
      const { data } = await axios.post('/api/recent-games', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setRecentGames(prev => [...prev, data]);
      setRgAdding(false); setRgTitle(''); setRgFile(null); setRgMsg('Added!');
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
        <h2 className="rg-heading"><svg className="title-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>&nbsp;RECENTLY PLAYED</h2>
        <div className="rg-scroll-wrapper">
          {rgCanScrollLeft && (
            <button className="rg-arrow rg-arrow-left" onClick={() => rgScrollBy(-1)} aria-label="Scroll left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div
            className="rg-section"
            ref={rgTrackRef}
            onScroll={updateRgScrollBtns}
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
                    {game.image?.url
                      ? <img src={game.image.url} alt={game.title} className="rg-img" />
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
                  placeholder="Game title"
                  value={rgTitle}
                  onChange={e => setRgTitle(e.target.value)}
                />
                <button className="admin-edit-btn" onClick={() => rgFileRef.current.click()}>
                  {rgFile ? '✓ Image selected' : 'Choose Image'}
                </button>
                <input
                  ref={rgFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setRgFile(e.target.files[0])}
                />
                <button className="admin-save-btn" onClick={handleRgAdd} disabled={rgSaving}>
                  {rgSaving ? 'Saving…' : 'SAVE'}
                </button>
                <button className="admin-cancel-btn" onClick={() => { setRgAdding(false); setRgTitle(''); setRgFile(null); setRgMsg(''); }}>
                  CANCEL
                </button>
              </div>
            )}
            {rgMsg && <span className="admin-save-msg">{rgMsg}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gaming;
