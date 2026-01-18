import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [sections] = useState([
    {
      id: 1,
      type: 'video',
      src: '/assets/fh5_unb.mp4',
      poster: '/assets/hero-poster.jpg',
      title: 'Welcome to My Space',
      subtitle: 'Explore my world of gaming, tech, and creativity',
      link: '/about',
      linkText: 'Learn More'
    },
    {
      id: 2,
      type: 'content',
      title: 'Discover My World',
      subtitle: 'Dive into my passions and projects',
      content: 'From gaming adventures to tech innovations, explore what drives my creativity.'
    },
    {
      id: 3,
      type: 'image',
      src: '/assets/gaming-bg.jpg',
      title: 'Gaming World',
      subtitle: 'My favorite games and gaming experiences',
      link: '/gaming',
      linkText: 'Enter Gaming'
    },
    {
      id: 4,
      type: 'image',
      src: '/assets/tech-bg.jpg',
      title: 'Tech Space',
      subtitle: 'Code, projects, and technological adventures',
      link: '/techspace',
      linkText: 'Explore Tech'
    }
  ]);

  const videoRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
        }
        // Removed pause logic to keep video playing when scrolling down
      });
    }, { threshold: 0.5 });

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="home-page">
      {/* Video Section */}
      <motion.section
        key={sections[0].id}
        className={`full-width-section ${sections[0].type}-section`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0 }}
      >
        <video
          ref={el => videoRefs.current[0] = el}
          className="section-bg-video"
          poster={sections[0].poster}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={!prefersReducedMotion}
        >
          <source src={sections[0].src} type="video/mp4" />
        </video>
      </motion.section>

      {/* Horizontal Content Section */}
      <motion.section
        key={sections[1].id}
        className="full-width-section content-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="section-content">
          <h2 className="section-title">{sections[1].title}</h2>
          <p className="section-subtitle">{sections[1].subtitle}</p>
          <p className="section-description">{sections[1].content}</p>
        </div>
      </motion.section>

      {/* Side by Side Sections */}
      <div className="side-by-side-container">
        {sections.slice(2).map((section, index) => (
          <motion.section
            key={section.id}
            className={`half-width-section ${section.type}-section`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: (index + 2) * 0.2 }}
          >
            {section.type === 'video' ? (
              <video
                ref={el => videoRefs.current[index + 1] = el}
                className="section-bg-video"
                poster={section.poster}
                muted
                loop
                playsInline
                preload="metadata"
                autoPlay={!prefersReducedMotion}
              >
                <source src={section.src} type="video/mp4" />
              </video>
            ) : (
              <div
                className="section-bg-image"
                style={{ backgroundImage: `url(${section.src})` }}
              />
            )}
            <div className="section-overlay">
              <div className="section-content">
                <h3 className="section-title">{section.title}</h3>
                <p className="section-subtitle">{section.subtitle}</p>
                <Link to={section.link} className="section-link">{section.linkText}</Link>
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      {/* Footer */}
      <footer className="website-footer">
        <div className="footer-content">
          <p>&copy; 2024 My Space. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/gaming">Gaming</Link>
            <Link to="/techspace">Tech</Link>
            <Link to="/entertainment">Entertainment</Link>
            <Link to="/collectibles">Collectibles</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
