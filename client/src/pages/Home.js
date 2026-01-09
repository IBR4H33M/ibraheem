import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // Placeholder tile data - will be fetched from API later
  const [tiles, setTiles] = useState([
    { id: 1, size: 'large', image: null, title: 'Welcome', link: '/about' },
    { id: 2, size: 'medium', image: null, title: 'Gaming', link: '/gaming' },
    { id: 3, size: 'small', image: null, title: 'Tech', link: '/techspace' },
    { id: 4, size: 'small', image: null, title: 'Toys', link: '/toys' },
    { id: 5, size: 'medium', image: null, title: 'Entertainment', link: '/entertainment' },
    { id: 6, size: 'large', image: null, title: 'Projects', link: '/techspace' },
    { id: 7, size: 'small', image: null, title: 'Code', link: '/techspace' },
    { id: 8, size: 'medium', image: null, title: 'Music', link: '/entertainment' },
    { id: 9, size: 'small', image: null, title: 'Movies', link: '/entertainment' },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const tileVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="home-page">
      <motion.div 
        className="tile-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tiles.map((tile) => (
          <motion.div
            key={tile.id}
            className={`tile tile-${tile.size}`}
            variants={tileVariants}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <Link to={tile.link} className="tile-link">
              {tile.image ? (
                <img src={tile.image} alt={tile.title} className="tile-image" />
              ) : (
                <div className="tile-placeholder">
                  <div className="tile-pattern"></div>
                </div>
              )}
              <div className="tile-overlay">
                <h3 className="tile-title">{tile.title}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Decorative background elements */}
      <div className="home-bg-decoration">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Home;
