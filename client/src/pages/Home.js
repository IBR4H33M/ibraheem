import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Home.css';

const Home = () => {
  const [sections] = useState([
    {
      id: 1,
      type: 'video',
      src: '/assets/fh5_unb.mp4',
      poster: '/assets/hero-poster.jpg',
      tooltipTitle: 'Forza Horizon 5',
      tooltipContent: 'An open world racing game set in Mexico. One of the most visually stunning racing games ever made.'
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
  const gamingRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState({ slide: -1, visible: false });
  const [recentGames, setRecentGames] = useState([]);
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const safePlay = (video) => {
    if (!video) return;
    try {
      const p = video.play();
      if (p && typeof p.then === 'function') p.catch(() => {});
    } catch (e) {
      // ignore play errors
    }
  };

  const safePause = (video) => {
    if (!video) return;
    try {
      video.pause();
    } catch (e) {
      // ignore pause errors
    }
  };

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
    beforeChange: () => {
      // Pause the currently active slide's video (works with cloned slides)
      try {
        const activeVid = document.querySelector('.slick-slide.slick-active video');
        if (activeVid) safePause(activeVid);
      } catch (e) {}
    },
    afterChange: () => {
      // Play the newly active slide's video
      try {
        const activeVid = document.querySelector('.slick-slide.slick-active video');
        if (activeVid && !prefersReducedMotion) safePlay(activeVid);
      } catch (e) {}
    }
  };

  // Only include videos in the slider; images go to the side-by-side area
  const videoSlides = sections.filter(s => s.type === 'video');

  // On mount, play the active slide's video (handles slick clones)
  useEffect(() => {
    try {
      const activeVid = document.querySelector('.slick-slide.slick-active video');
      if (activeVid && !prefersReducedMotion) safePlay(activeVid);
    } catch (e) {}
  }, [prefersReducedMotion]);

  useEffect(() => {
    axios.get('/api/recent-games')
      .then(({ data }) => { if (data.length) setRecentGames(data); })
      .catch(() => {});
  }, []);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.type.includes('mouse') ? e.clientX : e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const delta = currentX - dragStart;
    setManualRotation(prev => prev - delta * 0.005);
    setDragStart(currentX);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="home-page">
      {/* Video Slider */}
      <div className="video-slider">
        <Slider {...sliderSettings}>
          {videoSlides.map((section, index) => (
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
                <div className="overlay-right">
                  <div
                    className="info-icon"
                    onMouseEnter={() => setShowTooltip({ slide: index, visible: true })}
                    onMouseLeave={() => setShowTooltip({ slide: index, visible: false })}
                    onClick={() => setShowTooltip(prev => ({ slide: index, visible: !prev.visible }))}
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

      {/* Fandom Section - Full Width */}
      <div className="fandom-section-container">
        <div className="fandom-tile">
          <div className="fandom-video-frame">
            <video className="fandom-video" muted loop autoPlay playsInline preload="metadata">
              <source src="/assets/fandom.mp4" type="video/mp4" />
            </video>
          </div>
          <Link to="/fandom" className="fandom-title">&lt;FANDOM&gt;</Link>
        </div>
      </div>

      {/* Gaming Section */}
      <div className="gaming-horizontal-section" ref={gamingRef}>
        <div className="gaming-left">
          <Link to="/gaming" className="gaming-heading">
            <span>&lt;GAMING&gt;</span>
          </Link>
        </div>
        <div className="gaming-right">
          <div 
            className="gaming-carousel"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {recentGames.map((game, index) => {
              const totalGames = recentGames.length;
              const angle = (index / totalGames) * Math.PI * 2 + manualRotation;
              const radius = 280;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const scale = 0.6 + (z + radius) / (radius * 2) * 0.6;
              const opacity = 0.3 + (z + radius) / (radius * 2) * 0.7;
              
              return (
                <div
                  key={game._id}
                  className="gaming-card"
                  style={{
                    transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.round(z + radius)
                  }}
                >
                  {game.coverUrl && (
                    <img src={game.coverUrl} alt={game.title} className="gaming-card-img" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
