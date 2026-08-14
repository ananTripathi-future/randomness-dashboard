import React, { useState } from 'react';
import axios from 'axios';
import { BarChart2, Play, RefreshCw, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

export default function Compare() {
  const [numBits, setNumBits] = useState(100000);
  const [prngSeed, setPrngSeed] = useState(123456);
  const [loading, setLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);

  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/compare/run`, {
        num_bits: Number(numBits),
        alpha: 0.01,
        prng_seed: Number(prngSeed)
      });
      setCompareData(res.data);
    } catch (err) {
      alert('Error running generator comparison: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <BarChart2 size={20} />
          <span>Generator Comparison Matrix</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          PRNG vs TRNG vs QRNG Comparison
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px', maxWidth: '850px' }}>
          Evaluate Pseudorandom (PRNG), Hardware/OS Entropy (TRNG), and Quantum (QRNG) sources side-by-side under identical bitstream parameters against all NIST SP 800-22 tests.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              Sequence Length (Bits per Generator)
            </label>
            <select
              value={numBits}
              onChange={(e) => setNumBits(Number(e.target.value))}
              className="custom-input"
              style={{ width: '100%' }}
            >
              <option value={10000}>10,000 bits (Fast)</option>
              <option value={100000}>100,000 bits (Standard)</option>
              <option value={500000}>500,000 bits (Comprehensive)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              PRNG Seed Integer
            </label>
            <input
              type="number"
              value={prngSeed}
              onChange={(e) => setPrngSeed(Number(e.target.value))}
              className="custom-input"
              style={{ width: '100%', fontFamily: 'Fira Code' }}
            />
          </div>

          <div>
            <button
              onClick={handleRunComparison}
              disabled={loading}
              className="custom-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              <span>{loading ? 'Evaluating All Generators...' : 'Run Comparative Suite'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Results View */}
      {compareData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {compareData.comparison.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', tracking: '1px' }}>
                  {item.category}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 12px 0' }}>
                  {item.name}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090d16', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Overall Pass Rate</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: item.pass_rate >= 90 ? '#34d399' : '#f87171' }}>
                    {item.pass_rate}%
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Passed: <strong>{item.passed} / {item.total} tests</strong></div>
                  <div>Seed: <strong>{item.seed}</strong></div>
                  <div>Reproducible: <strong>{item.is_reproducible ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* Test Matrix */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>
              Side-by-Side Test Decision Matrix (α = 0.01)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Statistical Test Name</th>
                    <th style={{ padding: '12px 16px' }}>PRNG (Mersenne)</th>
                    <th style={{ padding: '12px 16px' }}>TRNG (OS Entropy)</th>
                    <th style={{ padding: '12px 16px' }}>QRNG (Beam Splitter)</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData.comparison[0]?.eval?.tests?.map((t, index) => {
                    const prngTest = compareData.comparison[0]?.eval?.tests[index];
                    const trngTest = compareData.comparison[1]?.eval?.tests[index];
                    const qrngTest = compareData.comparison[2]?.eval?.tests[index];

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                          {t.name}
                        </td>
                        
                        <td style={{ padding: '12px 16px' }}>
                          <span className={prngTest?.status === 'PASS' ? 'badge-pass' : 'badge-fail'}>
                            {prngTest?.status} ({prngTest?.p_value?.toFixed(4)})
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span className={trngTest?.status === 'PASS' ? 'badge-pass' : 'badge-fail'}>
                            {trngTest?.status} ({trngTest?.p_value?.toFixed(4)})
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span className={qrngTest?.status === 'PASS' ? 'badge-pass' : 'badge-fail'}>
                            {qrngTest?.status} ({qrngTest?.p_value?.toFixed(4)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '8px' }}>
              <strong>Scientific Note:</strong> This comparative matrix reflects statistical behavior over the evaluated bit stream. High statistical pass rates in PRNG, TRNG, and QRNG demonstrate strong mathematical uniformity, but do not imply identical security properties or physical quantum origin.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
