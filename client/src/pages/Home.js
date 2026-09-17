import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TerminalSpinner from '../components/TerminalSpinner';
import './Home.css';

// Helper function to generate slug from title
const generateSlug = (title) => {
  return `project:${title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')}`;
};

const Home = () => {
  const navigate = useNavigate();

  const gamingRef = useRef(null);
  const gamingVideoRef = useRef(null);
  const [recentGames, setRecentGames] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const tsTrackRef = useRef(null);
  const tsDraggingRef = useRef(false);
  const tsDragStartXRef = useRef(0);
  const tsStartScrollLeftRef = useRef(0);
  const tsDragDistanceRef = useRef(0);
  const [tsDragging, setTsDragging] = useState(false);
  const [tsCanScrollLeft, setTsCanScrollLeft] = useState(false);
  const [tsCanScrollRight, setTsCanScrollRight] = useState(false);

  const safePlay = (video) => {
    if (!video) return;
    try {
      const p = video.play();
      if (p && typeof p.then === 'function') p.catch(() => {});
    } catch (e) {
      // ignore play errors
    }
  };

  const safePause = (video) => {
    if (!video) return;
    try {
      video.pause();
    } catch (e) {
      // ignore pause errors
    }
  };

  useEffect(() => {
    axios.get('/api/recent-games')
      .then(({ data }) => { if (data.length) setRecentGames(data); })
      .catch(() => {})
      .finally(() => setGamesLoading(false));
    axios.get('/api/projects')
      .then(({ data }) => { if (data.length) setProjects(data); })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.type.includes('mouse') ? e.clientX : e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const delta = currentX - dragStart;
    setManualRotation(prev => prev - delta * 0.005);
    setDragStart(currentX);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const updateTsScrollBtns = () => {
    const el = tsTrackRef.current;
    if (!el) return;
    setTsCanScrollLeft(el.scrollLeft > 0);
    setTsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateTsScrollBtns();
  }, [projects]);

  const tsScrollBy = (dir) => {
    const el = tsTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const handleTsMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, textarea, select')) return;
    const el = tsTrackRef.current;
    if (!el) return;
    tsDraggingRef.current = true;
    setTsDragging(true);
    tsDragStartXRef.current = e.pageX - el.offsetLeft;
    tsStartScrollLeftRef.current = el.scrollLeft;
    tsDragDistanceRef.current = 0; // Reset distance tracker
  };

  const handleTsMouseMove = (e) => {
    if (!tsDraggingRef.current) return;
    const el = tsTrackRef.current;
    if (!el) return;
    
    const x = e.pageX - el.offsetLeft;
    const distance = Math.abs(x - tsDragStartXRef.current);
    tsDragDistanceRef.current = distance;
    
    // Only apply drag scroll if distance exceeds threshold (5px)
    if (distance > 5) {
      e.preventDefault();
      const walk = (x - tsDragStartXRef.current) * 1.25;
      el.scrollLeft = tsStartScrollLeftRef.current - walk;
    }
  };

  const stopTsDrag = () => {
    tsDraggingRef.current = false;
    setTsDragging(false);
  };

  const handleArrowClick = (e, projectId) => {
    e.stopPropagation(); // don't navigate to TechSpace
    setSelectedProjectId(prev => (prev === projectId ? null : projectId));
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId) || null;

  return (
    <div className="home-page">
      {/* Welcome Hero Section */}
      <div className="welcome-hero">
        <div className="welcome-hero-content">
          <p className="welcome-sub">Welcome to</p>
          <h1 className="welcome-title">IBRAHEEM's Space!</h1>
          <Link to="/about" className="who-am-i-btn">
            Who am I?
          </Link>
        </div>
      </div>

      {/* TechSpace Section - Horizontal Slider */}
      <div className="techspace-section-wrapper">
        <div className="techspace-horizontal-section">
          <div className="techspace-left">
            <Link to="/techspace" className="techspace-heading">
              <span>&lt;TECHSPACE&gt;</span>
            </Link>
          </div>
        <div className="techspace-right">
          <h2 className="techspace-subtitle">RECENT PROJECTS</h2>
          <div className="ts-scroll-wrapper">
            {tsCanScrollLeft && (
              <button className="ts-arrow ts-arrow-left" onClick={() => tsScrollBy(-1)} aria-label="Scroll left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div
              className={`ts-section ${tsDragging ? 'is-dragging' : ''}`}
              ref={tsTrackRef}
              onScroll={updateTsScrollBtns}
              onMouseDown={handleTsMouseDown}
              onMouseMove={handleTsMouseMove}
              onMouseUp={stopTsDrag}
              onMouseLeave={stopTsDrag}
              onDragStart={(e) => e.preventDefault()}
            >
              <div className="ts-track">
                {projects.map(project => (
                  <div 
                    key={project._id} 
                    className={`ts-card ${selectedProjectId === project._id ? 'ts-card--selected' : ''}`}
                    onClick={() => {
                      // Only navigate if it wasn't a drag (distance < 5px)
                      if (tsDragDistanceRef.current < 5) {
                        const slug = project.slug || generateSlug(project.title);
                        navigate(`/techspace/${slug}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="ts-img-wrap">
                      {project.image?.url
                        ? <img src={project.image.url} alt={project.title} className="ts-img" />
                        : <div className="ts-img-placeholder"><TerminalSpinner /></div>}
                    </div>
                    <span className="ts-title">{project.title}</span>
                    {/* Expand arrow */}
                    <button
                      className={`ts-expand-arrow ${selectedProjectId === project._id ? 'ts-expand-arrow--active' : ''}`}
                      onClick={(e) => handleArrowClick(e, project._id)}
                      aria-label={selectedProjectId === project._id ? 'Collapse project details' : 'Expand project details'}
                      title="Show project details"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                ))}

                {projectsLoading && (
                  <p className="ts-empty"><TerminalSpinner label="loading..." /></p>
                )}
              </div>
            </div>
            {tsCanScrollRight && (
              <button className="ts-arrow ts-arrow-right" onClick={() => tsScrollBy(1)} aria-label="Scroll right">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Project Details Expand Panel */}
        {selectedProject && (
          <div className="ts-detail-panel">
            <div className="ts-detail-inner">
              <h3 className="ts-detail-title">{selectedProject.title}</h3>
              {selectedProject.introduction && (
                <p className="ts-detail-section">{selectedProject.introduction}</p>
              )}
              {selectedProject.background && (
                <p className="ts-detail-section">{selectedProject.background}</p>
              )}
              <div className="ts-detail-meta">
                {selectedProject.techStack && (
                  <div className="ts-detail-meta-row">
                    <span className="ts-detail-label">Tech Stack</span>
                    <span className="ts-detail-value">{selectedProject.techStack}</span>
                  </div>
                )}
                {selectedProject.myRole && (
                  <div className="ts-detail-meta-row">
                    <span className="ts-detail-label">My Role</span>
                    <span className="ts-detail-value">{selectedProject.myRole}</span>
                  </div>
                )}
                {selectedProject.datasetTitle && (
                  <div className="ts-detail-meta-row">
                    <span className="ts-detail-label">Dataset</span>
                    <span className="ts-detail-value">
                      {selectedProject.datasetUrl
                        ? <a href={selectedProject.datasetUrl} target="_blank" rel="noopener noreferrer" className="ts-detail-link">{selectedProject.datasetTitle}</a>
                        : selectedProject.datasetTitle}
                    </span>
                  </div>
                )}
              </div>
              <div className="ts-detail-actions">
                {selectedProject.url && (
                  <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="ts-detail-btn ts-detail-btn--live">
                    Live Demo
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="ts-detail-btn ts-detail-btn--github">
                    GitHub
                  </a>
                )}
                {selectedProject.customButtonText && selectedProject.customButtonUrl && (
                  <a href={selectedProject.customButtonUrl} target="_blank" rel="noopener noreferrer" className="ts-detail-btn ts-detail-btn--custom">
                    {selectedProject.customButtonText}
                  </a>
                )}
                <Link to={`/techspace/${selectedProject.slug || generateSlug(selectedProject.title)}`} className="ts-detail-btn ts-detail-btn--more">
                  Full Details →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fandom Section - Full Width */}
      <div className="fandom-section-container">
        <div className="fandom-tile">
          <div className="fandom-video-frame">
            <video className="fandom-video" muted loop autoPlay playsInline preload="metadata">
              <source src="/assets/fandom.mp4" type="video/mp4" />
            </video>
          </div>
          <Link to="/fandom" className="fandom-title">&lt;FANDOM&gt;</Link>
        </div>
      </div>

      {/* Gaming Section */}
      <div className="gaming-horizontal-section" ref={gamingRef}>
        <div className="gaming-left">
          <video
            ref={gamingVideoRef}
            className="gaming-left-video"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
          >
            <source src="/assets/cover1.mkv" />
          </video>
          <Link to="/gaming" className="gaming-video-label">
            &lt;GAMING&gt;
          </Link>
        </div>
        <div className="gaming-right">
          <div 
            className="gaming-carousel"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {gamesLoading ? (
              <div className="gaming-carousel-loading">
                <TerminalSpinner label="loading games..." />
              </div>
            ) : recentGames.map((game, index) => {
              const totalGames = recentGames.length;
              const angle = (index / totalGames) * Math.PI * 2 + manualRotation;
              const radius = 280;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const scale = 0.6 + (z + radius) / (radius * 2) * 0.6;
              const opacity = 0.3 + (z + radius) / (radius * 2) * 0.7;
              
              return (
                <div
                  key={game._id}
                  className="gaming-card"
                  style={{
                    transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.round(z + radius)
                  }}
                >
                  {game.coverUrl && (
                    <img src={game.coverUrl} alt={game.title} className="gaming-card-img" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
