import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: '60px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#070a12',
      padding: '36px 24px',
      color: '#94a3b8',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Significance level & Math note */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
              <Info size={18} />
              <span>NIST SP 800-22 Significance Level (α = 0.01)</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.5' }}>
              Individual tests evaluate sequence properties against significance level <strong>α = 0.01</strong>. 
              A test decision of <strong>PASS</strong> indicates that the sequence exhibits no statistically significant evidence against random behavior at the 99% confidence level.
            </p>
          </div>

          {/* Security & Physical Disclaimer */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 600, marginBottom: '8px' }}>
              <ShieldAlert size={18} />
              <span>Security & Origin Disclaimer</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.5' }}>
              <strong>Statistical PASS ≠ Cryptographic Proof.</strong> Passing NIST tests confirms uniform frequency and non-periodicity, but does not guarantee cryptographic un-predictability or proof of quantum physical origin.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
          <div>
            © 2026 Randomness Test Lab — NIST SP 800-22 Rev 1a Evaluation Suite
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Primary Engine: NIST STS C Reference</span>
            <span>•</span>
            <span>Fallback: Python SciPy Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
