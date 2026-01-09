import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Nav.css';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  // Refs for timeout delays
  const menuTimeoutRef = React.useRef(null);
  const subMenuTimeoutRef = React.useRef(null);

  // Detect mobile/touch device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
    setShowSubMenu(false);
  }, [location.pathname]);
  
  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      // Clear any pending close timeout
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // Delay closing to allow user to move back
      menuTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setShowSubMenu(false);
      }, 300);
    }
  };

  const handleNavEnter = () => {
    // Keep menu open when hovering nav items
    if (!isMobile && menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
  };

  const handleLogoClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
      if (isOpen) setShowSubMenu(false);
    }
  };

  const handleCoolHover = () => {
    if (!isMobile) {
      if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
      setShowSubMenu(true);
    }
  };

  const handleCoolLeave = () => {
    if (!isMobile) {
      subMenuTimeoutRef.current = setTimeout(() => {
        setShowSubMenu(false);
      }, 200);
    }
  };

  const handleCoolClick = () => {
    if (isMobile) setShowSubMenu(!showSubMenu);
  };

  return (
    <div 
      className="flowchart-nav"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo Container */}
      <div 
        className="logo-container"
        onClick={handleLogoClick}
      >
        <div className="logo-wrapper">
          {/* Replace with your actual logo */}
          <img 
            src="/logo.png" 
            alt="Ibraheem Ibn Anwar" 
            className="logo"
            onLoad={() => setLogoLoaded(true)}
            onError={(e) => {
              e.target.style.display = 'none';
              setLogoLoaded(false);
            }}
          />
          {!logoLoaded && (
            <div className="logo-placeholder">
              <span>IIA</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Toggle Arrow */}
      <motion.button
        className="menu-arrow"
        onClick={handleLogoClick}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.button>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="nav-menu">
            {/* Navigation items */}
            <div className="nav-items">
              {/* About Me */}
              <motion.div 
                className="nav-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <Link 
                  to="/about" 
                  className={`nav-node ${location.pathname === '/about' ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>About Me</span>
                </Link>
              </motion.div>

              {/* All Things Cool with submenu */}
              <motion.div 
                className="nav-item nav-item-with-sub"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onMouseEnter={handleCoolHover}
                onMouseLeave={handleCoolLeave}
              >
                <button
                  className={`nav-node has-children ${showSubMenu ? 'expanded' : ''}`}
                  onClick={handleCoolClick}
                >
                  <span>All Things Cool</span>
                  <motion.span 
                    className="expand-icon"
                    animate={{ rotate: showSubMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ›
                  </motion.span>
                </button>

                {/* Submenu */}
                <AnimatePresence>
                  {showSubMenu && (
                    <motion.div 
                      className="sub-container"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="sub-items">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                        >
                          <Link 
                            to="/gaming" 
                            className={`sub-node ${location.pathname === '/gaming' ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>Gaming</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          <Link 
                            to="/entertainment" 
                            className={`sub-node ${location.pathname === '/entertainment' ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>Entertainment</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: 0.15 }}
                        >
                          <Link 
                            to="/toys" 
                            className={`sub-node ${location.pathname === '/toys' ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>Toys</span>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* TechSpace */}
              <motion.div 
                className="nav-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <Link 
                  to="/techspace" 
                  className={`nav-node ${location.pathname === '/techspace' ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>TechSpace</span>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Nav;
