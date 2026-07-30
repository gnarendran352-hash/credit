import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Activity, Cpu, HardDrive, Wifi, Server, Brain, Shield } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { getHealthStatus, getModelMetrics } from '../services/api';

const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [uptime, setUptime] = useState('0s');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, m] = await Promise.all([
          getHealthStatus().catch(() => null),
          getModelMetrics().catch(() => null),
        ]);
        setHealth(h);
        setMetrics(m);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (health?.timestamp) {
        const start = new Date(health.timestamp).getTime();
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setUptime(`${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [health?.timestamp]);

  const isHealthy = health?.status === 'healthy';
  const modelLoaded = health?.model_loaded;

  const systemComponents = [
    { name: 'Backend API', status: isHealthy ? 'Operational' : 'Degraded', icon: Server, color: isHealthy ? 'emerald' : 'red', uptime: health?.timestamp ? 'Live' : 'N/A' },
    { name: 'ML Model', status: modelLoaded ? 'Active' : 'Demo Mode', icon: Brain, color: modelLoaded ? 'emerald' : 'yellow', uptime: 'Loaded' },
    { name: 'Firebase', status: 'Connected', icon: Wifi, color: 'emerald', uptime: 'Live' },
    { name: 'Prediction Engine', status: 'Ready', icon: Shield, color: 'emerald', uptime: 'Standby' },
  ];

  const performanceMetrics = [
    { label: 'Accuracy', value: metrics ? `${((metrics.accuracy ?? 0) * 100).toFixed(2)}%` : '--', icon: Activity, color: 'blue' },
    { label: 'ROC-AUC', value: metrics ? metrics.roc_auc?.toFixed(4) : '--', icon: Gauge, color: 'purple' },
    { label: 'Precision', value: metrics ? ((metrics.precision ?? 0) * 100).toFixed(2) + '%' : '--', icon: Shield, color: 'emerald' },
    { label: 'Recall', value: metrics ? ((metrics.recall ?? 0) * 100).toFixed(2) + '%' : '--', icon: Activity, color: 'orange' },
    { label: 'F1 Score', value: metrics ? metrics.f1_score?.toFixed(4) : '--', icon: Gauge, color: 'pink' },
    { label: 'Model Type', value: metrics?.model_type || '--', icon: Brain, color: 'blue' },
    { label: 'Training Samples', value: metrics?.training_samples?.toLocaleString() || '--', icon: Cpu, color: 'purple' },
    { label: 'Features', value: metrics?.feature_count?.toString() || '--', icon: Activity, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">System Health</h1>
          <p className="text-white/50 text-sm mt-1">Infrastructure monitoring dashboard</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
          <span className="text-sm text-white/60">Uptime: {uptime}</span>
        </div>
      </div>

      {/* System Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemComponents.map((comp, i) => {
          const Icon = comp.icon;
          return (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard gradient>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider">{comp.name}</p>
                    <p className={`text-lg font-bold text-${comp.color}-400 mt-1`}>{comp.status}</p>
                    <p className="text-xs text-white/40 mt-1">Uptime: {comp.uptime}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${comp.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${comp.color}-400`} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Model Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {performanceMetrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3 h-3 text-${metric.color}-400`} />
                    <span className="text-xs text-white/50">{metric.label}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{metric.value}</p>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Confusion Matrix */}
        {metrics?.confusion_matrix && (
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Confusion Matrix</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs text-white/50 mb-1">True Negatives</p>
                <p className="text-2xl font-bold text-emerald-400">{metrics.confusion_matrix.true_negatives?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-xs text-white/50 mb-1">False Positives</p>
                <p className="text-2xl font-bold text-red-400">{metrics.confusion_matrix.false_positives?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-xs text-white/50 mb-1">False Negatives</p>
                <p className="text-2xl font-bold text-red-400">{metrics.confusion_matrix.false_negatives?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs text-white/50 mb-1">True Positives</p>
                <p className="text-2xl font-bold text-emerald-400">{metrics.confusion_matrix.true_positives?.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-center text-xs text-white/30">
        Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default SystemHealth;