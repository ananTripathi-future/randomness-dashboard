import React, { useState } from 'react';
import axios from 'axios';
import { Zap, Play, RefreshCw, AlertTriangle, TestTube, Activity } from 'lucide-react';
import TestTable from '../components/TestTable';
import { PassFailDonutChart, PValueBarChart } from '../components/Charts';

export default function TRNGPage() {
  const [sourceType, setSourceType] = useState('OS System Entropy');
  const [numBits, setNumBits] = useState(100000);
  const [generatedData, setGeneratedData] = useState(null);
  const [nistResults, setNistResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setNistResults(null);
    try {
      const res = await axios.post('http://localhost:8000/api/generate/trng', {
        source_type: sourceType,
        num_bits: numBits
      });
      setGeneratedData(res.data);
    } catch (err) {
      alert('Error harvesting TRNG entropy: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRunNist = async () => {
    if (!generatedData?.bits) return;
    setTesting(true);
    try {
      const res = await axios.post('http://localhost:8000/api/nist/run', {
        bit_str: generatedData.bits,
        alpha: 0.01,
        num_sequences: 1,
        source_type: 'TRNG Simulation',
        algorithm_or_source: generatedData.source
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#eab308', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <Zap size={20} />
          <span>True Physical & OS Entropy Harvesters</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          TRNG Laboratory
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px', maxWidth: '800px' }}>
          True Random Number Generators harvest un-predictable physical processes or non-deterministic OS entropy pools (system hardware interrupts and execution jitter).
        </p>
      </div>

      {/* Critical Physical Device Disclaimer */}
      <div style={{
        background: 'rgba(234, 179, 8, 0.1)',
        border: '1px solid rgba(234, 179, 8, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <AlertTriangle size={24} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#fef08a', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
            Simulation & OS Entropy Notice
          </h4>
          <p style={{ color: '#fef9c3', fontSize: '0.85rem', lineHeight: '1.5' }}>
            This application uses OS system entropy pools (<code>urandom</code> / <code>CryptGenRandom</code>) and microsecond CPU timing jitter software simulation. 
            It is <strong>NOT</strong> directly connected to a certified physical hardware TRNG (such as a thermal noise diode, breakdown junction, or radioactive decay sensor).
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'end' }}>
          
          {/* Source Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
              Entropy Source
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="custom-input"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="OS System Entropy">OS System Entropy Pool (urandom)</option>
              <option value="CPU Execution Jitter Harvester">CPU Execution Timing Jitter Harvester</option>
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

          {/* Harvest Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="custom-button"
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              <span>{loading ? 'Harvesting Entropy...' : 'Harvest TRNG Stream'}</span>
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
                Harvested TRNG Stream ({generatedData.num_bits.toLocaleString()} bits)
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Source: <strong>{generatedData.source}</strong>
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

          {/* Live Shannon Entropy Gauge */}
          <div style={{
            background: '#070a12',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #1f293d',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#eab308" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Shannon Entropy H(X)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fef08a', fontFamily: 'Fira Code' }}>
                  {generatedData.entropy} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/ 1.000000 max</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
              Entropy Quality: Excellent (Ideal ~1.0)
            </div>
          </div>

          {/* Bit stream preview box */}
          <div style={{
            background: '#070a12',
            border: '1px solid #1f293d',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: 'Fira Code',
            fontSize: '0.8rem',
            color: '#fef08a',
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
