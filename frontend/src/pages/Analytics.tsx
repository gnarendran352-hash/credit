import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import RiskGauge from '../components/ui/RiskGauge';
import { getModelMetrics, getFeatureImportance } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, PieChart, Pie, Legend, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Activity, Target, Crosshair, Shield, Brain, DollarSign, Clock, Zap } from 'lucide-react';

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
    }).catch(() => {});
  }, []);

  const demoMetrics = {
    accuracy: 0.9991,
    precision: 0.9423,
    recall: 0.8517,
    f1_score: 0.8945,
    roc_auc: 0.9762,
  };

  const demoFeatures = [
    { name: 'V14', importance: 15.2 }, { name: 'V17', importance: 12.4 },
    { name: 'V12', importance: 11.2 }, { name: 'V10', importance: 9.8 },
    { name: 'V11', importance: 8.7 }, { name: 'V16', importance: 7.9 },
    { name: 'V3', importance: 7.2 }, { name: 'V9', importance: 6.5 },
    { name: 'V7', importance: 5.8 }, { name: 'V4', importance: 5.1 },
  ];

  const activeMetrics = metrics || demoMetrics;
  const activeFeatures = features?.features || demoFeatures;

  const metricCards = activeMetrics ? [
    { label: 'Accuracy', value: (activeMetrics.accuracy * 100).toFixed(2) + '%', color: 'text-emerald-400', icon: Target, gradient: 'from-emerald-500/20 to-green-500/10' },
    { label: 'Precision', value: (activeMetrics.precision * 100).toFixed(2) + '%', color: 'text-blue-400', icon: Crosshair, gradient: 'from-blue-500/20 to-cyan-500/10' },
    { label: 'Recall', value: (activeMetrics.recall * 100).toFixed(2) + '%', color: 'text-purple-400', icon: Activity, gradient: 'from-purple-500/20 to-pink-500/10' },
    { label: 'F1 Score', value: (activeMetrics.f1_score * 100).toFixed(2) + '%', color: 'text-cyan-400', icon: TrendingUp, gradient: 'from-cyan-500/20 to-teal-500/10' },
    { label: 'ROC-AUC', value: activeMetrics.roc_auc.toFixed(4), color: 'text-emerald-400', icon: Shield, gradient: 'from-green-500/20 to-emerald-500/10' },
  ] : [];

  const topFeatures = activeFeatures.slice(0, 10);

  const radarData = [
    { metric: 'Accuracy', value: activeMetrics.accuracy * 100 },
    { metric: 'Precision', value: activeMetrics.precision * 100 },
    { metric: 'Recall', value: activeMetrics.recall * 100 },
    { metric: 'F1 Score', value: activeMetrics.f1_score * 100 },
    { metric: 'ROC-AUC', value: activeMetrics.roc_auc * 100 },
  ];

  const confusionMatrix = metrics?.confusion_matrix || {
    true_negatives: 56864,
    false_positives: 12,
    false_negatives: 42,
    true_positives: 85,
  };

  const cmData = [
    { name: 'TN', value: confusionMatrix.true_negatives, color: '#10b981', label: 'True Negative' },
    { name: 'FP', value: confusionMatrix.false_positives, color: '#ef4444', label: 'False Positive' },
    { name: 'FN', value: confusionMatrix.false_negatives, color: '#f59e0b', label: 'False Negative' },
    { name: 'TP', value: confusionMatrix.true_positives, color: '#3b82f6', label: 'True Positive' },
  ];

  const riskTimelineData = [
    { time: '00:00', risk: 15, confidence: 92 },
    { time: '04:00', risk: 12, confidence: 94 },
    { time: '08:00', risk: 28, confidence: 88 },
    { time: '12:00', risk: 45, confidence: 85 },
    { time: '16:00', risk: 38, confidence: 87 },
    { time: '20:00', risk: 22, confidence: 91 },
  ];

  const amountHistogramData = [
    { amount: 0, count: 12000 }, { amount: 50, count: 18000 }, { amount: 100, count: 25000 },
    { amount: 200, count: 32000 }, { amount: 500, count: 28000 }, { amount: 1000, count: 15000 },
    { amount: 2000, count: 8000 }, { amount: 5000, count: 4000 }, { amount: 10000, count: 2000 },
  ];

  const processingSpeedData = [
    { time: '10:00', speed: 125 }, { time: '10:05', speed: 132 }, { time: '10:10', speed: 128 },
    { time: '10:15', speed: 145 }, { time: '10:20', speed: 138 }, { time: '10:25', speed: 155 },
  ];

  const fraudVsLegitData = [
    { name: 'Legitimate', value: 284315, color: '#10b981' },
    { name: 'Fraud', value: 492, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Analytics</h1>
          <p className="text-white/40 mt-1">Detailed model performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-400 font-medium">Random Forest v3.2</span>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <GlassCard gradient>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                    <TrendingUp className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-white/40 mt-1">{card.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Feature Importance</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">SHAP Values</span>
          </div>
          {topFeatures.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
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
          )}
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Model Performance Radar</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Overview</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Radar name="Model" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} animationDuration={1500} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Timeline */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Timeline</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">24h Overview</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTimelineData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Processing Speed */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Processing Speed</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">tx/min</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processingSpeedData}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="speed" stroke="#3b82f6" fill="url(#speedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Confusion Matrix</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Classification</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {cmData.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border bg-gradient-to-br ${item.color}/10 border-${item.color}/20`}
              >
                <p className="text-xs text-white/40 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold`} style={{ color: item.color }}>
                  {item.value.toLocaleString()}
                </p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 57000) * 100}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Model Health */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Model Health</h3>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <RiskGauge value={activeMetrics.accuracy * 100} size={180} label="Overall Accuracy" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Precision', value: (activeMetrics.precision * 100).toFixed(1) + '%', color: 'text-blue-400' },
                { label: 'Recall', value: (activeMetrics.recall * 100).toFixed(1) + '%', color: 'text-purple-400' },
                { label: 'F1 Score', value: (activeMetrics.f1_score * 100).toFixed(1) + '%', color: 'text-cyan-400' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;