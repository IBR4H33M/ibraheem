import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './FlowchartNav.css';

const FlowchartNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const menuTimeoutRef = useRef(null);
  const subMenuTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      menuTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setShowSubMenu(false);
      }, 300);
    }
  };

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
    if (isOpen) setShowSubMenu(false);
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
      <div className="logo-container">
        <div className="logo-wrapper">
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
        <div className={`logo-glow ${isOpen ? 'active' : ''}`}></div>
      </div>

      {/* Menu Toggle Arrow */}
      <motion.button 
        className="menu-arrow"
        onClick={handleArrowClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Stacked Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="nav-stack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* About Me */}
            <motion.div
              className="nav-item"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            >
              <Link to="/about" className="nav-node">
                <span className="node-dot"></span>
                <span>About Me</span>
              </Link>
            </motion.div>

            {/* All Things Cool */}
            <motion.div
              className="nav-item"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 90 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
            >
              <div 
                className={`nav-node has-children ${showSubMenu ? 'expanded' : ''}`}
                onMouseEnter={handleCoolHover}
                onMouseLeave={handleCoolLeave}
                onClick={handleCoolClick}
              >
                <span className="node-dot"></span>
                <span>All Things Cool</span>
              </div>

              {/* Sub-menu */}
              <AnimatePresence>
                {showSubMenu && (
                  <motion.div 
                    className="sub-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link to="/gaming" className="sub-node">
                        <span className="node-dot"></span>
                        <span>Gaming</span>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Link to="/entertainment" className="sub-node">
                        <span className="node-dot"></span>
                        <span>Entertainment</span>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link to="/toys" className="sub-node">
                        <span className="node-dot"></span>
                        <span>Toys</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* TechSpace */}
            <motion.div
              className="nav-item"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 160 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
            >
              <Link to="/techspace" className="nav-node">
                <span className="node-dot"></span>
                <span>TechSpace</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlowchartNav;
