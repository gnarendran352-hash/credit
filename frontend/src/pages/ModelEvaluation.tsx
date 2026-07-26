import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import { getModelMetrics, getRocData, getPrData } from '../services/api';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const ModelEvaluation: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [rocData, setRocData] = useState<any>(null);
  const [prData, setPrData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getModelMetrics().catch(() => null),
      getRocData().catch(() => null),
      getPrData().catch(() => null),
    ]).then(([m, r, p]) => {
      setMetrics(m);
      setRocData(r);
      setPrData(p);
    });
  }, []);

  const rocChartData = rocData?.fpr?.map((fpr: number, i: number) => ({
    fpr: fpr,
    tpr: rocData.tpr[i],
  })) || [];

  const prChartData = prData?.recall?.map((recall: number, i: number) => ({
    recall: recall,
    precision: prData.precision[i],
  })) || [];

  const cm = metrics?.confusion_matrix;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Model Evaluation</h1>
        <p className="text-white/40 mt-1">Comprehensive model performance analysis</p>
      </motion.div>

      {/* Confusion Matrix */}
      {cm && (
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-2xl font-bold text-emerald-400">{cm.true_negatives.toLocaleString()}</p>
              <p className="text-xs text-white/40">True Negatives</p>
            </div>
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-2xl font-bold text-red-400">{cm.false_positives.toLocaleString()}</p>
              <p className="text-xs text-white/40">False Positives</p>
            </div>
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-2xl font-bold text-red-400">{cm.false_negatives.toLocaleString()}</p>
              <p className="text-xs text-white/40">False Negatives</p>
            </div>
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-2xl font-bold text-emerald-400">{cm.true_positives.toLocaleString()}</p>
              <p className="text-xs text-white/40">True Positives</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ROC Curve */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">ROC Curve (AUC: {metrics?.roc_auc?.toFixed(4) || '...'})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rocChartData}>
                <defs>
                  <linearGradient id="rocGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fpr" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="url(#rocGradient)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fpr" data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Precision-Recall Curve */}
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">Precision-Recall Curve</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prChartData}>
                <defs>
                  <linearGradient id="prGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="recall" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="precision" stroke="#10b981" fill="url(#prGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ModelEvaluation;