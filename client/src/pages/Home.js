import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TerminalSpinner from '../components/TerminalSpinner';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// Helper function to generate slug from title
const generateSlug = (title) => {
  return `project:${title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')}`;
};

// Helper function to parse tech stack into categories and keyword lists
const parseTechStack = (raw) => {
  if (!raw) return [];
  const text = String(raw).trim();
  const knownCats = [
    'Build and release', 'Build & release', 'Auth/Security', 'Storage/Uploads',
    'Language', 'Languages', 'Frontend', 'Backend', 'Database', 'Tools',
    'Navigation', 'Deployment', 'Framework', 'Frameworks', 'Styling', 'Testing',
    'Machine Learning', 'Deep Learning', 'DevOps', 'Cloud', 'Libraries', 'API'
  ];
  const catPattern = '(?:' + knownCats.join('|') + '|[A-Z][a-zA-Z0-9/&_-]*)';
  const categoryHeaderRegex = new RegExp('(?:^|\\s+)(' + catPattern + ':)', 'g');

  const marked = text.replace(categoryHeaderRegex, (match, p1) => '\n' + p1);
  const lines = marked.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  return lines.map(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const category = line.substring(0, colonIdx).trim();
      const rest = line.substring(colonIdx + 1).trim();
      const keywords = rest.split(',').map(k => k.trim()).filter(Boolean);
      return { category, keywords: keywords.length ? keywords : [rest] };
    }
    const keywords = line.split(',').map(k => k.trim()).filter(Boolean);
    return { category: '', keywords: keywords.length ? keywords : [line] };
  });
};

const Home = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const gamingRef = useRef(null);
  const gamingVideoRef = useRef(null);
  const [recentGames, setRecentGames] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const tsTrackRef = useRef(null);
  const tsArrowsTrackRef = useRef(null);
  const tsDraggingRef = useRef(false);
  const tsDragStartXRef = useRef(0);
  const tsStartScrollLeftRef = useRef(0);
  const tsDragDistanceRef = useRef(0);
  const [tsDragging, setTsDragging] = useState(false);
  const [tsCanScrollLeft, setTsCanScrollLeft] = useState(false);
  const [tsCanScrollRight, setTsCanScrollRight] = useState(false);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingProjects, setEditingProjects] = useState([]);
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);


  useEffect(() => {
    axios.get('/api/recent-games')
      .then(({ data }) => { if (data.length) setRecentGames(data); })
      .catch(() => {})
      .finally(() => setGamesLoading(false));
    axios.get('/api/projects/featured')
      .then(({ data }) => { if (data.length) setProjects(data); setEditingProjects(data); })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
    axios.get('/api/projects')
      .then(({ data }) => { if (data.length) setAllProjects(data); })
      .catch(() => {});
  }, []);

  // Admin handlers
  const handleRemoveProject = (projectId) => {
    setEditingProjects(prev => prev.filter(p => p._id !== projectId));
  };

  const handleReorderProjects = (projectId, newIndex) => {
    const currentIndex = editingProjects.findIndex(p => p._id === projectId);
    if (currentIndex === newIndex || newIndex < 0 || newIndex >= editingProjects.length) return;
    
    const newProjects = [...editingProjects];
    const [movedProject] = newProjects.splice(currentIndex, 1);
    newProjects.splice(newIndex, 0, movedProject);
    setEditingProjects(newProjects);
  };

  const handleSaveProjectOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const projectIds = editingProjects.map(p => p._id);
      const { data } = await axios.post('/api/projects/featured/update', { projectIds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(data);
      setShowAdminPanel(false);
    } catch (err) {
      console.error('Failed to save featured projects:', err);
      alert('Failed to save featured projects');
    }
  };

  const handleCancelEdit = () => {
    setEditingProjects(projects);
    setShowAdminPanel(false);
  };

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
    if (tsArrowsTrackRef.current) {
      tsArrowsTrackRef.current.scrollLeft = el.scrollLeft;
    }
  };

  useEffect(() => {
    updateTsScrollBtns();
  }, [projects]);

  useEffect(() => {
    const el = tsTrackRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (tsArrowsTrackRef.current) {
        tsArrowsTrackRef.current.scrollLeft = el.scrollLeft;
      }
      setTsCanScrollLeft(el.scrollLeft > 0);
      setTsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (tsArrowsTrackRef.current) {
        tsArrowsTrackRef.current.scrollLeft = el.scrollLeft;
      }
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
            More about Ibraheem
          </Link>
        </div>
      </div>

      {/* TechSpace Section */}
      <div className="techspace-section-wrapper">
        <div className="techspace-header">
          <Link to="/techspace" className="techspace-heading">
            <span>&lt;TECHSPACE&gt;</span>
          </Link>
          <span className="techspace-header-divider">|</span>
          <h2 className="techspace-subtitle">FEATURED PROJECTS</h2>
          {isAdmin && (
            <button 
              className="admin-edit-btn" 
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              title="Manage featured projects"
            >
              {showAdminPanel ? '✕ Close' : '⚙ Manage'}
            </button>
          )}
        </div>

        <div className="ts-slider-outer">
          {showAdminPanel && isAdmin ? (
            // Admin Management Panel
            <div className="admin-management-panel">
              <div className="admin-panel-title">Manage Featured Projects</div>
              <div className="admin-projects-list">
                {editingProjects.map((project, index) => (
                  <div 
                    key={project._id}
                    className={`admin-project-item ${draggedProjectId === project._id ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={() => setDraggedProjectId(project._id)}
                    onDragEnd={() => setDraggedProjectId(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedProjectId && draggedProjectId !== project._id) {
                        handleReorderProjects(draggedProjectId, index);
                      }
                      setDragOverIndex(null);
                    }}
                  >
                    <div className="admin-project-handle">⋮⋮</div>
                    <div className="admin-project-info">
                      {project.image?.url && <img src={project.image.url} alt={project.title} className="admin-project-thumb" />}
                      <div className="admin-project-details">
                        <div className="admin-project-title">{project.title}</div>
                        <div className="admin-project-index">Position {index + 1}</div>
                      </div>
                    </div>
                    <button
                      className="admin-remove-btn"
                      onClick={() => handleRemoveProject(project._id)}
                      title="Remove from featured"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {/* Option to re-add unfeatured projects to featured */}
              {allProjects.filter(p => !editingProjects.some(ep => ep._id === p._id)).length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select 
                    defaultValue="" 
                    style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', background: '#1e1e24', color: '#e0e0e0', border: '1px solid #444', fontSize: '0.85rem' }}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;
                      const projToAdd = allProjects.find(p => p._id === id);
                      if (projToAdd) {
                        setEditingProjects(prev => [...prev, projToAdd]);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>+ Add project to featured...</option>
                    {allProjects
                      .filter(p => !editingProjects.some(ep => ep._id === p._id))
                      .map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                  </select>
                </div>
              )}
              <div className="admin-panel-actions">
                <button className="admin-save-btn" onClick={handleSaveProjectOrder}>
                  Save Changes
                </button>
                <button className="admin-cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Normal Project Slider
            <>
          <div className="ts-scroll-wrapper">
            {tsCanScrollLeft && (
              <button className="ts-arrow ts-arrow-left" onClick={() => tsScrollBy(-1)} aria-label="Scroll left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <div className="ts-slider-column">
              {/* Thick-bordered frame around project icons and titles only */}
              <div className="ts-bordered-frame">
                <div
                  className={`ts-section ${tsDragging ? 'is-dragging' : ''}`}
                  ref={tsTrackRef}
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
                      </div>
                    ))}

                    {projectsLoading && (
                      <p className="ts-empty"><TerminalSpinner label="loading..." /></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow icons underneath each project, NOT covered by border */}
              <div className="ts-arrows-row-wrapper" ref={tsArrowsTrackRef}>
                <div className="ts-arrows-track">
                  {projects.map(project => (
                    <div key={project._id} className="ts-arrow-slot">
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
                </div>
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
            </>
          )}
        </div>

        {/* Project Details Expand Bubble */}
        {selectedProject && (
          <div className="ts-detail-panel">
            <div className="ts-detail-bubble">
              <h3 className="ts-detail-title">{selectedProject.title}</h3>
              {selectedProject.introduction && (
                <p className="ts-detail-section">{selectedProject.introduction}</p>
              )}
              {selectedProject.background && (
                <p className="ts-detail-section">{selectedProject.background}</p>
              )}
              <div className="ts-detail-meta">
                {selectedProject.techStack && (
                  <div className="ts-detail-meta-row ts-detail-meta-row--tech">
                    <span className="ts-detail-label">Tech Stack</span>
                    <div className="ts-tech-stack-container">
                      {parseTechStack(selectedProject.techStack).map((item, idx) => (
                        <div className="ts-tech-row" key={idx}>
                          {item.category && (
                            <span className="ts-tech-cat">{item.category}:</span>
                          )}
                          <div className="ts-tech-tags">
                            {item.keywords.map((kw, kwIdx) => (
                              <span className="ts-tech-tag" key={kwIdx}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
                {selectedProject.url && selectedProject.url.trim() !== '' && (
                  <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="ts-detail-btn">
                    Try it out
                  </a>
                )}
                {selectedProject.githubUrl && selectedProject.githubUrl.trim() !== '' && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="ts-detail-btn">
                    GitHub
                  </a>
                )}
                {selectedProject.customButtonText && selectedProject.customButtonUrl && selectedProject.customButtonUrl.trim() !== '' && (
                  <a href={selectedProject.customButtonUrl} target="_blank" rel="noopener noreferrer" className="ts-detail-btn">
                    {selectedProject.customButtonText}
                  </a>
                )}
                <Link to={`/techspace/${selectedProject.slug || generateSlug(selectedProject.title)}`} className="ts-detail-btn">
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
