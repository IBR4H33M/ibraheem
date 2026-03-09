import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Nav.css';

const mainItems = [
  { id: 'about',    label: 'About Me',       path: '/about',     hasSub: false },
  { id: 'cool',     label: 'All Things Cool', path: null,         hasSub: true  },
  { id: 'techspace',label: 'TechSpace',       path: '/techspace', hasSub: false },
];

const subItemsMap = {
  cool: [
    { id: 'gaming',      label: 'Gaming',      path: '/gaming'      },
    { id: 'fandom',      label: 'Fandom',       path: '/fandom'      },
    { id: 'collectibles',label: 'Collectibles', path: '/collectibles' },
  ],
};

const Nav = () => {
  const [isOpen, setIsOpen]           = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const [logoHovered, setLogoHovered]  = useState(false);
  const [logoLoaded, setLogoLoaded]    = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const handleLogoClick = (e) => {
    logoClickCount.current += 1;
    clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 10) {
      logoClickCount.current = 0;
      e.preventDefault();
      navigate('/admin');
      return;
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 3000);
  };

  React.useEffect(() => {
    setIsOpen(false);
    setActiveParent(null);
  }, [location.pathname]);

  const handleToggle = () => {
    setIsOpen(prev => {
      if (prev) setActiveParent(null);
      return !prev;
    });
  };

  const handleMainClick = (item) => {
    if (item.hasSub) {
      setActiveParent(prev => (prev === item.id ? null : item.id));
    } else {
      setIsOpen(false);
      setActiveParent(null);
    }
  };

  const handleSubClick = () => {
    setIsOpen(false);
    setActiveParent(null);
  };

  return (
    <>
      {/* Logo & toggle — always on top */}
      <div className="nav-root">
        {/* Logo */}
        <Link
          to="/"
          className="logo-container"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          onClick={handleLogoClick}
        >
          <div className="logo-wrapper">
            <img
              src={logoHovered ? '/logo2.png' : '/logo.png'}
              alt="Ibraheem"
              className="logo"
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => { e.target.style.display = 'none'; setLogoLoaded(false); }}
            />
            {!logoLoaded && <div className="logo-placeholder">IIA</div>}
          </div>
        </Link>

        {/* Toggle button */}
        <button className="nav-toggle" onClick={handleToggle} aria-label="Toggle menu">
          {isOpen ? '✕' : '>'}
        </button>
      </div>

      {/* Transparent backdrop */}
      {isOpen && (
        <div className="nav-backdrop" onClick={() => { setIsOpen(false); setActiveParent(null); }} />
      )}

      {/* Slide-in panel — sibling of nav-root, not a child */}
      <div className={`nav-panel${isOpen ? ' open' : ''}`}>
        <div className="nav-col">
          {mainItems.map(item =>
            item.hasSub ? (
              <button
                key={item.id}
                className={`nav-btn${activeParent === item.id ? ' selected' : ''}`}
                onClick={() => handleMainClick(item)}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-btn${location.pathname === item.path ? ' selected' : ''}`}
                onClick={() => handleMainClick(item)}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        <div className={`nav-col nav-col-sub${activeParent ? ' visible' : ''}`}>
          {activeParent && subItemsMap[activeParent]?.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-btn${location.pathname === item.path ? ' selected' : ''}`}
              onClick={handleSubClick}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Nav;

