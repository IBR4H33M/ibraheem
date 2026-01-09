import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Gaming.css';

const Gaming = () => {
  // Current active slide for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow images from currently playing games
  const slideshowImages = [
    { id: 1, image: 'https://res.cloudinary.com/dgifmtnso/image/upload/v1767804267/maxresdefault_4_cgegc5.jpg', title: 'Game Capture 1', game: 'Current Game' },
    { id: 2, image: null, title: 'Game Capture 2', game: 'Another Current' },
    { id: 3, image: null, title: 'Game Capture 3', game: 'Game Title' },
  ];

  // Navigation handlers
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  // Game categories with placeholder data
  const [gamesNostalgic, setGamesNostalgic] = useState([
    { id: 1, title: 'Game Title', platform: 'PC', genre: 'RPG', image: 'https://res.cloudinary.com/dgifmtnso/image/upload/v1767804267/maxresdefault_4_cgegc5.jpg' },
    { id: 2, title: 'Another Game', platform: 'PlayStation', genre: 'Action', image: null },
    { id: 3, title: 'Classic Game', platform: 'Multi', genre: 'Adventure', image: null },
  ]);

  const [gamesCurrentlyPlaying, setGamesCurrentlyPlaying] = useState([
    { id: 1, title: 'Current Game', platform: 'PC', progress: '60%', image: null },
    { id: 2, title: 'Another Current', platform: 'Xbox', progress: '25%', image: null },
  ]);

  const [gamesLookingForward, setGamesLookingForward] = useState([
    { id: 1, title: 'Upcoming Game', releaseDate: '2026', platform: 'PC', image: null },
    { id: 2, title: 'Anticipated Title', releaseDate: 'TBA', platform: 'PS5', image: null },
    { id: 3, title: 'Sequel Game', releaseDate: '2026', platform: 'Multi', image: null },
  ]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="gaming-page page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">Gaming</h1>

      <div className="gaming-content">
        {/* Games I Currently Play - Moved to Top */}
        <motion.section 
          className="gaming-section current-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">
            Games I Currently Play
          </h2>
          <p className="section-description">
            What I'm currently grinding through and enjoying right now.
          </p>
          <div className="games-grid">
            {gamesCurrentlyPlaying.map((game, index) => (
              <motion.div 
                key={game.id}
                className="game-card current"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="game-image">
                  {game.image ? (
                    <img src={game.image} alt={game.title} />
                  ) : (
                    <div className="game-placeholder">
                      <span>🕹️</span>
                    </div>
                  )}
                  <div className="now-playing-badge">Now Playing</div>
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className="platform">{game.platform}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: game.progress }}
                      ></div>
                    </div>
                    <span className="progress-text">{game.progress}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Image Slideshow */}
        <motion.section 
          className="slideshow-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="slideshow-container">
            <button className="slideshow-arrow slideshow-arrow-left" onClick={prevSlide} aria-label="Previous slide">
              ‹
            </button>
            
            <div className="slideshow-content">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="slideshow-slide"
              >
                {slideshowImages[currentSlide].image ? (
                  <img 
                    src={slideshowImages[currentSlide].image} 
                    alt={slideshowImages[currentSlide].title}
                    className="slideshow-image"
                  />
                ) : (
                  <div className="slideshow-placeholder">
                    <span>Game Capture</span>
                  </div>
                )}
                <div className="slideshow-overlay">
                  <div className="slideshow-info">
                    <h3 className="slideshow-game-title">{slideshowImages[currentSlide].game}</h3>
                    <p className="slideshow-caption">{slideshowImages[currentSlide].title}</p>
                  </div>
                  <div className="slideshow-counter">
                    <span>{currentSlide + 1}</span>
                    <span className="counter-divider">/</span>
                    <span>{slideshowImages.length}</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <button className="slideshow-arrow slideshow-arrow-right" onClick={nextSlide} aria-label="Next slide">
              ›
            </button>
          </div>
        </motion.section>

        {/* Games Which Make Me Nostalgic */}
        <motion.section 
          className="gaming-section nostalgic-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">
            Games Which Make Me Nostalgic
          </h2>
          <p className="section-description">
            These are the games that shaped my gaming journey and hold a special place in my heart.
          </p>
          <div className="games-grid">
            {gamesNostalgic.map((game, index) => (
              <motion.div 
                key={game.id}
                className="game-card nostalgic"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="game-image">
                  {game.image ? (
                    <img src={game.image} alt={game.title} />
                  ) : (
                    <div className="game-placeholder">
                      <span>🎮</span>
                    </div>
                  )}
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

        {/* Games I Look Forward To Playing */}
        <motion.section 
          className="gaming-section upcoming-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <h2 className="section-title">
            Games I Look Forward to Playing
          </h2>
          <p className="section-description">
            The upcoming titles I can't wait to get my hands on.
          </p>
          <div className="games-grid">
            {gamesLookingForward.map((game, index) => (
              <motion.div 
                key={game.id}
                className="game-card upcoming"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="game-image">
                  {game.image ? (
                    <img src={game.image} alt={game.title} />
                  ) : (
                    <div className="game-placeholder">
                      <span>⏳</span>
                    </div>
                  )}
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
    </motion.div>
  );
};

export default Gaming;
