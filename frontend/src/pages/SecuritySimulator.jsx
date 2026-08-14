import React, { useState } from 'react';
import axios from 'axios';
import { 
  Building2, Shield, Lock, Cpu, Play, RefreshCw, Key, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Radio, Send, Database, BarChart2 
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SecuritySimulator() {
  const [activeTab, setActiveTab] = useState('banking'); // 'banking' | 'defence' | 'batch' | 'matrix'

  // Banking State
  const [bankingSource, setBankingSource] = useState('ChaCha20');
  const [bankingTx, setBankingTx] = useState(null);
  const [bankingLoading, setBankingLoading] = useState(false);

  // Defence State
  const [defenceSource, setDefenceSource] = useState('ChaCha20');
  const [defenceCmd, setDefenceCmd] = useState(null);
  const [defenceLoading, setDefenceLoading] = useState(false);

  // Batch Experiment State
  const [batchSource, setBatchSource] = useState('ChaCha20');
  const [batchCount, setBatchCount] = useState(100000);
  const [batchRes, setBatchRes] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Handle Banking OTP Generation
  const handleBankingTx = async () => {
    setBankingLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulator/banking_tx`, {
        account_name: "ANANT",
        recipient_account: "XYZ-987",
        amount: 5000.0,
        source: bankingSource
      });
      setBankingTx(res.data);
    } catch (err) {
      alert('Banking Tx Error: ' + err.message);
    } finally {
      setBankingLoading(false);
    }
  };

  // Handle Defence Encryption
  const handleDefenceCmd = async () => {
    setDefenceLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulator/defence_cmd`, {
        sender: "COMMAND",
        receiver: "DRONE-07",
        message: "MOVE TO SECTOR B",
        source: defenceSource
      });
      setDefenceCmd(res.data);
    } catch (err) {
      alert('Defence Cmd Error: ' + err.message);
    } finally {
      setDefenceLoading(false);
    }
  };

  // Handle Controlled Batch Analysis (100,000 OTPs)
  const handleRunBatch = async () => {
    setBatchLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulator/otp_analysis`, {
        source: batchSource,
        count: Number(batchCount),
        seed: 42
      });
      setBatchRes(res.data);
    } catch (err) {
      alert('Batch Analysis Error: ' + err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  // Digit distribution chart data formatter
  const chartData = batchRes ? Object.entries(batchRes.digit_distribution).map(([digit, info]) => ({
    digit: `Digit ${digit}`,
    count: info.count,
    percentage: info.percentage
  })) : [];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <Shield size={20} />
          <span>3-LAYER RANDOMNESS EVALUATION LABORATORY</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Banking & Defence Security Simulator
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '8px', maxWidth: '900px', lineHeight: 1.6 }}>
          Evaluates randomness sources across 3 evaluation layers: <strong>Layer 1 (NIST SP 800-22 Statistical Tests)</strong>, <strong>Layer 2 (Cryptographic OTP & Nonce Collision Properties)</strong>, and <strong>Layer 3 (Application Security & Predictability under Attack)</strong>.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('banking')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'banking' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#0f172a',
            color: activeTab === 'banking' ? '#ffffff' : '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={18} />
          <span>1. Banking Security Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('defence')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'defence' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#0f172a',
            color: activeTab === 'defence' ? '#ffffff' : '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Shield size={18} />
          <span>2. Defence Command Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'batch' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#0f172a',
            color: activeTab === 'batch' ? '#ffffff' : '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BarChart2 size={18} />
          <span>3. 100k Controlled OTP Batch</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'matrix' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#0f172a',
            color: activeTab === 'matrix' ? '#ffffff' : '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Database size={18} />
          <span>4. 3-Layer Comparison Matrix</span>
        </button>
      </div>

      {/* TAB 1: BANKING SIMULATOR */}
      {activeTab === 'banking' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          
          {/* Banking Sandbox Form */}
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px' }}>
              <Building2 size={22} />
              <span>BANKING SECURITY LAB</span>
            </div>

            <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Account Holder</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>ANANT</div>
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>Balance: ₹1,00,000</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>Transaction Details:</div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#f8fafc' }}>
                ₹5,000 → Recipient Account <strong>XYZ-987</strong>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '10px' }}>
                Select Randomness Source:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['ChaCha20', 'PCG32', 'MT19937', 'TRNG', 'QRNG'].map(src => (
                  <label key={src} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: bankingSource === src ? '#38bdf8' : '#94a3b8' }}>
                    <input
                      type="radio"
                      name="bankingSource"
                      value={src}
                      checked={bankingSource === src}
                      onChange={(e) => setBankingSource(e.target.value)}
                    />
                    <span>{src} {src === 'ChaCha20' ? '(CSPRNG)' : src === 'MT19937' ? '(Insecure LCG)' : ''}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleBankingTx}
              disabled={bankingLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {bankingLoading ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
              <span>{bankingLoading ? 'Generating OTP...' : 'Generate Transaction OTP'}</span>
            </button>
          </div>

          {/* Banking Output Sandbox Display */}
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} color="#f59e0b" />
                <span>Generated Sandbox OTP & Session Tokens</span>
              </div>

              {bankingTx ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#070a12', padding: '16px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Transaction OTP (6-Digit)</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Fira Code', letterSpacing: '4px', marginTop: '4px' }}>
                      {bankingTx.otp}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Sandbox OTP generated via {bankingTx.source}</div>
                  </div>

                  <div style={{ background: '#070a12', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Session ID</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'Fira Code', marginTop: '2px' }}>
                      {bankingTx.session_id}
                    </div>
                  </div>

                  <div style={{ background: '#070a12', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Transaction Nonce</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa', fontFamily: 'Fira Code', marginTop: '2px' }}>
                      {bankingTx.transaction_nonce}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  Select a randomness source and click "Generate Transaction OTP" to simulate banking authentication.
                </div>
              )}
            </div>

            {/* Cryptographic Security Warning */}
            {bankingTx && (
              <div style={{
                background: (bankingTx.source.includes('ChaCha') || bankingTx.source.includes('TRNG') || bankingTx.source.includes('QRNG')) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: (bankingTx.source.includes('ChaCha') || bankingTx.source.includes('TRNG') || bankingTx.source.includes('QRNG')) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                padding: '16px',
                borderRadius: '10px',
                marginTop: '20px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: (bankingTx.source.includes('ChaCha') || bankingTx.source.includes('TRNG') || bankingTx.source.includes('QRNG')) ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(bankingTx.source.includes('ChaCha') || bankingTx.source.includes('TRNG') || bankingTx.source.includes('QRNG')) ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span>Security Analysis: {bankingTx.source}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.5 }}>
                  {bankingTx.source === 'ChaCha20' 
                    ? '✔ ChaCha20 CSPRNG is cryptographically secure. Knowing previous OTPs gives an attacker zero probability of predicting the next OTP.'
                    : bankingTx.source === 'MT19937'
                    ? '⚠️ CRITICAL VULNERABILITY: MT19937 passes NIST SP 800-22 statistical tests, BUT is non-cryptographic. An attacker observing 624 outputs can predict 100% of future banking OTPs!'
                    : bankingTx.source === 'PCG32'
                    ? '⚠️ VULNERABILITY: PCG32 is a linear generator. Observing 3 outputs allows state recovery and OTP prediction!'
                    : '✔ Non-deterministic entropy source.'}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: DEFENCE SIMULATOR */}
      {activeTab === 'defence' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          
          {/* Terminal Command Channel */}
          <div style={{
            background: '#090d16',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 0 25px rgba(2, 132, 199, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px' }}>
              <Radio size={22} color="#38bdf8" />
              <span>SECURE DEFENCE COMMAND CHANNEL</span>
            </div>

            <div style={{ fontFamily: 'Fira Code', fontSize: '0.85rem', color: '#cbd5e1', background: '#04070d', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b' }}>[ CHANNEL: CLASSIFIED TACTICAL ]</div>
              <div style={{ marginTop: '8px' }}>Sender: <span style={{ color: '#38bdf8' }}>COMMAND</span></div>
              <div>Receiver: <span style={{ color: '#34d399' }}>DRONE-07</span></div>
              <div style={{ marginTop: '8px' }}>Payload: <span style={{ color: '#f59e0b' }}>MOVE TO SECTOR B</span></div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '10px' }}>
                Select Entropy Engine for Key/Nonce Generation:
              </label>
              <select
                value={defenceSource}
                onChange={(e) => setDefenceSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#070a12',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              >
                <option value="ChaCha20">ChaCha20-based CSPRNG (NIST SP 800-90A DRBG)</option>
                <option value="QRNG">Physical QRNG / Quantum Optical Beam Splitter</option>
                <option value="TRNG">OS System Entropy / Hardware Jitter</option>
                <option value="PCG32">PCG32 (Insecure for Nonces)</option>
                <option value="MT19937">Mersenne Twister (Insecure for Nonces)</option>
              </select>
            </div>

            <button
              onClick={handleDefenceCmd}
              disabled={defenceLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {defenceLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              <span>{defenceLoading ? 'Encrypting Payload...' : 'Encrypt & Transmit Tactical Command'}</span>
            </button>
          </div>

          {/* Defence Output Display */}
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="#34d399" />
                <span>AES-256 GCM Cryptographic Nonce & Key Payload</span>
              </div>

              {defenceCmd ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#070a12', padding: '14px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>128-bit Session Key</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', fontFamily: 'Fira Code', marginTop: '2px' }}>
                      {defenceCmd.session_key}
                    </div>
                  </div>

                  <div style={{ background: '#070a12', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>96-bit AES-GCM Nonce</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'Fira Code', marginTop: '2px' }}>
                      {defenceCmd.gcm_nonce}
                    </div>
                  </div>

                  <div style={{ background: '#070a12', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Encrypted Ciphertext Payload</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'Fira Code', marginTop: '2px', wordBreak: 'break-all' }}>
                      {defenceCmd.encrypted_payload}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  Select an entropy engine and click "Encrypt & Transmit Tactical Command" to simulate defence payload encryption.
                </div>
              )}
            </div>

            {/* NIST SP 800-90 Framework Clarification */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '16px',
              borderRadius: '10px',
              marginTop: '20px'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} />
                <span>NIST SP 800-90A/B/C Framework Architecture</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.5 }}>
                NIST separates random bit generation into:
                <br />• <strong>SP 800-90A</strong>: Deterministic Random Bit Generators (DRBG mechanisms like ChaCha20).
                <br />• <strong>SP 800-90B</strong>: Physical / Hardware Entropy Sources (QRNG optical benches).
                <br />• <strong>SP 800-90C</strong>: Constructions combining entropy sources + DRBG mechanisms.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: CONTROLLED BATCH EXPERIMENT (100,000 OTPs) */}
      {activeTab === 'batch' && (
        <div>
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px' }}>
              <BarChart2 size={22} />
              <span>Controlled 100,000 OTP Statistical & Collision Experiment</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                  Select Generator to Test:
                </label>
                <select
                  value={batchSource}
                  onChange={(e) => setBatchSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#070a12',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="ChaCha20">ChaCha20 (CSPRNG)</option>
                  <option value="PCG32">PCG32 (Insecure LCG)</option>
                  <option value="MT19937">Mersenne Twister (Insecure LCG)</option>
                  <option value="TRNG">TRNG (OS System Entropy)</option>
                  <option value="QRNG">QRNG (Quantum Optical Simulator)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                  Sample Count (OTPs):
                </label>
                <input
                  type="number"
                  value={batchCount}
                  onChange={(e) => setBatchCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#070a12',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleRunBatch}
              disabled={batchLoading}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {batchLoading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              <span>{batchLoading ? 'Generating & Analyzing 100k OTPs...' : `Execute Controlled ${Number(batchCount).toLocaleString()} OTP Experiment`}</span>
            </button>
          </div>

          {/* Batch Experiment Results */}
          {batchRes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sample Size</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{batchRes.sample_count.toLocaleString()} OTPs</div>
                </div>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Observed Collisions</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{batchRes.collision_count}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Expected theoretical: {batchRes.expected_collisions_theoretical}</div>
                </div>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Collision Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{batchRes.collision_rate_pct}%</div>
                </div>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Attacker Predictability</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: batchRes.is_predictable_by_attacker ? '#f87171' : '#34d399', marginTop: '8px' }}>
                    {batchRes.is_predictable_by_attacker ? '⚠️ HIGHLY PREDICTABLE' : '✔ UN-PREDICTABLE'}
                  </div>
                </div>
              </div>

              {/* Digit Distribution Chart */}
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                  Digit Distribution (0–9) across {batchRes.sample_count.toLocaleString()} OTPs (600,000 Total Digits)
                </h4>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="digit" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#090d16', border: '1px solid #334155', color: '#fff' }} />
                      <Bar dataKey="percentage" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Observed %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 4: 3-LAYER COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div style={{ background: '#0f172a', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
            Comprehensive 3-Layer Evaluation Matrix
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '850px' }}>
            Compares statistical randomness, cryptographic behavior, and application security across PCG32, MT19937, ChaCha20 CSPRNG, TRNG, and QRNG.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#070a12', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Randomness Source</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Layer 1: NIST SP 800-22</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Layer 2: OTP & Collision Rate</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Layer 3: Cryptographic Predictability</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Overall Verdict</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f8fafc' }}>PCG32 (LCG)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399' }}>PASS (15/15)</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>Uniform (~0.49% Collisions)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>⚠️ Predictable (Linear State)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#f87171', fontWeight: 800 }}>❌ INSECURE FOR CRYPTO</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f8fafc' }}>MT19937 (Mersenne)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399' }}>PASS (15/15)</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>Uniform (~0.49% Collisions)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>⚠️ Predictable (624 Output Crack)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#f87171', fontWeight: 800 }}>❌ INSECURE FOR CRYPTO</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#34d399' }}>ChaCha20 (CSPRNG)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399' }}>PASS (15/15)</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>Uniform (~0.49% Collisions)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>✔ Un-predictable (2^256 Security)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399', fontWeight: 800 }}>✅ CRYPTOGRAPHICALLY SECURE</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f8fafc' }}>TRNG (Hardware Jitter)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399' }}>PASS (14-15/15)</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>Uniform (~0.49% Collisions)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>✔ Non-deterministic Physical</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#38bdf8', fontWeight: 800 }}>✅ HIGH-ENTROPY SOURCE</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f8fafc' }}>QRNG (Quantum Optical)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#38bdf8' }}>PASS (Depends on calibration)</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>Uniform (~0.49% Collisions)</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>✔ Non-deterministic Quantum</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#a78bfa', fontWeight: 800 }}>✅ QUANTUM ENTROPY SOURCE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
