import React from 'react';
import { Link } from 'react-router-dom';
import { Binary, Zap, Atom, TestTube, ArrowRight, ShieldCheck, Cpu, BarChart2 } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '48px 40px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(13, 27, 42, 0.9) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <ShieldCheck size={15} />
            <span>NIST SP 800-22 Rev 1a Statistical Suite</span>
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, color: '#f8fafc', marginBottom: '16px' }}>
            Random Number Generation & <br />
            <span className="text-gradient-cyan">Statistical Randomness Testing</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px' }}>
            Explore pseudorandom (PRNG), hardware-simulated (TRNG), and quantum (QRNG) randomness sources. 
            Evaluate binary bitstreams against all 15 NIST statistical tests with P-value uniformity analysis (α = 0.01).
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/nist" className="custom-button" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '0.95rem' }}>
              <TestTube size={18} />
              <span>Launch NIST Laboratory</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/compare" style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}>
              <BarChart2 size={18} />
              <span>Compare Generators</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Core Generator Cards */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>
        Randomness Generator Categories
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        
        {/* Card 1: PRNG */}
        <div className="glass-panel glass-card-hover" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Binary size={26} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            PRNG (Pseudo-Random)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Generates bit streams using deterministic algorithms starting from an initial seed integer. Completely reproducible given identical seeds.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '20px' }}>
            Algorithms: Mersenne Twister, PCG32, Xorshift128+, ChaCha20
          </div>
          <Link to="/prng" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Explore PRNG Generator</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Card 2: TRNG */}
        <div className="glass-panel glass-card-hover" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Zap size={26} color="#eab308" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            TRNG (Hardware / OS Entropy)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Harvesters OS system entropy pools and CPU timing jitter noise. Simulates true physical entropy acquisition.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '20px' }}>
            Sources: OS urandom pool, CPU Execution Jitter Harvester
          </div>
          <Link to="/trng" style={{ color: '#eab308', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Explore TRNG Harvester</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Card 3: QRNG */}
        <div className="glass-panel glass-card-hover" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Atom size={26} color="#c084fc" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            QRNG (Quantum Random)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Models quantum mechanical phenomena such as 50:50 photonic beam splitting, vacuum field zero-point fluctuations, and live ANU quantum proxy.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '20px' }}>
            Models: Single Photon Beam Splitter, Vacuum Field, ANU API
          </div>
          <Link to="/qrng" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Explore Quantum Simulator</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>

    </div>
  );
}
