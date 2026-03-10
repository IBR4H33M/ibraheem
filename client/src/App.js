import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import AboutMe from './pages/AboutMe';
import TechSpace from './pages/TechSpace';
import Gaming from './pages/Gaming';
import Entertainment from './pages/Entertainment';
import Collectibles from './pages/Collectibles';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="app">
      {!isAdminPage && <Nav />}
      <main className={`main-content ${isHomePage ? 'home-content' : ''} ${isAdminPage ? 'admin-content' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/techspace" element={<TechSpace />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/fandom" element={<Entertainment />} />
          <Route path="/collectibles" element={<Collectibles />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
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
