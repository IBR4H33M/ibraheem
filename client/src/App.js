import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutMe from './pages/AboutMe';
import TechSpace from './pages/TechSpace';
import Gaming from './pages/Gaming';
import Entertainment from './pages/Entertainment';
import AdminLogin from './pages/AdminLogin';
import StudentPerformancePredictor from './pages/StudentPerformancePredictor';
import SentimentAnalysisProductReview from './pages/SentimentAnalysisProductReview';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';
  const isAdminPage = location.pathname === '/admin';
  const showFooter = !isAdminPage;

  useEffect(() => {
    const metaByPath = {
      '/': {
        title: "Ibraheem Ibn Anwar - Ibraheem's space",
        description: "Welcome to Ibraheem's corner of the Internet! Explore the things that keep Ibraheem going and see what he's been upto!",
      },
      '/contact': {
        title: "Contact Ibraheem | Ibraheem's Space",
        description: 'Get in touch with Ibraheem through email or social links, or leave a message directly from the contact page.',
      },
      '/techspace': {
        title: "Ibraheem's Techspace | Ibraheem's Space",
        description: 'Explore Ibraheem\'s tech projects, machine learning work, and development experiments.',
      },
      '/techspace/Sentiment-Analysis-of-Product-Reviews': {
        title: 'Predict Sentiment of Product Reviews | Ibraheem\'s Space',
        description: 'Analyze product review text with machine learning models to predict sentiment and confidence.',
      },
      '/techspace/StudentPerformancePredictor': {
        title: 'Predict Student Performance | Ibraheem\'s Space',
        description: 'Predict student performance using machine learning based on educational and behavioral inputs.',
      },
      '/about': {
        title: 'About Ibraheem | Ibraheem\'s Space',
        description: 'Learn about Ibraheem, his interests, social profiles, and personal highlights.',
      },
      '/gaming': {
        title: 'Gaming | Ibraheem\'s Space',
        description: 'See recently played games, recommendations, and gaming captures from Ibraheem.',
      },
      '/fandom': {
        title: 'Fandom | Ibraheem\'s Space',
        description: 'Discover favorite movies, shows, and entertainment picks curated by Ibraheem.',
      },
    };

    const fallback = {
      title: "Ibraheem Ibn Anwar - Ibraheem's space",
      description: "Welcome to Ibraheem's corner of the Internet! Explore the things that keep Ibraheem going and see what he's been upto!",
    };

    const meta = metaByPath[location.pathname] || fallback;
    document.title = meta.title;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', meta.description);

    const canonicalUrl = `https://ibraheemibnanwar.me${location.pathname}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);
  }, [location.pathname]);

  return (
    <div className="app">
      {!isAdminPage && <Nav />}
      <ScrollToTop />
      <main className={`main-content ${isHomePage ? 'home-content' : ''} ${isAboutPage ? 'about-content' : ''} ${isAdminPage ? 'admin-content' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/techspace" element={<TechSpace />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/fandom" element={<Entertainment />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/techspace/StudentPerformancePredictor" element={<StudentPerformancePredictor />} />
          <Route path="/techspace/Sentiment-Analysis-of-Product-Reviews" element={<SentimentAnalysisProductReview />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
