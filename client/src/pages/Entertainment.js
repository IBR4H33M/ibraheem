import React from 'react';
import { motion } from 'framer-motion';
import './Entertainment.css';

const Entertainment = () => {
  // Placeholder data
  const movies = [
    { id: 1, title: 'Movie Title', year: '2024', genre: 'Sci-Fi' },
    { id: 2, title: 'Another Movie', year: '2023', genre: 'Action' },
  ];

  const shows = [
    { id: 1, title: 'TV Show', seasons: 3, status: 'Watching' },
    { id: 2, title: 'Completed Show', seasons: 5, status: 'Completed' },
  ];

  const music = [
    { id: 1, artist: 'Artist Name', album: 'Album Title', genre: 'Electronic' },
    { id: 2, artist: 'Another Artist', album: 'Great Album', genre: 'Rock' },
  ];

  return (
    <motion.div 
      className="entertainment-page page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">Entertainment</h1>

      <div className="entertainment-content">
        {/* Movies Section */}
        <motion.section 
          className="entertainment-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="section-title">Movies</h2>
          <div className="media-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="media-card">
                <div className="media-poster">
                  <div className="poster-placeholder"></div>
                </div>
                <div className="media-info">
                  <h3>{movie.title}</h3>
                  <div className="media-meta">
                    <span>{movie.year}</span>
                    <span className="genre-tag">{movie.genre}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="add-card">
              <span>+ Add More</span>
            </div>
          </div>
        </motion.section>

        {/* TV Shows Section */}
        <motion.section 
          className="entertainment-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="section-title">TV Shows</h2>
          <div className="media-grid">
            {shows.map((show) => (
              <div key={show.id} className="media-card">
                <div className="media-poster">
                  <div className="poster-placeholder"></div>
                  <div className={`status-badge ${show.status.toLowerCase()}`}>
                    {show.status}
                  </div>
                </div>
                <div className="media-info">
                  <h3>{show.title}</h3>
                  <div className="media-meta">
                    <span>{show.seasons} Seasons</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="add-card">
              <span>+ Add More</span>
            </div>
          </div>
        </motion.section>

        {/* Music Section */}
        <motion.section 
          className="entertainment-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">Music</h2>
          <div className="music-grid">
            {music.map((item) => (
              <div key={item.id} className="music-card">
                <div className="album-art">
                  <div className="album-placeholder"></div>
                </div>
                <div className="music-info">
                  <h3>{item.album}</h3>
                  <p className="artist">{item.artist}</p>
                  <span className="genre-tag">{item.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Entertainment;
