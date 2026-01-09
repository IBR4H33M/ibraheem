import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import AboutMe from './pages/AboutMe';
import TechSpace from './pages/TechSpace';
import Gaming from './pages/Gaming';
import Entertainment from './pages/Entertainment';
import Toys from './pages/Toys';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/techspace" element={<TechSpace />} />
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/entertainment" element={<Entertainment />} />
            <Route path="/toys" element={<Toys />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
