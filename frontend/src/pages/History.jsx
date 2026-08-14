import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Download, Eye, RefreshCw, Database } from 'lucide-react';
import TestTable from '../components/TestTable';
import { API_BASE_URL } from '../apiConfig';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history?limit=50`);
      setHistoryList(res.data);
    } catch (err) {
      console.error('Error fetching test history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInspectRun = async (runId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history/${runId}`);
      setSelectedRun(res.data);
    } catch (err) {
      alert('Error fetching run detail: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const exportJSON = () => {
    if (!selectedRun) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedRun, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nist_run_${selectedRun.id}_${selectedRun.timestamp.replace(/[: ]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
            <Database size={20} />
            <span>SQLite Database History Logs</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            NIST Test Execution History
          </h1>
        </div>

        <button onClick={fetchHistory} className="custom-button" style={{ background: '#1e293b' }}>
          <RefreshCw size={16} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* History table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '12px' }} />
            <div>Loading test run history...</div>
          </div>
        ) : historyList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No test runs recorded yet. Execute tests in the NIST Laboratory or PRNG/TRNG/QRNG pages to store logs.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>ID & Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Source Category</th>
                  <th style={{ padding: '12px 16px' }}>Algorithm / File</th>
                  <th style={{ padding: '12px 16px' }}>Seed</th>
                  <th style={{ padding: '12px 16px' }}>Bits / Seq</th>
                  <th style={{ padding: '12px 16px' }}>Engine Mode</th>
                  <th style={{ padding: '12px 16px' }}>Pass Rate</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((run) => (
                  <tr key={run.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                      #{run.id} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>{run.timestamp}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8' }}>{run.source_type}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{run.algorithm_or_source}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Fira Code', color: '#a78bfa' }}>{run.seed || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Fira Code' }}>
                      {run.sequence_length?.toLocaleString()} ({run.num_sequences}s)
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem' }}>
                      <span className="badge-info">{run.execution_mode}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: run.pass_rate >= 90 ? '#34d399' : '#f87171' }}>
                      {run.pass_rate}% ({run.passed_count}/{run.total_tests})
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleInspectRun(run.id)}
                        className="custom-button"
                        style={{ padding: '5px 12px', fontSize: '0.8rem', background: '#1e293b' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Run Inspector */}
      {selectedRun && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                Inspection Details for Run #{selectedRun.id}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                Source: <strong>{selectedRun.source_type} ({selectedRun.algorithm_or_source})</strong> | Seed: <strong>{selectedRun.seed || 'N/A'}</strong>
              </div>
            </div>

            <button onClick={exportJSON} className="custom-button" style={{ background: '#0284c7' }}>
              <Download size={16} />
              <span>Export JSON Report</span>
            </button>
          </div>

          <TestTable tests={selectedRun.results_data?.tests || []} alpha={selectedRun.alpha} />
        </div>
      )}

    </div>
  );
}
