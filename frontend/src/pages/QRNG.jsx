import React, { useState } from 'react';
import axios from 'axios';
import { Atom, Play, RefreshCw, AlertCircle, TestTube, Sparkles } from 'lucide-react';
import TestTable from '../components/TestTable';
import { PassFailDonutChart, PValueBarChart } from '../components/Charts';

import { API_BASE_URL } from '../apiConfig';

export default function QRNGPage() {
  const [model, setModel] = useState('Quantum Beam Splitter');
  const [numBits, setNumBits] = useState(100000);
  const [generatedData, setGeneratedData] = useState(null);
  const [nistResults, setNistResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setNistResults(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate/qrng`, {
        model,
        num_bits: numBits
      });
      setGeneratedData(res.data);
    } catch (err) {
      alert('Error simulating QRNG stream: ' + (err.response?.data?.detail || err.message));
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
        source_type: 'QRNG Simulation',
        algorithm_or_source: generatedData.model
      });
      setNistResults(res.data);
    } catch (err) {
      alert('Error running NIST suite: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTesting(false);
    }
  };

  const bitPreview = generatedData?.bits ? generatedData.bits.substring(0, 300) + '...' : '';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c084fc', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <Atom size={20} />
          <span>Quantum Phenomenon & Physical State Measurement</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          QRNG Laboratory
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px', maxWidth: '800px' }}>
          Quantum Random Number Generators measure fundamental quantum phenomena such as single-photon transmission through a beam splitter or zero-point vacuum electric field fluctuations.
        </p>
      </div>

      {/* Quantum Origin Distinction Callout */}
      <div style={{
        background: 'rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <AlertCircle size={24} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#f0abfc', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
            NIST Statistical Evaluation vs Quantum Origin Proof
          </h4>
          <p style={{ color: '#fae8ff', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <strong>NIST SP 800-22 does NOT prove that a sequence is genuinely quantum.</strong> The NIST suite evaluates mathematical properties of binary streams (uniformity, periodicity, runs). 
            A classical PRNG or deterministic PRNG stream can pass NIST statistical tests identically to quantum random data.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'end' }}>
          
          {/* Quantum Model Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              Quantum Phenomenon Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="custom-input"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="Quantum Beam Splitter">Single Photon 50:50 Beam Splitter Model</option>
              <option value="Quantum Vacuum Fluctuation">Quantum Vacuum Fluctuation (Homodyne Detection)</option>
              <option value="ANU Quantum API">ANU Quantum Random Number Generator API (Proxy)</option>
            </select>
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

          {/* Measure Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="custom-button"
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{loading ? 'Measuring Quantum State...' : 'Measure Quantum Stream'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Output Stream Section */}
      {generatedData && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Quantum Measurement Output ({generatedData.num_bits.toLocaleString()} bits)
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Model: <strong>{generatedData.model}</strong>
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
            color: '#c084fc',
            wordBreak: 'break-all',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {bitPreview}
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
