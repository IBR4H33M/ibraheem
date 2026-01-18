import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Home.css';

const Home = () => {
  const [showTooltip, setShowTooltip] = useState({ slide: null, visible: false });
  const [sections] = useState([
    {
      id: 1,
      type: 'video',
      src: '/assets/fh5_unb.mp4',
      poster: '/assets/hero-poster.jpg',
      overlayText: 'My comfort Space',
      tooltipTitle: 'About this clip',
      tooltipContent: 'Whether I\'m down or happy as I can be, racing is something that always soothes my mind. The following video was created with a combination of gameplays of Forza Horizon 5 and Need for Speed Unbound gameplay clips recorded at 1440p 60fps on Xbox Series X. Cyberlink PowerDirector 2026 was used to edit the video.'
    },
    {
      id: 2,
      type: 'video',
      src: '/assets/video2.mp4',
      poster: '/assets/video2-poster.jpg',
      overlayText: 'Placeholder Title',
      tooltipTitle: 'About this clip',
      tooltipContent: 'Placeholder description for second video.'
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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    customPaging: i => (
      <div className="slick-dot"></div>
    ),
    beforeChange: (current, next) => {
      // Pause current video when changing slides
      if (videoRefs.current[current]) {
        videoRefs.current[current].pause();
      }
    },
    afterChange: (current) => {
      // Play new video when slide changes
      if (videoRefs.current[current] && !prefersReducedMotion) {
        videoRefs.current[current].play();
      }
    }
  };

  return (
    <div className="home-page">
      {/* Video Slider */}
      <div className="video-slider">
        <Slider {...sliderSettings}>
          {sections.map((section, index) => (
            <div key={section.id} className="slider-slide">
              <video
                ref={el => videoRefs.current[index] = el}
                className="section-bg-video"
                poster={section.poster}
                muted
                loop
                playsInline
                preload="metadata"
                autoPlay={!prefersReducedMotion && index === 0}
              >
                <source src={section.src} type="video/mp4" />
              </video>
              <div className="video-overlay">
                <div className="overlay-left">
                  <h2 className="overlay-text">{section.overlayText}</h2>
                </div>
                <div className="overlay-right">
                  <div 
                    className="info-icon"
                    onMouseEnter={() => setShowTooltip({ slide: index, visible: true })}
                    onMouseLeave={() => setShowTooltip({ slide: index, visible: false })}
                  >
                    !
                  </div>
                  {showTooltip.visible && showTooltip.slide === index && (
                    <div className="tooltip">
                      <h4>{section.tooltipTitle}</h4>
                      <p>{section.tooltipContent}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Welcome Text */}
      <motion.div
        className="welcome-text-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="welcome-text">Welcome to Ibraheem's Space!</h1>
      </motion.div>

      {/* Side by Side Sections (images only) */}
      <div className="side-by-side-container">
        {sections.filter(section => section.type === 'image').slice(0,2).map((section, index) => (
          <motion.section
            key={section.id}
            className={`half-width-section ${section.type}-section`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: (index) * 0.2 }}
          >
            <div
              className="section-bg-image"
              style={{ backgroundImage: `url(${section.src})` }}
            />
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
