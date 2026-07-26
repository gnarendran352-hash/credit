import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import { getModelMetrics, getFeatureImportance } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Activity, Target, Crosshair } from 'lucide-react';

const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getModelMetrics().catch(() => null),
      getFeatureImportance().catch(() => null),
    ]).then(([m, f]) => {
      setMetrics(m);
      setFeatures(f);
    });
  }, []);

  const metricCards = metrics ? [
    { label: 'Accuracy', value: (metrics.accuracy * 100).toFixed(2) + '%', color: 'text-emerald-400', icon: Target },
    { label: 'Precision', value: (metrics.precision * 100).toFixed(2) + '%', color: 'text-blue-400', icon: Crosshair },
    { label: 'Recall', value: (metrics.recall * 100).toFixed(2) + '%', color: 'text-purple-400', icon: Activity },
    { label: 'F1 Score', value: (metrics.f1_score * 100).toFixed(2) + '%', color: 'text-cyan-400', icon: TrendingUp },
    { label: 'ROC-AUC', value: metrics.roc_auc.toFixed(4), color: 'text-emerald-400', icon: Activity },
  ] : [];

  const topFeatures = features?.features?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 mt-1">Detailed model performance metrics</p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard gradient>
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/40">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Feature Importance */}
      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Top Feature Importance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topFeatures} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]} animationDuration={1500}>
                {topFeatures.map((_: any, i: number) => (
                  <Cell key={i} fill={`hsl(${220 - i * 12}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;