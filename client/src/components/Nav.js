import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Nav.css';

const mainItems = [
  { id: 'about',        label: 'About Me',     path: '/about' },
  { id: 'techspace',    label: 'TechSpace',    path: '/techspace' },
  { id: 'gaming',       label: 'Gaming',       path: '/gaming' },
  { id: 'fandom',       label: 'Fandom',       path: '/fandom' },
];

const contactItem = { id: 'contact', label: 'Contact', path: '/contact' };

const Nav = () => {
  const [isOpen, setIsOpen]           = useState(false);
  const [logoHovered, setLogoHovered]  = useState(false);
  const [logoLoaded, setLogoLoaded]    = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
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
  }, [location.pathname]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
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

      {/* Admin icon — top right, same z-layer as logo */}
      {isAdmin && (
        <div className="admin-indicator">
          <button className="admin-indicator-btn" onClick={logout} title="Logged in as admin — click to logout">
            <span>ADMIN</span>
          </button>
        </div>
      )}

      {/* Transparent backdrop */}
      {isOpen && (
        <div className="nav-backdrop" onClick={() => { setIsOpen(false); }} />
      )}

      {/* Slide-in panel — sibling of nav-root, not a child */}
      <div className={`nav-panel${isOpen ? ' open' : ''}`}>
        <div className="nav-col">
          {mainItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-btn${location.pathname === item.path ? ' selected' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="nav-spacer" />

          <Link
            to={contactItem.path}
            className={`nav-btn nav-btn-contact${location.pathname === contactItem.path ? ' selected' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {contactItem.label}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Nav;

