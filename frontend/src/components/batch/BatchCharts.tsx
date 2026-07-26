import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import type { BatchResultWithClass } from '../../types/batchTypes';
import GlassCard from '../ui/GlassCard';

interface BatchChartsProps {
  predictions: BatchResultWithClass[];
}

const BatchCharts: React.FC<BatchChartsProps> = ({ predictions }) => {
  const fraudCount = predictions.filter(p => p.prediction === 'Fraud').length;
  const legitimateCount = predictions.filter(p => p.prediction === 'Legitimate').length;
  const pieData = [
    { name: 'Legitimate', value: legitimateCount, color: '#10b981' },
    { name: 'Fraud', value: fraudCount, color: '#ef4444' },
  ];

  const riskDistribution = ['Low', 'Medium', 'High'].map(level => ({
    level,
    count: predictions.filter(p => p.risk_level === level).length,
  }));

  const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const histogramData = bins.slice(0, -1).map((_, i) => {
    const min = bins[i];
    const max = bins[i + 1];
    return {
      range: `${min}-${max}`,
      count: predictions.filter(p => p.probability * 100 >= min && p.probability * 100 < max).length,
    };
  });

  const topRisk = [...predictions]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10)
    .map(p => ({
      id: `TXN-${p.transaction_id}`,
      risk: p.risk_score,
    }));

  const timelineData = predictions.map((p, i) => ({
    index: i + 1,
    risk: p.risk_score,
    fraud: p.prediction === 'Fraud' ? p.risk_score : 0,
    legitimate: p.prediction === 'Legitimate' ? p.risk_score : 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Fraud vs Legitimate</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={5} dataKey="value"
                animationBegin={0} animationDuration={1500}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{
                background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Risk Level Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistribution} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis dataKey="level" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip contentStyle={{
                background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
              }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} animationDuration={1500}>
                {riskDistribution.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={i === 0 ? '#10b981' : i === 1 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Fraud Probability Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip contentStyle={{
                background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
              }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Risk Transactions</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topRisk} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} domain={[0, 100]} />
              <YAxis dataKey="id" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip contentStyle={{
                background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
              }} />
              <Bar dataKey="risk" radius={[0, 8, 8, 0]} animationDuration={1500}>
                {topRisk.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={topRisk[i].risk > 70 ? '#ef4444' : topRisk[i].risk > 30 ? '#eab308' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {timelineData.length > 0 && (
        <GlassCard gradient className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Prediction Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData.slice(0, Math.min(50, timelineData.length))}>
                <defs>
                  <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="index" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{
                  background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff',
                }} />
                <Area type="monotone" dataKey="legitimate" stroke="#10b981" fill="url(#legitGradient)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="fraud" stroke="#ef4444" fill="url(#fraudGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default BatchCharts;
