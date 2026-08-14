import React, { useState } from 'react';
import axios from 'axios';
import { Binary, Play, RefreshCw, CheckCircle, ShieldAlert, TestTube } from 'lucide-react';
import TestTable from '../components/TestTable';
import { PassFailDonutChart, PValueBarChart } from '../components/Charts';

import { API_BASE_URL } from '../apiConfig';

export default function PRNGPage() {
  const [algorithm, setAlgorithm] = useState('Mersenne Twister');
  const [seed, setSeed] = useState(123456);
  const [numBits, setNumBits] = useState(100000);
  const [generatedData, setGeneratedData] = useState(null);
  const [nistResults, setNistResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setNistResults(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate/prng`, {
        algorithm,
        num_bits: numBits,
        seed: Number(seed)
      });
      setGeneratedData(res.data);
    } catch (err) {
      alert('Error generating PRNG stream: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRunNist = async () => {
    if (!generatedData?.bits) return;
    setTesting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/nist/run`, {
        bit_str: generatedData.bits,
        alpha: 0.01,
        num_sequences: 1,
        source_type: 'PRNG',
        algorithm_or_source: generatedData.algorithm,
        seed: generatedData.seed
      });
      setNistResults(res.data);
    } catch (err) {
      alert('Error running NIST suite: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTesting(false);
    }
  };

  const bitPreview = generatedData?.bits ? generatedData.bits.substring(0, 300) + '...' : '';
  const onesCount = generatedData?.bits ? (generatedData.bits.match(/1/g) || []).length : 0;
  const onesRatio = generatedData?.bits ? (onesCount / generatedData.bits.length * 100).toFixed(2) : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <Binary size={20} />
          <span>Deterministic Pseudorandom Number Generation</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          PRNG Laboratory
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px', maxWidth: '800px' }}>
          Pseudo-Random Number Generators produce numbers using a deterministic mathematical algorithm starting from an initial seed. 
          Given identical seeds, the algorithm guarantees 100% reproducible bitstreams.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
          
          {/* Algorithm selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              PRNG Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="custom-input"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="Mersenne Twister">Mersenne Twister (MT19937)</option>
              <option value="PCG32">PCG32 (Permuted Congruential Generator)</option>
              <option value="Xorshift128+">Xorshift128+</option>
              <option value="ChaCha20 CSPRNG">ChaCha20 CSPRNG</option>
            </select>
          </div>

          {/* Seed Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              Initial Seed (Integer)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="custom-input"
                style={{ flex: 1, fontFamily: 'Fira Code' }}
              />
              <button
                type="button"
                onClick={handleRandomSeed}
                className="custom-button"
                style={{ padding: '8px 12px', background: '#1e293b' }}
                title="Generate Random Seed"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Number of bits */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              Number of Bits
            </label>
            <select
              value={numBits}
              onChange={(e) => setNumBits(Number(e.target.value))}
              className="custom-input"
              style={{ width: '100%' }}
            >
              <option value={10000}>10,000 bits (Quick)</option>
              <option value={100000}>100,000 bits (Standard)</option>
              <option value={500000}>500,000 bits (Deep Analysis)</option>
            </select>
          </div>

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="custom-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              <span>{loading ? 'Generating...' : 'Generate Stream'}</span>
            </button>
          </div>

        </div>

        {/* Reproducibility Callout */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '0.8rem',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>Seed Reproducibility Active: Supplying Seed = <strong>{seed}</strong> with <strong>{algorithm}</strong> will re-create this exact sequence.</span>
        </div>
      </div>

      {/* Output Stream Section */}
      {generatedData && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Generated Bit Stream ({generatedData.num_bits.toLocaleString()} bits)
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Algorithm: <strong>{generatedData.algorithm}</strong> | Seed: <strong>{generatedData.seed}</strong>
              </div>
            </div>

            <button
              onClick={handleRunNist}
              disabled={testing}
              className="custom-button"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
            >
              {testing ? <RefreshCw className="animate-spin" size={18} /> : <TestTube size={18} />}
              <span>{testing ? 'Executing NIST Suite...' : 'Run NIST Tests (α = 0.01)'}</span>
            </button>
          </div>

          {/* Bit stream preview box */}
          <div style={{
            background: '#070a12',
            border: '1px solid #1f293d',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: 'Fira Code',
            fontSize: '0.8rem',
            color: '#38bdf8',
            wordBreak: 'break-all',
            maxHeight: '120px',
            overflowY: 'auto',
            marginBottom: '16px'
          }}>
            {bitPreview}
          </div>

          {/* Distribution bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Bit Balance Ratio</span>
              <span>1s: <strong>{onesRatio}%</strong> | 0s: <strong>{(100 - onesRatio).toFixed(2)}%</strong></span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${onesRatio}%`, background: '#38bdf8' }} />
              <div style={{ width: `${100 - onesRatio}%`, background: '#6366f1' }} />
            </div>
          </div>
        </div>
      )}

      {/* NIST Test Results inline view */}
      {nistResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Pass Rate Ratio (α = 0.01)
              </h4>
              <PassFailDonutChart passed={nistResults.passed} failed={nistResults.failed} passRate={nistResults.pass_rate} />
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                P-value Scatter Profile
              </h4>
              <PValueBarChart tests={nistResults.tests} alpha={0.01} />
            </div>
          </div>

          <TestTable tests={nistResults.tests} alpha={0.01} />
        </div>
      )}

    </div>
  );
}
