import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    axios.get('/api/game-captures')
      .then(({ data }) => { if (data.length) setCaptures(data); })
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

  const sectionVariants = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const cardVariants = {
    hidden:  { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const [gamesNostalgic] = useState([
    { id: 1, title: 'Game Title',   platform: 'PC',          genre: 'RPG',       image: null },
    { id: 2, title: 'Another Game', platform: 'PlayStation', genre: 'Action',    image: null },
    { id: 3, title: 'Classic Game', platform: 'Multi',       genre: 'Adventure', image: null },
  ]);
  const [gamesCurrentlyPlaying] = useState([
    { id: 1, title: 'Current Game',    platform: 'PC',   progress: '60%', image: null },
    { id: 2, title: 'Another Current', platform: 'Xbox', progress: '25%', image: null },
  ]);
  const [gamesLookingForward] = useState([
    { id: 1, title: 'Upcoming Game',    releaseDate: '2026', platform: 'PC',    image: null },
    { id: 2, title: 'Anticipated Title',releaseDate: 'TBA',  platform: 'PS5',   image: null },
    { id: 3, title: 'Sequel Game',      releaseDate: '2026', platform: 'Multi', image: null },
  ]);

  return (
    <div className="gaming-page">
      <h1 className="gaming-page-title">GAMING</h1>

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
          <span className="gaming-captures-label">RECENT IN-GAME CAPTURES</span>

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

      {/* ── Game sections ── */}
      <div className="gaming-content gaming-dark-bg">

        {/* Currently Playing */}
        <motion.section
          className="gaming-section current-section"
          variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">Games I Currently Play</h2>
          <p className="section-description">What I'm currently grinding through and enjoying right now.</p>
          <div className="games-grid">
            {gamesCurrentlyPlaying.map((game, index) => (
              <motion.div key={game.id} className="game-card current"
                variants={cardVariants} initial="hidden" animate="visible"
                transition={{ delay: 0.3 + index * 0.1 }} whileHover={{ scale: 1.03, y: -5 }}>
                <div className="game-image">
                  {game.image ? <img src={game.image} alt={game.title} /> : <div className="game-placeholder"><span>🕹️</span></div>}
                  <div className="now-playing-badge">Now Playing</div>
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className="platform">{game.platform}</span>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: game.progress }} /></div>
                    <span className="progress-text">{game.progress}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Nostalgic */}
        <motion.section
          className="gaming-section nostalgic-section"
          variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">Games Which Make Me Nostalgic</h2>
          <p className="section-description">These are the games that shaped my gaming journey and hold a special place in my heart.</p>
          <div className="games-grid">
            {gamesNostalgic.map((game, index) => (
              <motion.div key={game.id} className="game-card nostalgic"
                variants={cardVariants} initial="hidden" animate="visible"
                transition={{ delay: 0.3 + index * 0.1 }} whileHover={{ scale: 1.03, y: -5 }}>
                <div className="game-image">
                  {game.image ? <img src={game.image} alt={game.title} /> : <div className="game-placeholder"><span>🎮</span></div>}
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className="platform">{game.platform}</span>
                    <span className="genre">{game.genre}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Looking Forward */}
        <motion.section
          className="gaming-section upcoming-section"
          variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}
        >
          <h2 className="section-title">Games I Look Forward to Playing</h2>
          <p className="section-description">The upcoming titles I can't wait to get my hands on.</p>
          <div className="games-grid">
            {gamesLookingForward.map((game, index) => (
              <motion.div key={game.id} className="game-card upcoming"
                variants={cardVariants} initial="hidden" animate="visible"
                transition={{ delay: 0.7 + index * 0.1 }} whileHover={{ scale: 1.03, y: -5 }}>
                <div className="game-image">
                  {game.image ? <img src={game.image} alt={game.title} /> : <div className="game-placeholder"><span>⏳</span></div>}
                  <div className="release-badge">{game.releaseDate}</div>
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className="platform">{game.platform}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default Gaming;
