import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TestTube, Upload, Play, RefreshCw, FileText, CheckCircle, ShieldAlert, Cpu, CheckSquare, Square, Layers, Info } from 'lucide-react';
import TestTable from '../components/TestTable';
import { PassFailDonutChart, PValueBarChart } from '../components/Charts';

import { API_BASE_URL } from '../apiConfig';

const ALL_NIST_TEST_NAMES = [
  "Frequency (Monobit)",
  "Block Frequency",
  "Cumulative Sums (Forward)",
  "Cumulative Sums (Reverse)",
  "Runs",
  "Longest Run of Ones",
  "Binary Matrix Rank",
  "Discrete Fourier Transform (FFT)",
  "Approximate Entropy",
  "Serial (Test 1)",
  "Serial (Test 2)",
  "Linear Complexity"
];

export default function NISTTests() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [manualBits, setManualBits] = useState('');
  
  // Requirement Configurations
  const [alpha, setAlpha] = useState(0.01);
  const [numSequences, setNumSequences] = useState(1);
  const [preset, setPreset] = useState('all'); // 'all' | 'core' | 'spectral' | 'custom'
  const [selectedTests, setSelectedTests] = useState([...ALL_NIST_TEST_NAMES]);
  
  const [loading, setLoading] = useState(false);
  const [nistResults, setNistResults] = useState(null);

  // Handle Preset changes
  const handlePresetChange = (p) => {
    setPreset(p);
    if (p === 'all') {
      setSelectedTests([...ALL_NIST_TEST_NAMES]);
    } else if (p === 'core') {
      setSelectedTests([
        "Frequency (Monobit)",
        "Block Frequency",
        "Cumulative Sums (Forward)",
        "Runs",
        "Longest Run of Ones"
      ]);
    } else if (p === 'spectral') {
      setSelectedTests([
        "Binary Matrix Rank",
        "Discrete Fourier Transform (FFT)",
        "Approximate Entropy",
        "Linear Complexity"
      ]);
    }
  };

  const toggleTest = (testName) => {
    setPreset('custom');
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  // Read .txt file live for preview & bit counting
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result || '';
        const cleanBits = text.replace(/[^01]/g, '');
        const ones = (cleanBits.match(/1/g) || []).length;
        const zeros = cleanBits.length - ones;
        
        setFileStats({
          fileName: selectedFile.name,
          fileSizeKB: (selectedFile.size / 1024).toFixed(1),
          totalChars: text.length,
          extractedBitsCount: cleanBits.length,
          onesCount: ones,
          zerosCount: zeros,
          onesRatio: cleanBits.length > 0 ? (ones / cleanBits.length * 100).toFixed(2) : 0,
          previewText: text.substring(0, 450) + (text.length > 450 ? '...' : '')
        });
      };
      
      reader.readAsText(selectedFile);
    }
  };

  const handleRunSuite = async () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one NIST test to execute!');
      return;
    }

    setLoading(true);
    setNistResults(null);

    try {
      if (activeTab === 'upload') {
        if (!file) {
          alert('Please select a .txt or .bin file first.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alpha', alpha);
        formData.append('num_sequences', numSequences);
        formData.append('selected_tests_json', JSON.stringify(selectedTests));

        const res = await axios.post(`${API_BASE_URL}/api/nist/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNistResults(res.data);
      } else {
        if (!manualBits.trim()) {
          alert('Please enter a binary bit string');
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_BASE_URL}/api/nist/run`, {
          bit_str: manualBits,
          alpha: Number(alpha),
          num_sequences: Number(numSequences),
          source_type: 'Manual Bit Stream',
          algorithm_or_source: 'User Custom Bitstream',
          selected_tests: selectedTests
        });
        setNistResults(res.data);
      }
    } catch (err) {
      alert('NIST Test Execution Failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          <TestTube size={20} />
          <span>Requirement-Based File Testing</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
          NIST Statistical Test Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px', maxWidth: '850px' }}>
          Upload your <code>.txt</code> file containing bit sequences. Configure your target test suite requirements, sequence parameters, and significance level (α = 0.01) to perform analysis.
        </p>
      </div>

      {/* Inputs & Parameters Panel */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
        
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              background: activeTab === 'upload' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: activeTab === 'upload' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
              color: activeTab === 'upload' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Upload size={16} />
            <span>Upload .txt File</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            style={{
              background: activeTab === 'manual' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: activeTab === 'manual' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
              color: activeTab === 'manual' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileText size={16} />
            <span>Manual Bit String Input</span>
          </button>
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '28px' }}>
          {activeTab === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                border: '2px dashed rgba(56, 189, 248, 0.35)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                background: 'rgba(9, 13, 22, 0.5)'
              }}>
                <Upload size={36} color="#38bdf8" style={{ marginBottom: '12px' }} />
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem' }}>
                  {file ? file.name : 'Choose or Drag & Drop a .txt File'}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                  Accepted format: <code>.txt</code>, <code>.bin</code>, <code>.dat</code> containing ASCII bit streams ('0' and '1')
                </div>
                <input
                  type="file"
                  accept=".txt,.bin,.dat"
                  onChange={handleFileUpload}
                  style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.85rem' }}
                />
              </div>

              {/* File Live Stats & Content Preview */}
              {fileStats && (
                <div style={{
                  background: '#070a12',
                  border: '1px solid #1f293d',
                  borderRadius: '10px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>File Name</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{fileStats.fileName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Extracted Bit Count</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'Fira Code' }}>
                        {fileStats.extractedBitsCount.toLocaleString()} bits
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>1s / 0s Distribution</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a78bfa', fontFamily: 'Fira Code' }}>
                        1s: {fileStats.onesRatio}% | 0s: {(100 - fileStats.onesRatio).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>File Content Preview:</div>
                  <div style={{
                    background: '#04070d',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontFamily: 'Fira Code',
                    fontSize: '0.78rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    maxHeight: '80px',
                    overflowY: 'auto'
                  }}>
                    {fileStats.previewText}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Binary Bit Sequence ('0' and '1')
              </label>
              <textarea
                rows={4}
                value={manualBits}
                onChange={(e) => setManualBits(e.target.value)}
                placeholder="101011001101010111000101..."
                className="custom-input"
                style={{ width: '100%', fontFamily: 'Fira Code', fontSize: '0.85rem' }}
              />
            </div>
          )}
        </div>

        {/* Requirements Configuration Section */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#38bdf8" />
            <span>Test Requirements & Suite Configurations</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Preset Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Test Requirement Preset
              </label>
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="custom-input"
                style={{ width: '100%' }}
              >
                <option value="all">Full Suite (All 15 NIST Tests)</option>
                <option value="core">Core Frequency & Runs Suite</option>
                <option value="spectral">Spectral & Complexity Suite</option>
                <option value="custom">Custom Test Selection</option>
              </select>
            </div>

            {/* Significance level */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Significance Level (α)
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="custom-input"
                style={{ width: '100%' }}
              >
                <option value={0.01}>α = 0.01 (Standard 99% Confidence)</option>
                <option value={0.001}>α = 0.001 (Strict 99.9% Confidence)</option>
                <option value={0.05}>α = 0.05 (Relaxed 95% Confidence)</option>
              </select>
            </div>

            {/* Sub-sequence count */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Sub-Sequences (s)
              </label>
              <select
                value={numSequences}
                onChange={(e) => setNumSequences(Number(e.target.value))}
                className="custom-input"
                style={{ width: '100%' }}
              >
                <option value={1}>s = 1 sequence (Single Stream)</option>
                <option value={10}>s = 10 sequences (Uniformity Test)</option>
                <option value={50}>s = 50 sequences (NIST Standard)</option>
                <option value={100}>s = 100 sequences (Full Standard)</option>
              </select>
            </div>
          </div>

          {/* Test Checkboxes List */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '10px' }}>
              Selected Statistical Tests ({selectedTests.length} of {ALL_NIST_TEST_NAMES.length}):
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
              background: '#070a12',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #1f293d'
            }}>
              {ALL_NIST_TEST_NAMES.map((tName) => {
                const isChecked = selectedTests.includes(tName);
                return (
                  <div
                    key={tName}
                    onClick={() => toggleTest(tName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: isChecked ? '#f8fafc' : '#64748b',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {isChecked ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color="#475569" />}
                    <span>{tName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Execution Button */}
        <div>
          <button
            onClick={handleRunSuite}
            disabled={loading}
            className="custom-button"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
            <span>{loading ? 'Evaluating Selected NIST Tests...' : `Execute Analysis on Selected Tests (${selectedTests.length})`}</span>
          </button>
        </div>

      </div>

      {/* Results Section */}
      {nistResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Execution Engine Notice */}
          <div style={{
            background: nistResults.execution_mode === 'NIST_STS_C_REFERENCE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
            border: nistResults.execution_mode === 'NIST_STS_C_REFERENCE' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Cpu size={22} color={nistResults.execution_mode === 'NIST_STS_C_REFERENCE' ? '#34d399' : '#60a5fa'} />
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                  Execution Engine Mode: {nistResults.execution_mode}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {nistResults.reference_notice}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Sequences Tested: <strong>s = {nistResults.num_sequences || 1}</strong> | Length: <strong>{nistResults.sequence_length?.toLocaleString()} bits</strong>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Selected Tests Run</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{nistResults.total_tests}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Passed Tests</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{nistResults.passed}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Failed Tests</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>{nistResults.failed}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Overall Pass Rate</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: nistResults.pass_rate >= 90 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                {nistResults.pass_rate}%
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Pass Rate Donut Chart
              </h4>
              <PassFailDonutChart passed={nistResults.passed} failed={nistResults.failed} passRate={nistResults.pass_rate} />
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                P-value Scatter Graph (Threshold α = {alpha})
              </h4>
              <PValueBarChart tests={nistResults.tests} alpha={alpha} />
            </div>
          </div>

          {/* Table */}
          <TestTable tests={nistResults.tests} alpha={alpha} />

        </div>
      )}

    </div>
  );
}
