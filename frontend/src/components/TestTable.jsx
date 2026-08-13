import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import TestResultModal from './TestResultModal';

export default function TestTable({ tests = [], alpha = 0.01 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);

  const filteredTests = tests.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            NIST SP 800-22 Test Results Matrix
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Evaluated at significance level <strong>α = {alpha}</strong>
          </div>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search test name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input"
            style={{ paddingLeft: '36px', width: '220px' }}
          />
        </div>
      </div>

      {/* Table grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px' }}>Test Name</th>
              <th style={{ padding: '12px 16px' }}>P-Value</th>
              <th style={{ padding: '12px 16px' }}>Uniformity (p_T)</th>
              <th style={{ padding: '12px 16px' }}>Pass Proportion</th>
              <th style={{ padding: '12px 16px' }}>Decision</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((test, index) => {
              const isPass = test.status === 'PASS';
              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                    {test.name}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'Fira Code', color: isPass ? '#38bdf8' : '#f87171' }}>
                    {typeof test.p_value === 'number' ? test.p_value.toFixed(6) : test.p_value}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'Fira Code', color: '#94a3b8' }}>
                    {typeof test.p_uniformity === 'number' ? test.p_uniformity.toFixed(4) : (test.p_uniformity || 'N/A')}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'Fira Code', color: '#a78bfa' }}>
                    {typeof test.pass_ratio === 'number' ? `${(test.pass_ratio * 100).toFixed(1)}%` : '100%'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={isPass ? 'badge-pass' : 'badge-fail'}>
                      {isPass ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {test.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTest(test)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        color: '#60a5fa',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedTest && (
        <TestResultModal test={selectedTest} onClose={() => setSelectedTest(null)} />
      )}
    </div>
  );
}
