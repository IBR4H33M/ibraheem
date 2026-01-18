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
      type: 'image',
      src: '/assets/about-bg.jpg',
      title: 'About Me',
      subtitle: 'Get to know the person behind the projects',
      link: '/about',
      linkText: 'Discover'
    },
    {
      id: 3,
      type: 'video',
      src: '/assets/fh5_unb.mp4',
      poster: '/assets/gaming-poster.jpg',
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
    },
    {
      id: 5,
      type: 'video',
      src: '/assets/fh5_unb.mp4',
      poster: '/assets/entertainment-poster.jpg',
      title: 'Entertainment',
      subtitle: 'Movies, music, and leisure activities',
      link: '/entertainment',
      linkText: 'Dive In'
    },
    {
      id: 6,
      type: 'image',
      src: '/assets/toys-bg.jpg',
      title: 'Toy Collection',
      subtitle: 'My collection of interesting toys and gadgets',
      link: '/toys',
      linkText: 'See Collection'
    }
  ]);

  const videoRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
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
      {sections.map((section, index) => (
        <motion.section
          key={section.id}
          className={`full-width-section ${section.type}-section`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
        >
          {section.type === 'video' ? (
            <video
              ref={el => videoRefs.current[index] = el}
              className="section-bg-video"
              poster={section.poster}
              muted
              loop
              playsInline
              preload="metadata"
              autoPlay={!prefersReducedMotion}
            >
              <source src={section.src} type="video/mp4" />
              {/* Add WebM source if available */}
              {/* <source src={section.src.replace('.mp4', '.webm')} type="video/webm" /> */}
            </video>
          ) : (
            <div
              className="section-bg-image"
              style={{ backgroundImage: `url(${section.src})` }}
            />
          )}
        </motion.section>
      ))}
    </div>
  );
};

export default Home;
