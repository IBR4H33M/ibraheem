import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
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
  const collectiblesRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState({ slide: -1, visible: false });

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

  // Scroll reveal for collectibles on mobile
  useEffect(() => {
    const el = collectiblesRef.current;
    if (!el) return;
  }, []);

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

      {/* Collectibles Section */}
      <div className="collectibles-horizontal-section" ref={collectiblesRef}>
        {/* Left: Text */}
        <div className="collectibles-left">
          <Link to="/collectibles" className="collectibles-heading">
            <span>&lt;COLLECTIBLES&gt;</span>
          </Link>
        </div>
        {/* Right: bg image + f40 overlay */}
        <div className="collectibles-right">
          <img src="/assets/f40.webp" alt="Ferrari F40" className="f40-image" />
        </div>
      </div>

    </div>
  );
};

export default Home;
