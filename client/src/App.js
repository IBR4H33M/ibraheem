import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import AboutMe from './pages/AboutMe';
import TechSpace from './pages/TechSpace';
import Gaming from './pages/Gaming';
import Entertainment from './pages/Entertainment';
import Collectibles from './pages/Collectibles';
import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="app">
      <Nav />
      <main className={`main-content ${isHomePage ? 'home-content' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/techspace" element={<TechSpace />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/entertainment" element={<Entertainment />} />
          <Route path="/collectibles" element={<Collectibles />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
