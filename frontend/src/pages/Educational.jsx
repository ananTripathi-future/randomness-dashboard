import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, HelpCircle, FileText, Cpu, AlertTriangle } from 'lucide-react';

export default function Educational() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <BookOpen size={20} />
          <span>Cryptographic & Statistical Foundations</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          Understanding NIST SP 800-22 & Randomness Principles
        </h1>
      </div>

      {/* Critical Security Distinction Box */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px' }}>
          <ShieldAlert size={22} />
          <span>Crucial Security Distinction: Statistical Randomness ≠ Cryptographic Security</span>
        </div>
        <p style={{ color: '#fca5a5', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Passing all 15 NIST SP 800-22 tests confirms that a sequence possesses statistical properties consistent with a ideal random sequence (uniformity, absence of periodicities, balanced runs). 
          However, <strong>a PASS decision does NOT prove cryptographic un-predictability or security.</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '14px', borderRadius: '10px' }}>
            <h4 style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>NIST Statistical Suite Evaluates:</h4>
            <ul style={{ fontSize: '0.8rem', color: '#cbd5e1', paddingLeft: '18px', lineHeight: '1.5' }}>
              <li>Bit balance ratio (0s vs 1s)</li>
              <li>Local pattern block frequencies</li>
              <li>Spectral peak FFT flat response</li>
              <li>Linear matrix rank dependencies</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '14px', borderRadius: '10px' }}>
            <h4 style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Cryptographic Security Requires:</h4>
            <ul style={{ fontSize: '0.8rem', color: '#cbd5e1', paddingLeft: '18px', lineHeight: '1.5' }}>
              <li>High physical entropy & forward secrecy</li>
              <li>Unpredictability against adversary state reconstruction</li>
              <li>Cryptographically secure seed management</li>
              <li>Resistance to side-channel attack models</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid of Educational Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '28px', marginBottom: '48px' }}>
        
        {/* Module 1: P-value & Significance Level */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#38bdf8" />
            <span>P-Value & Significance Level (α = 0.01)</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            The <strong>P-value</strong> measures the probability that a perfect random generator would produce a sequence less random than the evaluated sequence.
          </p>
          <div style={{ background: '#090d16', padding: '12px 14px', borderRadius: '8px', marginTop: '12px', fontSize: '0.82rem', fontFamily: 'Fira Code', color: '#34d399' }}>
            Decision Rule:<br />
            P-value &gt;= 0.01 --&gt; PASS (Sequence appears random)<br />
            P-value &lt; 0.01  --&gt; FAIL (Reject null hypothesis H0)
          </div>
        </div>

        {/* Module 2: P-value Uniformity */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="#818cf8" />
            <span>P-Value Uniformity (Chi-Square χ²)</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            When testing multiple sub-sequences (s &gt; 1), NIST SP 800-22 mandates evaluating whether P-values are uniformly distributed over 10 sub-intervals [0, 1).
          </p>
          <div style={{ background: '#090d16', padding: '12px 14px', borderRadius: '8px', marginTop: '12px', fontSize: '0.82rem', fontFamily: 'Fira Code', color: '#818cf8' }}>
            Chi-Square (χ²): Sum((F_i - s/10)² / (s/10))<br />
            P_uniformity = igamc(9/2, χ²/2) &gt;= 0.0001
          </div>
        </div>

      </div>

      {/* Generator Comparison Table */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px' }}>
          Randomness Source Properties Summary
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Property</th>
                <th style={{ padding: '12px 16px' }}>PRNG</th>
                <th style={{ padding: '12px 16px' }}>TRNG (Hardware)</th>
                <th style={{ padding: '12px 16px' }}>QRNG (Quantum)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>Algorithm-Based</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Yes (Deterministic)</td>
                <td style={{ padding: '12px 16px', color: '#f87171' }}>Not Primary Source</td>
                <td style={{ padding: '12px 16px', color: '#f87171' }}>Not Primary Source</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>Physical Entropy</td>
                <td style={{ padding: '12px 16px', color: '#f87171' }}>No</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Yes (Thermal/Noise)</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Yes (Photonic/Vacuum)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>Quantum Phenomenon</td>
                <td style={{ padding: '12px 16px', color: '#f87171' }}>No</td>
                <td style={{ padding: '12px 16px', color: '#f87171' }}>No</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Yes (Single Photon)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>Seed Reproducibility</td>
                <td style={{ padding: '12px 16px', color: '#38bdf8' }}>100% Reproducible</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Non-reproducible</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Non-reproducible</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>NIST SP 800-22 Testing</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Evaluates Bit Output</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Evaluates Bit Output</td>
                <td style={{ padding: '12px 16px', color: '#34d399' }}>Evaluates Bit Output</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
