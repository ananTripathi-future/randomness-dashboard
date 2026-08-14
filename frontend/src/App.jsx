import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import PRNGPage from './pages/PRNG';
import TRNGPage from './pages/TRNG';
import QRNGPage from './pages/QRNG';
import NISTTests from './pages/NISTTests';
import Compare from './pages/Compare';
import HistoryPage from './pages/History';
import Educational from './pages/Educational';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#090d16' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prng" element={<PRNGPage />} />
            <Route path="/trng" element={<TRNGPage />} />
            <Route path="/qrng" element={<QRNGPage />} />
            <Route path="/nist" element={<NISTTests />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<Educational />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
