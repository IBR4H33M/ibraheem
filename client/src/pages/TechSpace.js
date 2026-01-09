import React from 'react';
import { motion } from 'framer-motion';
import './TechSpace.css';

const TechSpace = () => {
  return (
    <motion.div 
      className="techspace-page page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">TechSpace</h1>

      <div className="techspace-content">
        <motion.section 
          className="tech-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-header">
                <h3>Project Name</h3>
                <span className="project-tag">Web</span>
              </div>
              <p>Description of the project and technologies used.</p>
              <div className="project-links">
                <a href="#" className="project-link">View Live</a>
                <a href="#" className="project-link">GitHub</a>
              </div>
            </div>
            <div className="project-card">
              <div className="project-header">
                <h3>Another Project</h3>
                <span className="project-tag">App</span>
              </div>
              <p>Description of another project and what it does.</p>
              <div className="project-links">
                <a href="#" className="project-link">View Live</a>
                <a href="#" className="project-link">GitHub</a>
              </div>
            </div>
            {/* Add more project cards as needed */}
          </div>
        </motion.section>

        <motion.section 
          className="tech-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="section-title">Tech Stack</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Frontend</h3>
              <div className="tech-items">
                <span className="tech-item">React</span>
                <span className="tech-item">JavaScript</span>
                <span className="tech-item">HTML/CSS</span>
                <span className="tech-item">TypeScript</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <div className="tech-items">
                <span className="tech-item">Node.js</span>
                <span className="tech-item">Express</span>
                <span className="tech-item">MongoDB</span>
                <span className="tech-item">Python</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Tools</h3>
              <div className="tech-items">
                <span className="tech-item">Git</span>
                <span className="tech-item">VS Code</span>
                <span className="tech-item">Docker</span>
                <span className="tech-item">AWS</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="tech-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">Blog / Articles</h2>
          <div className="articles-list">
            <article className="article-card">
              <span className="article-date">January 2026</span>
              <h3>Article Title Here</h3>
              <p>Brief description of the article content...</p>
              <a href="#" className="read-more">Read More →</a>
            </article>
            {/* Add more articles as needed */}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default TechSpace;
