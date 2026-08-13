import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine
} from 'recharts';

export function PassFailDonutChart({ passed = 0, failed = 0, passRate = 0 }) {
  const data = [
    { name: 'PASS', value: passed, color: '#10b981' },
    { name: 'FAIL', value: failed, color: '#ef4444' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: passRate >= 90 ? '#34d399' : '#f87171' }}>
          {passRate}%
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', tracking: '1px' }}>
          Pass Rate
        </div>
      </div>
    </div>
  );
}

export function PValueBarChart({ tests = [], alpha = 0.01 }) {
  const chartData = tests.map(t => ({
    name: t.name.length > 14 ? t.name.substring(0, 12) + '...' : t.name,
    fullName: t.name,
    pValue: typeof t.p_value === 'number' ? t.p_value : 0.0,
    status: t.status
  }));

  return (
    <div style={{ width: '100%', height: '260px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 1.0]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <RechartsTooltip
            formatter={(value) => [value.toFixed(6), 'P-value']}
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
          />
          <ReferenceLine y={alpha} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `α = ${alpha}`, fill: '#f43f5e', fontSize: 12, position: 'top' }} />
          <Bar dataKey="pValue" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.status === 'PASS' ? '#38bdf8' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UniformityHistogramChart({ binCounts = [] }) {
  const data = Array.from({ length: 10 }, (_, i) => ({
    bin: `[${(i*0.1).toFixed(1)}, ${((i+1)*0.1).toFixed(1)})`,
    count: binCounts[i] || 0
  }));

  return (
    <div style={{ width: '100%', height: '180px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey="bin" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <RechartsTooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
          <Bar dataKey="count" fill="#818cf8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
