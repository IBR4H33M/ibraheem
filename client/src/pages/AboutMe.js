import React from 'react';
import { motion } from 'framer-motion';
import './AboutMe.css';

const AboutMe = () => {
  return (
    <motion.div 
      className="about-page page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">About Me</h1>
      
      <div className="about-content">
        <div className="about-intro">
          <motion.div 
            className="profile-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="profile-image-container">
              {/* Add your profile image here */}
              <div className="profile-placeholder">
                <span>Your Photo</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="intro-text"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2>Hi, I'm Ibraheem Ibn Anwar</h2>
            <p className="tagline">
              Welcome to my personal corner of the internet
            </p>
            <p className="bio">
              {/* Add your bio here */}
              This is where you can share your story, background, and what drives you. 
              Tell visitors about your journey, your passions, and what makes you unique.
            </p>
          </motion.div>
        </div>

        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">What I Do</h2>
          <div className="skills-grid">
            <div className="skill-card">
              <h3>Development</h3>
              <p>Description of your development skills and experience</p>
            </div>
            <div className="skill-card">
              <h3>Gaming</h3>
              <p>Your passion for gaming and favorite genres</p>
            </div>
            <div className="skill-card">
              <h3>Entertainment</h3>
              <p>Movies, shows, and content you enjoy</p>
            </div>
            <div className="skill-card">
              <h3>Tech</h3>
              <p>Technology interests and expertise</p>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="section-title">Connect With Me</h2>
          <div className="social-links">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="social-icon">GitHub</span>
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="social-icon">LinkedIn</span>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="social-icon">Twitter</span>
            </a>
            <a href="mailto:contact@ibraheemibnanwar.me" className="social-link">
              <span className="social-icon">Email</span>
            </a>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default AboutMe;
