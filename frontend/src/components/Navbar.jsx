import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Binary, Zap, Atom, TestTube, BarChart2, History, BookOpen, Activity } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

export default function Navbar() {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 3000 });
        if (isMounted && res.data?.status === 'online') {
          setBackendStatus('online');
        } else if (isMounted) {
          setBackendStatus('offline');
        }
      } catch (err) {
        if (isMounted) setBackendStatus('offline');
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Cpu },
    { path: '/prng', label: 'PRNG', icon: Binary },
    { path: '/trng', label: 'TRNG', icon: Zap },
    { path: '/qrng', label: 'QRNG', icon: Atom },
    { path: '/nist', label: 'NIST Suite', icon: TestTube },
    { path: '/compare', label: 'Compare', icon: BarChart2 },
    { path: '/history', label: 'History', icon: History },
    { path: '/about', label: 'Educational', icon: BookOpen },
  ];

  return (
    <nav style={{
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Binary size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f8fafc', letterSpacing: '-0.5px' }}>
              RNG<span style={{ color: '#38bdf8' }}>LAB</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              NIST SP 800-22 Suite
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Backend Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Activity size={13} color={backendStatus === 'online' ? '#10b981' : '#f59e0b'} />
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
            API: {backendStatus === 'online' ? (
              <span style={{ color: '#34d399', fontWeight: 600 }}>Connected</span>
            ) : (
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Connecting...</span>
            )}
          </span>
        </div>
      </div>
    </nav>
  );
}
