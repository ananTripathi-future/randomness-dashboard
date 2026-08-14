import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TestTube, Upload, Play, RefreshCw, FileText, CheckCircle, ShieldAlert, XCircle, Cpu, CheckSquare, Square, Layers, Info, Download } from 'lucide-react';
import TestTable from '../components/TestTable';
import { PassFailDonutChart, PValueBarChart } from '../components/Charts';

import { API_BASE_URL } from '../apiConfig';
import { runFullNISTJS } from '../utils/nistEngineJS';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ALL_NIST_TEST_NAMES = [
  "Frequency (Monobit)",
  "Block Frequency",
  "Cumulative Sums (Forward)",
  "Cumulative Sums (Reverse)",
  "Runs",
  "Longest Run of Ones",
  "Binary Matrix Rank",
  "Discrete Fourier Transform (FFT)",
  "Non-Overlapping Template Matching",
  "Overlapping Template Matching",
  "Maurer's Universal Statistical",
  "Approximate Entropy",
  "Random Excursions",
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

  const handleDownloadPDF = () => {
    if (!nistResults) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const dateStr = new Date().toLocaleString();

    // Header Banner
    doc.setFillColor(2, 132, 199);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text("NIST SP 800-22 REV 1A EVALUATION REPORT", 105, 12, { align: "center" });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${dateStr} | Mode: ${nistResults.execution_mode}`, 105, 18, { align: "center" });

    // Metadata Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Evaluation Parameters:", 14, 32);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Sequence Length (n): ${nistResults.sequence_length?.toLocaleString() || 0} bits`, 14, 38);
    doc.text(`• Sub-Sequences (s): ${nistResults.num_sequences || 1}`, 14, 43);
    doc.text(`• Significance Level (alpha): ${alpha}`, 120, 38);
    doc.text(`• Target Source: ${nistResults.tests?.[0]?.description || 'Uploaded Bitstream'}`, 120, 43);

    // KPI Summary Boxes
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 42, 18, 2, 2, 'F');
    doc.roundedRect(61, 48, 42, 18, 2, 2, 'F');
    doc.roundedRect(108, 48, 42, 18, 2, 2, 'F');
    doc.roundedRect(155, 48, 41, 18, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL TESTS", 35, 53, { align: "center" });
    doc.text("PASSED", 82, 53, { align: "center" });
    doc.text("FAILED", 129, 53, { align: "center" });
    doc.text("PASS RATE", 175, 53, { align: "center" });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${nistResults.total_tests}`, 35, 61, { align: "center" });
    doc.setTextColor(5, 150, 105);
    doc.text(`${nistResults.passed}`, 82, 61, { align: "center" });
    doc.setTextColor(220, 38, 38);
    doc.text(`${nistResults.failed}`, 129, 61, { align: "center" });
    doc.setTextColor(nistResults.pass_rate >= 90 ? 5 : 220, nistResults.pass_rate >= 90 ? 150 : 38, nistResults.pass_rate >= 90 ? 105 : 38);
    doc.text(`${nistResults.pass_rate}%`, 175, 61, { align: "center" });

    // Test Results Table
    const tableData = nistResults.tests.map((t, idx) => [
      idx + 1,
      t.name,
      t.p_value,
      t.p_uniformity !== undefined ? t.p_uniformity : '-',
      t.status
    ]);

    autoTable(doc, {
      startY: 71,
      head: [['#', 'NIST Statistical Test Name', 'P-Value', 'P-Uniformity', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 30, font: 'courier' },
        3: { halign: 'center', cellWidth: 32, font: 'courier' },
        4: { halign: 'center', cellWidth: 28, fontStyle: 'bold' }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'PASS') {
            data.cell.styles.textColor = [5, 150, 105];
          } else if (data.cell.raw === 'FAIL') {
            data.cell.styles.textColor = [220, 38, 38];
          } else {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      }
    });

    // Automated Failure Diagnosis Section
    let finalY = doc.lastAutoTable.finalY + 10;

    if (nistResults.failed > 0) {
      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`Automated Failure Diagnosis (${nistResults.failed} Failed Tests):`, 14, finalY);

      finalY += 6;
      nistResults.tests.filter(t => t.status === 'FAIL').forEach((t) => {
        if (finalY > 265) {
          doc.addPage();
          finalY = 20;
        }
        const info = getFailureExplanation(t.name, t.p_value, alpha);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text(`• ${t.name} (P-value: ${t.p_value})`, 14, finalY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const whyLines = doc.splitTextToSize(`Why it failed: ${info.why}`, 175);
        doc.text(whyLines, 18, finalY + 4);
        finalY += 4 + whyLines.length * 4;

        doc.setTextColor(3, 105, 161);
        const fixLines = doc.splitTextToSize(`Fix / Action: ${info.remediation}`, 175);
        doc.text(fixLines, 18, finalY);
        finalY += fixLines.length * 4 + 4;
      });
    } else {
      if (finalY > 260) {
        doc.addPage();
        finalY = 20;
      }
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(14, finalY, 182, 14, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 95, 70);
      doc.text("VERDICT: 100% PASS - Bit sequence distribution adheres to NIST SP 800-22 uniform randomness.", 18, finalY + 9);
    }

    // Trigger Direct Save PDF Download
    doc.save('NIST_SP800_22_Evaluation_Report.pdf');
  };

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
        let cleanBits = text.replace(/[^01]/g, '');
        
        if (cleanBits.length < 100 && selectedFile.size > 0) {
          const bufferReader = new FileReader();
          bufferReader.onload = (bufEvent) => {
            const bytes = new Uint8Array(bufEvent.target.result);
            let binStr = '';
            for (let i = 0; i < bytes.length; i++) {
              binStr += bytes[i].toString(2).padStart(8, '0');
            }
            const ones = (binStr.match(/1/g) || []).length;
            const zeros = binStr.length - ones;
            setFileStats({
              fileName: selectedFile.name,
              fileSizeKB: (selectedFile.size / 1024).toFixed(1),
              totalChars: selectedFile.size,
              extractedBitsCount: binStr.length,
              onesCount: ones,
              zerosCount: zeros,
              onesRatio: binStr.length > 0 ? (ones / binStr.length * 100).toFixed(2) : 0,
              previewText: binStr.substring(0, 450) + (binStr.length > 450 ? '...' : ''),
              fullBits: binStr
            });
          };
          bufferReader.readAsArrayBuffer(selectedFile);
          return;
        }

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
          previewText: cleanBits.substring(0, 450) + (cleanBits.length > 450 ? '...' : ''),
          fullBits: cleanBits
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
      console.warn("Backend API unavailable, executing client-side JS NIST engine fallback:", err.message);
      let bitsToTest = manualBits.replace(/[^01]/g, '');
      if (activeTab === 'upload' && fileStats && fileStats.fullBits) {
        bitsToTest = fileStats.fullBits;
      }
      if (bitsToTest.length >= 10) {
        const jsRes = runFullNISTJS(bitsToTest, Number(alpha), selectedTests, Number(numSequences));
        setNistResults(jsRes);
      } else {
        alert('NIST Test Execution Failed: ' + (err.response?.data?.detail || err.message));
      }
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
          
          {/* Scientific Disclaimer & Cryptographic Distinctions Banner */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
              <Info size={20} />
              <span>Scientific Distinction: Statistical Randomness Testing vs. Cryptographic Security</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ background: '#070a12', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>📊 1. Statistical Randomness Testing (NIST SP 800-22)</strong>
                Evaluates whether this finite bit sequence exhibits statistical properties consistent with the null hypothesis ($H_0$) of a uniform, independent Bernoulli process ($p=0.5$).
              </div>
              <div style={{ background: '#070a12', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>🔐 2. Cryptographic Security & QRNG Physical Context</strong>
                Passing NIST tests does <strong>NOT</strong> prove a generator is cryptographically secure. Likewise, a NIST failure on a QRNG does <strong>NOT</strong> automatically prove it is insecure or non-quantum (detector noise, dead-time, or uncalibrated optics can skew statistics without compromising quantum origin).
              </div>
            </div>
          </div>

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Sequences Tested: <strong>s = {nistResults.num_sequences || 1}</strong> | Length: <strong>{nistResults.sequence_length?.toLocaleString()} bits</strong>
              </div>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Download size={16} />
                <span>Download PDF Report</span>
              </button>
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

          {/* Automated File Failure Diagnosis & Executive Summary */}
          <div style={{
            background: nistResults.failed > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            borderRadius: '16px',
            border: nistResults.failed > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            padding: '28px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {nistResults.failed > 0 ? (
                <ShieldAlert size={28} color="#f87171" />
              ) : (
                <CheckCircle size={28} color="#34d399" />
              )}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {nistResults.failed > 0 
                    ? `File Failure Diagnosis Summary (${nistResults.failed} Test Case${nistResults.failed > 1 ? 's' : ''} Failed)`
                    : 'File Evaluation Summary: 100% Passed All Evaluated Tests!'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                  {nistResults.failed > 0 
                    ? `Specific statistical defects were detected in your uploaded file at significance level α = ${alpha}. Review the detailed diagnostic breakdown below.`
                    : `The tested sequence bit distribution in your file shows no statistically significant evidence against the NIST SP 800-22 null hypothesis (α = ${alpha}).`}
                </div>
              </div>
            </div>

            {/* List of Failed Test Cases with Specific Explanations */}
            {nistResults.failed > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fca5a5' }}>
                  Why Particular Test Cases Failed on Your File:
                </div>
                {nistResults.tests.filter(t => t.status === 'FAIL').map((t, idx) => {
                  const info = getFailureExplanation(t.name, t.p_value, alpha);
                  return (
                    <div key={idx} style={{
                      background: '#090d16',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid rgba(239, 68, 68, 0.25)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <XCircle size={18} color="#f87171" />
                          <span>{t.name}</span>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          P-value: {t.p_value} (Threshold α = {alpha})
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.5 }}>
                        <strong style={{ color: '#fb7185' }}>Why this test failed on your file:</strong> {info.why}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        <strong style={{ color: '#38bdf8' }}>Recommended Fix / Action:</strong> {info.remediation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

function getFailureExplanation(testName, pValue, alpha) {
  const map = {
    "Frequency (Monobit)": {
      why: "The total count of 1s and 0s in your uploaded file is significantly imbalanced. A P-value below α indicates extreme bit bias.",
      remediation: "Apply von Neumann unbiasing or SHA-256 / HKDF randomness extraction to eliminate physical bit bias."
    },
    "Block Frequency": {
      why: "While the overall 0/1 ratio might look balanced, localized M-bit sub-blocks in your file contain spatial clusters of 0s or 1s.",
      remediation: "Check for localized memory drift, burst noise in physical sensors, or thermal fluctuations in hardware."
    },
    "Cumulative Sums (Forward)": {
      why: "The cumulative sum random walk created by your file's bits drifts continuously upwards or downwards beyond standard Wiener process bounds.",
      remediation: "Eliminate directional offset drift or asymmetric single-photon detector counts."
    },
    "Cumulative Sums (Reverse)": {
      why: "The reverse cumulative sum random walk exceeds standard excursion boundaries.",
      remediation: "Check for directional asymmetry in bit stream construction from right to left."
    },
    "Runs": {
      why: "The rate of transitions between 0s and 1s (V_obs) occurs too rapidly (e.g. 010101...) or too slowly (e.g. long streaks).",
      remediation: "Check for high-frequency clock crosstalk, artificial alternating patterns, or low oscillator phase jitter."
    },
    "Longest Run of Ones": {
      why: "The maximum streak of consecutive 1s within M-bit blocks deviates significantly from theoretical probability distributions.",
      remediation: "Check for photodiode afterpulsing, latching hardware faults, or long memory retention in shift registers."
    },
    "Binary Matrix Rank": {
      why: "Linear dependencies exist among 32x32 binary matrices formed by your file's sub-words over GF(2).",
      remediation: "Avoid short-period Linear Feedback Shift Registers (LFSR) or repetitive word patterns."
    },
    "Discrete Fourier Transform (FFT)": {
      why: "Your bit stream contains periodic features or repetitive spectral peaks that exceed white noise threshold d.",
      remediation: "Eliminate power line clock leakage (50/60Hz), periodic algorithmic loops, or unshielded RF interference."
    },
    "Non-Overlapping Template Matching": {
      why: "Target non-periodic m-bit patterns (m=9) occur too frequently or too rarely compared to Poisson expectations.",
      remediation: "Fix fixed-word state encoding bias or structured dictionary lookup tables."
    },
    "Overlapping Template Matching": {
      why: "Overlapping streaks of 1s form artificial spatial clusters across sub-blocks.",
      remediation: "Remediate avalanche photodiode breakdown charge accumulation or sensor saturation."
    },
    "Maurer's Universal Statistical": {
      why: "Matching pattern distances indicate that your sequence can be compressed without information loss.",
      remediation: "Remove algorithmic predictability, structured file headers, or low-entropy static fields."
    },
    "Approximate Entropy": {
      why: "Sub-pattern complexity of length m compared to length m+1 deviates from maximum entropy expectations.",
      remediation: "Expand state space size or cryptographically hash short deterministic seeds."
    },
    "Random Excursions": {
      why: "The random walk trajectory created by your file visits state +1 or -1 abnormally often.",
      remediation: "Remediate asymmetric random walk trajectory drift or increase cycle counts."
    },
    "Random Excursions Variant": {
      why: "Specific state visits (x in [-9..+9]) deviate from theoretical Brownian motion bounds.",
      remediation: "Eliminate state trajectory bias in physical entropy harvesters."
    },
    "Serial (Test 1)": {
      why: "Frequencies of 2^m m-bit overlapping sub-words are non-uniform across your file.",
      remediation: "Check byte-to-bit endianness conversion or non-uniform LSB bit packaging."
    },
    "Serial (Test 2)": {
      why: "Non-overlapping sub-pattern variance exceeds standard limits.",
      remediation: "Eliminate higher-order sub-pattern correlation in byte streams."
    },
    "Linear Complexity": {
      why: "Your bit sequence can be generated by a short Linear Feedback Shift Register (LFSR length L < M/2).",
      remediation: "Do not rely on linear PRNG generators (like LCGs); wrap with cryptographic hashing."
    }
  };

  return map[testName] || {
    why: `The statistical P-value (${pValue}) was below the significance threshold α = ${alpha}, indicating non-random structure.`,
    remediation: "Inspect bit conversion, file encoding, or physical entropy harvester calibration."
  };
}
