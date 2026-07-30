import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Play, Pause, Square, Zap, AlertTriangle, CheckCircle, Check,
  TrendingUp, Activity, Download, X,
  ChevronUp, Target,
  Brain, Shield, Sparkles, Gauge,
  Ban, Info, ShieldOff, List, Layers,
  DollarSign, Fingerprint,
  Maximize2, Minimize2, FileText,
  Volume2, VolumeX,
  AlertCircle, Radio, RadioTower,
  Sigma, ArrowUp, ArrowDown, CreditCard
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import RiskGauge from '../components/ui/RiskGauge';
import AdvancedButton from '../components/ui/AdvancedButton';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { parseCSVPreview } from '../services/api';
import {
  Bar, BarChart, PieChart as RPieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';
import type { LivePrediction, BankDecision } from '../types/simulationTypes';

// ─── Color Constants ───
const COLORS = {
  approved: '#10b981',
  declined: '#ef4444',
  pending: '#f59e0b',
  critical: '#7c3aed',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
};

const CHART_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#f97316'];

// ─── Helper Functions ───
const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (n: number) => n.toLocaleString();
const getRiskColor = (score: number) => score > 70 ? 'text-red-400' : score > 30 ? 'text-yellow-400' : 'text-emerald-400';

const BatchPredict: React.FC = () => {
  const sim = useSimulationEngine();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedTx, setSelectedTx] = useState<LivePrediction | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showExplanations, setShowExplanations] = useState<Set<number>>(new Set());
  const [csvPreview, setCsvPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // ─── File Upload ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    try {
      const preview = await parseCSVPreview(f);
      setCsvPreview(preview);
      await sim.loadCSV(f);
    } catch (err) {
      console.error('Failed to parse CSV:', err);
    }
    setLoading(false);
  };

  // ─── Auto-scroll feed ───
  useEffect(() => {
    if (feedRef.current && sim.liveFeed.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [sim.liveFeed]);

  // ─── Filtered Predictions ───
  const filteredPredictions = useMemo(() => {
    let preds = [...sim.predictions];
    if (filterType === 'fraud') preds = preds.filter(p => p.prediction === 'Fraud');
    else if (filterType === 'legitimate') preds = preds.filter(p => p.prediction === 'Legitimate');
    else if (filterType === 'high') preds = preds.filter(p => p.risk_level === 'High');
    else if (filterType === 'medium') preds = preds.filter(p => p.risk_level === 'Medium');
    else if (filterType === 'low') preds = preds.filter(p => p.risk_level === 'Low');
    else if (filterType === 'cancelled') preds = preds.filter(p => p.cancelled);
    return preds.slice(0, 100);
  }, [sim.predictions, filterType]);

  // ─── Chart Data ───
  const slices = useMemo(() => {
    const fraud = sim.liveStats.fraudCount;
    const legit = sim.liveStats.legitimateCount;
    const total = fraud + legit || 1;
    return [
      { name: 'Legitimate', value: legit, color: COLORS.approved, pct: ((legit / total) * 100).toFixed(2) },
      { name: 'Fraud', value: fraud, color: COLORS.declined, pct: ((fraud / total) * 100).toFixed(2) },
    ];
  }, [sim.liveStats]);

  const riskDonut = useMemo(() => {
    const all = sim.predictions;
    const low = all.filter(p => p.risk_level === 'Low').length;
    const med = all.filter(p => p.risk_level === 'Medium').length;
    const high = all.filter(p => p.risk_level === 'High').length;
    const total = low + med + high || 1;
    return [
      { name: 'Low Risk', value: low, color: COLORS.low, pct: ((low / total) * 100).toFixed(1) },
      { name: 'Medium Risk', value: med, color: COLORS.medium, pct: ((med / total) * 100).toFixed(1) },
      { name: 'High Risk', value: high, color: COLORS.high, pct: ((high / total) * 100).toFixed(1) },
    ];
  }, [sim.predictions]);

  const amountHistogram = useMemo(() => {
    const amounts = sim.predictions.map(p => p.amount);
    const max = Math.max(...amounts, 1);
    const bins = 10;
    const binSize = max / bins;
    const data = Array.from({ length: bins }, (_, i) => ({
      range: `$${(i * binSize).toFixed(0)}-${((i + 1) * binSize).toFixed(0)}`,
      count: amounts.filter(a => a >= i * binSize && a < (i + 1) * binSize).length,
      fraud: sim.predictions.filter(p => p.amount >= i * binSize && p.amount < (i + 1) * binSize && p.prediction === 'Fraud').length,
    }));
    return data;
  }, [sim.predictions]);

  const fraudTrend = useMemo(() => {
    const intervals = 30;
    const chunkSize = Math.max(1, Math.floor(sim.timeSeries.length / intervals));
    const data = [];
    for (let i = 0; i < Math.min(intervals, sim.timeSeries.length); i++) {
      const idx = Math.min(i * chunkSize, sim.timeSeries.length - 1);
      const ts = sim.timeSeries[idx];
      data.push({
        time: ts.time,
        fraud: ts.fraud,
        legitimate: ts.legitimate,
        riskScore: ts.riskScore,
        cancelled: ts.cancelled,
      });
    }
    return data;
  }, [sim.timeSeries]);

  const probDistribution = useMemo(() => {
    const preds = sim.predictions;
    const bins = 10;
    const data = [];
    for (let i = 0; i < bins; i++) {
      const low = i / bins;
      const high = (i + 1) / bins;
      const count = preds.filter(p => p.fraud_probability >= low && p.fraud_probability < high).length;
      data.push({
        range: `${(low * 100).toFixed(0)}-${(high * 100).toFixed(0)}%`,
        count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      });
    }
    return data;
  }, [sim.predictions]);

  const predictionTimeline = useMemo(() => {
    return sim.predictions.slice(-200).map(p => ({
      id: p.transaction_id,
      riskScore: p.risk_score,
      prediction: p.prediction,
      amount: p.amount,
    }));
  }, [sim.predictions]);

  // ─── Bank decision for a transaction ───
  const getBankDecision = (p: LivePrediction): BankDecision => {
    if (p.risk_score > 90) return { transaction_id: p.transaction_id, risk_score: p.risk_score, risk_level: 'High', decision: 'FREEZE_ACCOUNT', reason: 'Critical risk score', action_taken: 'Account frozen' };
    if (p.risk_score > 70) return { transaction_id: p.transaction_id, risk_score: p.risk_score, risk_level: 'High', decision: 'CANCEL_PAYMENT', reason: 'High fraud probability', action_taken: 'Transaction blocked' };
    if (p.risk_score > 30) return { transaction_id: p.transaction_id, risk_score: p.risk_score, risk_level: 'Medium', decision: 'MANUAL_REVIEW', reason: 'Moderate risk', action_taken: 'Flagged for review' };
    return { transaction_id: p.transaction_id, risk_score: p.risk_score, risk_level: 'Low', decision: 'APPROVE', reason: 'Low risk', action_taken: 'Approved' };
  };

  // ─── Toggle Explanation ───
  const toggleExplanation = (id: number) => {
    setShowExplanations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── AI Insights ───
  const aiInsights = useMemo(() => {
    const insights: string[] = [];
    const recent500 = sim.predictions.slice(-500);
    const fraudInRecent = recent500.filter(p => p.prediction === 'Fraud').length;
    const totalRecent = recent500.length;

    if (totalRecent > 0) {
      const rate = (fraudInRecent / totalRecent) * 100;
      insights.push(`Fraud rate: ${rate.toFixed(2)}% — ${fraudInRecent.toLocaleString()} of ${totalRecent.toLocaleString()} recent transactions flagged as fraudulent.`);
    }

    const highValueFraud = sim.predictions.filter(p => p.amount > 5000 && p.prediction === 'Fraud');
    if (highValueFraud.length > 0) {
      const totalLoss = highValueFraud.reduce((s, p) => s + p.amount, 0);
      insights.push(`Prevented losses: ${formatCurrency(totalLoss)} in high-value fraud blocked (>$5,000).`);
    }

    const currentFraudRate = sim.liveStats.fraudCount / (sim.liveStats.processedCount || 1) * 100;
    insights.push(`Overall fraud detection rate: ${currentFraudRate.toFixed(2)}%`);
    insights.push(`Model confidence: ${sim.liveStats.averageConfidence.toFixed(0)}% average across all predictions.`);

    if (sim.liveStats.averageRiskScore > 30) {
      insights.push(`⚠️ Elevated average risk score (${sim.liveStats.averageRiskScore.toFixed(1)}). Increased vigilance recommended.`);
    }

    const avgAmount = sim.liveStats.totalAmountApproved / (sim.liveStats.processedCount || 1);
    insights.push(`Average transaction: ${formatCurrency(avgAmount)}`);

    if (sim.liveAnalytics?.topFraudFeatures && sim.liveAnalytics.topFraudFeatures.length > 0) {
      const topFeature = sim.liveAnalytics.topFraudFeatures[0];
      insights.push(`Top fraud indicator: ${topFeature.feature} (${topFeature.avgImportance.toFixed(1)}% avg importance in ${topFeature.count} fraud cases).`);
    }

    return insights;
  }, [sim.predictions, sim.liveStats, sim.liveAnalytics]);

  // ─── Progress percentage ───
  const progressPct = useMemo(() => 
    sim.simState.totalTransactions > 0 
      ? (sim.liveStats.processedCount / sim.simState.totalTransactions) * 100 
      : 0,
  [sim.liveStats.processedCount, sim.simState.totalTransactions]);

  return (
    <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-[#0a0a1a] overflow-y-auto p-6' : ''}`}>
      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <RadioTower className="w-7 h-7 text-white" />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a1a] ${
              sim.simState.status === 'running' ? 'bg-emerald-400 animate-pulse' :
              sim.simState.status === 'paused' ? 'bg-yellow-400' :
              sim.simState.status === 'completed' ? 'bg-blue-400' : 'bg-white/20'
            }`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Fraud Monitoring Center</h1>
            <p className="text-white/40 text-sm">Real-time transaction surveillance & AI fraud detection</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFullscreen(!fullscreen)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            sim.simState.status === 'running' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            sim.simState.status === 'paused' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
            sim.simState.status === 'completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full ${sim.simState.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
            <span className="text-xs font-medium capitalize">{sim.simState.status === 'idle' ? 'AWAITING INPUT' : sim.simState.status.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      {/* ─── File Upload ─── */}
      {sim.simState.status === 'idle' && !csvPreview && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard gradient glow>
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Upload Transaction CSV</h2>
              <p className="text-white/50 mb-8 text-center max-w-xl text-lg">
                Upload a credit card transaction CSV to start the <span className="text-emerald-400 font-semibold">real-time fraud monitoring simulation</span>.
                Transactions will stream live with AI-powered fraud detection.
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <AdvancedButton variant="gradient" size="lg" glow icon={<Upload className="w-5 h-5" />} onClick={() => fileInputRef.current?.click()}>
                {loading ? 'Processing CSV...' : 'Upload & Start Monitoring'}
              </AdvancedButton>
              <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/30">
                <span>📊 Supports up to 1,000,000 transactions</span>
                <span>🔢 30 features (V1-V28, Time, Amount)</span>
                <span>⚡ Real-time predictions via ML model</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ─── Error State ─── */}
      {sim.simState.status === 'error' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard gradient glow>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Prediction Failed</h2>
              <p className="text-red-300/80 mb-2 text-center max-w-xl">
                {sim.backendError || 'An unknown error occurred while processing the CSV.'}
              </p>
              <p className="text-white/40 mb-8 text-center max-w-lg text-sm">
                Ensure your CSV has the required columns: Time, V1-V28, Amount. Column names are case-insensitive.
              </p>
              <AdvancedButton variant="gradient" size="lg" icon={<Upload className="w-5 h-5" />} onClick={() => sim.stop()}>
                Try Again
              </AdvancedButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ─── CSV Analytics & Start Controls ─── */}
      {sim.csvAnalytics && sim.simState.status === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard gradient>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">CSV Loaded — Ready to Simulate</h3>
                  <p className="text-xs text-white/40">{file?.name} • {formatNumber(sim.csvAnalytics.totalRows)} transactions</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {[
                { label: 'Transactions', value: formatNumber(sim.csvAnalytics.totalRows), color: 'text-blue-400', icon: CreditCard },
                { label: 'Features', value: sim.csvAnalytics.totalColumns, color: 'text-purple-400', icon: Layers },
                { label: 'Avg Amount', value: formatCurrency(sim.csvAnalytics.averageAmount), color: 'text-emerald-400', icon: DollarSign },
                { label: 'Max Amount', value: formatCurrency(sim.csvAnalytics.maxAmount), color: 'text-red-400', icon: ArrowUp },
                { label: 'Min Amount', value: formatCurrency(sim.csvAnalytics.minAmount), color: 'text-emerald-400', icon: ArrowDown },
                { label: 'Median', value: formatCurrency(sim.csvAnalytics.medianAmount), color: 'text-cyan-400', icon: Gauge },
                { label: 'Data Quality', value: `${sim.csvAnalytics.dataQualityScore}%`, color: sim.csvAnalytics.dataQualityScore > 90 ? 'text-emerald-400' : 'text-yellow-400', icon: Shield },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    <p className="text-[10px] text-white/40">{stat.label}</p>
                  </div>
                  <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">Simulation Speed:</span>
                {[100, 250, 500].map(ms => (
                  <button key={ms} onClick={() => sim.setConfigInterval(ms)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sim.configInterval === ms ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                    }`}>
                    {ms}ms
                  </button>
                ))}
              </div>
              <AdvancedButton variant="gradient" size="lg" glow icon={<Play className="w-5 h-5" />} onClick={sim.start} className="ml-auto">
                ▶ START REAL-TIME SIMULATION
              </AdvancedButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ─── Simulation Controls ─── */}
      {(sim.simState.status === 'running' || sim.simState.status === 'paused') && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard gradient>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {sim.simState.status === 'running' ? (
                  <button onClick={sim.pause} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all font-medium">
                    <Pause className="w-5 h-5" /> ⏸ Pause
                  </button>
                ) : (
                  <button onClick={sim.resume} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-medium">
                    <Play className="w-5 h-5" /> ▶ Resume
                  </button>
                )}
                <button onClick={sim.stop} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-medium">
                  <Square className="w-5 h-5" /> ⏹ Stop
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 flex items-center gap-1"><Zap className="w-3 h-3" /> Speed:</span>
                {[1, 2, 5, 10].map(s => (
                  <button key={s} onClick={() => sim.setSpeed(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sim.simState.speed === s ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-white/50 hover:text-white'
                    }`}>
                    {s}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">TX #:</span>
                <span className="text-sm font-bold text-white">{formatNumber(sim.liveStats.processedCount)}</span>
                <span className="text-xs text-white/30">/ {formatNumber(sim.simState.totalTransactions)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">ETA:</span>
                <span className="text-sm font-bold text-cyan-400">{sim.liveStats.estimatedTimeRemaining}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 relative">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/30">{progressPct.toFixed(1)}% complete</span>
                <span className="text-[10px] text-white/30">{formatNumber(sim.liveStats.remainingCount)} remaining</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ─── Live Dashboard Stats Cards ─── */}
      {sim.simState.status !== 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {[
            { label: 'Processed', value: formatNumber(sim.liveStats.processedCount), icon: Activity, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/10' },
            { label: 'Approved ✅', value: formatNumber(sim.liveStats.legitimateCount), icon: CheckCircle, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/10' },
            { label: 'Fraud 🚨', value: formatNumber(sim.liveStats.fraudCount), icon: AlertTriangle, color: 'text-red-400', bg: 'from-red-500/20 to-red-600/10' },
            { label: 'Blocked 🚫', value: formatNumber(sim.liveStats.cancelledCount), icon: Ban, color: 'text-red-500', bg: 'from-red-600/20 to-red-700/10' },
            { label: 'Fraud Rate', value: `${(sim.liveStats.fraudCount / (sim.liveStats.processedCount || 1) * 100).toFixed(2)}%`, icon: Gauge, color: sim.liveStats.fraudCount > 0 ? 'text-red-400' : 'text-emerald-400', bg: 'from-purple-500/20 to-purple-600/10' },
            { label: 'Avg Risk', value: sim.liveStats.averageRiskScore.toFixed(1), icon: Target, color: getRiskColor(sim.liveStats.averageRiskScore), bg: 'from-orange-500/20 to-orange-600/10' },
            { label: 'Avg Confidence', value: `${sim.liveStats.averageConfidence.toFixed(1)}%`, icon: Brain, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-600/10' },
            { label: 'Approved $', value: formatCurrency(sim.liveStats.totalAmountApproved), icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-600/10' },
            { label: 'Blocked $', value: formatCurrency(sim.liveStats.totalAmountBlocked), icon: ShieldOff, color: 'text-red-400', bg: 'from-red-500/20 to-red-600/10' },
            { label: 'High Risk', value: formatNumber(sim.liveStats.highRiskCount), icon: AlertCircle, color: 'text-red-400', bg: 'from-red-500/20 to-orange-600/10' },
            { label: 'Speed', value: sim.liveStats.currentSpeed, icon: Zap, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/10' },
            { label: 'TPM', value: `${sim.liveStats.transactionsPerMinute} tx/min`, icon: TrendingUp, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/10' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <GlassCard gradient>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{card.label}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ─── Live Transaction Feed ─── */}
      {sim.liveFeed.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Feed */}
          <div className="xl:col-span-1">
            <GlassCard gradient>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Live Feed</h3>
                  <p className="text-xs text-white/40">Real-time payment updates</p>
                </div>
              </div>
              <div ref={feedRef} className="h-[500px] overflow-y-auto space-y-2 scrollbar-thin">
                <AnimatePresence>
                  {sim.liveFeed.slice(0, 50).map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -30, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        entry.type === 'DECLINED' 
                          ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15' 
                          : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
                      }`}
                      onClick={() => setSelectedTx(entry.prediction)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          entry.type === 'DECLINED' ? 'bg-red-500' : 'bg-emerald-500'
                        }`}>
                          {entry.type === 'DECLINED' ? (
                            <X className="w-4 h-4 text-white" />
                          ) : (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 font-mono">{entry.timestamp}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              entry.type === 'DECLINED' ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'
                            }`}>
                              {entry.type === 'DECLINED' ? 'BLOCKED' : 'APPROVED'}
                            </span>
                          </div>
                          <p className={`text-sm font-semibold mt-0.5 ${entry.type === 'DECLINED' ? 'text-red-300' : 'text-emerald-300'}`}>
                            {entry.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/60">{formatCurrency(entry.amount)}</span>
                            <span className="text-xs text-white/40">|</span>
                            <span className={`text-xs font-mono ${getRiskColor(entry.riskScore)}`}>
                              Risk: {entry.riskScore.toFixed(0)}
                            </span>
                          </div>
                          {entry.type === 'DECLINED' && entry.prediction.nlExplanation && (
                            <p className="text-[10px] text-red-300/60 mt-1 line-clamp-2">{entry.prediction.nlExplanation}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>

          {/* Charts Grid */}
          <div className="xl:col-span-3 space-y-6">
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fraud vs Legitimate Pie */}
              <GlassCard gradient>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Fraud vs Legitimate</h3>
                  <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Real-time</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RPieChart>
                    <Pie data={slices} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={5} dataKey="value" animationDuration={300}>
                      {slices.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-white/50">Legitimate ({slices[0].pct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-white/50">Fraud ({slices[1].pct}%)</span>
                  </div>
                </div>
              </GlassCard>

              {/* Risk Distribution Donut */}
              <GlassCard gradient>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Risk Distribution</h3>
                  <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Donut</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RPieChart>
                    <Pie data={riskDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} dataKey="value" animationDuration={300}>
                      {riskDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {riskDonut.map(r => (
                    <div key={r.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-xs text-white/50">{r.name}: {r.pct}%</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Fraud Trend Line */}
            <GlassCard gradient>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Fraud Trend</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs text-white/40">Fraud</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs text-white/40">Legitimate</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={fraudTrend}>
                  <defs>
                    <linearGradient id="trendFraud" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    <linearGradient id="trendLegit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="legitimate" stroke="#10b981" fill="url(#trendLegit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fraud" stroke="#ef4444" fill="url(#trendFraud)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Amount Distribution & Prob Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard gradient>
                <h3 className="text-lg font-semibold text-white mb-4">Transaction Amount Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={amountHistogram}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" name="Transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fraud" name="Fraud" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-white/40">All</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-white/40">Fraud</span></div>
                </div>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="text-lg font-semibold text-white mb-4">Fraud Probability Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={probDistribution}>
                    <defs>
                      <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#probGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            {/* Prediction Timeline Scatter & High Risk Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard gradient>
                <h3 className="text-lg font-semibold text-white mb-4">Prediction Timeline</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="id" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <YAxis dataKey="riskScore" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Scatter data={predictionTimeline}>
                      {predictionTimeline.map((p, i) => (
                        <Cell key={i} fill={p.prediction === 'Fraud' ? '#ef4444' : '#10b981'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-white/40">Fraud</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-white/40">Legitimate</span></div>
                </div>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="text-lg font-semibold text-white mb-4">Real-Time Gauges</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center"><RiskGauge value={sim.liveStats.averageRiskScore} size={130} label="Avg Risk" /></div>
                  <div className="text-center"><RiskGauge value={sim.liveStats.averageProbability * 100} size={130} label="Avg Prob" /></div>
                  <div className="text-center"><RiskGauge value={sim.liveStats.fraudCount / (sim.liveStats.processedCount || 1) * 100} size={130} label="Fraud Rate" /></div>
                  <div className="text-center"><RiskGauge value={progressPct} size={130} label="Progress" /></div>
                </div>
              </GlassCard>
            </div>

            {/* Live Analytics Panel */}
            {sim.liveAnalytics && (
              <GlassCard gradient>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Sigma className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Analytics</h3>
                    <p className="text-xs text-white/40">Real-time fraud metrics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Fraud Rate</p>
                    <p className="text-lg font-bold text-red-400">{sim.liveAnalytics.currentFraudRate.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Avg Amount</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(sim.liveAnalytics.averageTransactionAmount)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Highest Risk</p>
                    <p className="text-lg font-bold text-red-400">{sim.liveAnalytics.highestRiskScore.toFixed(1)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">TPM</p>
                    <p className="text-lg font-bold text-blue-400">{sim.liveAnalytics.transactionsPerMinute}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Prediction Speed</p>
                    <p className="text-lg font-bold text-purple-400">{sim.liveAnalytics.predictionSpeed}ms</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                    <p className="text-[10px] text-white/40 mb-1">Top Pattern</p>
                    <p className="text-sm font-bold text-cyan-400 truncate">{sim.liveAnalytics.mostCommonFraudPattern}</p>
                  </div>
                </div>
                {sim.liveAnalytics.topFraudFeatures.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-white/40 mb-2 font-medium">Top Fraud Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {sim.liveAnalytics.topFraudFeatures.slice(0, 8).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/5 border border-red-500/10">
                          <Fingerprint className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-white/70">{f.feature}</span>
                          <span className="text-[10px] text-red-400">({f.avgImportance.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            )}

            {/* AI Insights */}
            <GlassCard gradient>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Intelligence</h3>
                  <p className="text-xs text-white/40">Real-time fraud analysis & insights</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                <AnimatePresence>
                  {aiInsights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ─── Critical Fraud Alert Panel ─── */}
      <AnimatePresence>
        {sim.alertTriggered && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 p-6 rounded-2xl bg-red-500/15 border border-red-500/40 backdrop-blur-2xl shadow-2xl max-w-md">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-red-400">🚨 CRITICAL FRAUD ALERT</h4>
                <p className="text-xs text-white/60 mt-1">Transaction #{sim.alertTriggered.transaction_id} — Risk Score: {sim.alertTriggered.risk_score.toFixed(0)}/100</p>
                <p className="text-sm text-red-300 font-semibold mt-1">Amount: {formatCurrency(sim.alertTriggered.amount)}</p>
              </div>
              <button onClick={sim.clearAlert} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-300/80">
                Critical fraud detected. Risk score exceeds 90. Bank decision: FREEZE ACCOUNT. 
                This transaction has been automatically blocked and the account flagged for review.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { sim.clearAlert(); setSelectedTx(sim.predictions.find(p => p.transaction_id === sim.alertTriggered?.transaction_id) || null); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20">
                View Details
              </button>
              <button onClick={sim.clearAlert} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Results Table ─── */}
      {sim.predictions.length > 0 && (
        <GlassCard gradient>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <List className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction Log</h3>
                <p className="text-xs text-white/40">{formatNumber(sim.predictions.length)} results • {formatNumber(sim.liveStats.cancelledCount)} blocked • {formatNumber(sim.liveStats.highRiskCount)} high risk</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'fraud', 'legitimate', 'cancelled', 'high', 'medium', 'low'].map(f => (
                <button key={f} onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filterType === f ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                  }`}>
                  {f === 'cancelled' ? '🚫 Blocked' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0a0a1a] z-10">
                <tr className="border-b border-white/10">
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">TXN</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Amount</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Status</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Payment</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Fraud Prob</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Risk Score</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Risk Level</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Confidence</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Bank Decision</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredPredictions.slice(0, 50).map((p, i) => {
                    const decision = getBankDecision(p);
                    const isFraud = p.prediction === 'Fraud';
                    const isExpanded = showExplanations.has(p.transaction_id);
                    return (
                      <React.Fragment key={p.transaction_id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.003 }}
                          onClick={() => setSelectedTx(p)}
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                            p.cancelled ? 'bg-red-500/10' :
                            isFraud ? 'bg-red-500/5' : 
                            p.risk_level === 'Medium' ? 'bg-yellow-500/5' : ''
                          }`}>
                          <td className="px-3 py-2.5 text-xs text-white font-mono">#{p.transaction_id}</td>
                          <td className="px-3 py-2.5 text-xs text-white/80">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2.5">
                            {p.cancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                <Ban className="w-2.5 h-2.5" /> BLOCKED
                              </span>
                            ) : isFraud ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
                                <AlertTriangle className="w-2.5 h-2.5" /> FLAGGED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="w-2.5 h-2.5" /> ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {p.paymentStatus === 'APPROVED' ? (
                              <span className="text-emerald-400 text-xs font-bold">✅ APPROVED</span>
                            ) : (
                              <span className="text-red-400 text-xs font-bold">❌ DECLINED</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-white/80">{(p.fraud_probability * 100).toFixed(1)}%</td>
                          <td className="px-3 py-2.5 text-xs font-mono">{p.risk_score.toFixed(1)}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              p.risk_level === 'High' ? 'bg-red-500/10 text-red-400' :
                              p.risk_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>{p.risk_level}</span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-white/80">{p.confidence.toFixed(1)}%</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] font-medium ${
                              decision.decision === 'APPROVE' ? 'text-emerald-400' :
                              decision.decision === 'MANUAL_REVIEW' ? 'text-yellow-400' :
                              decision.decision === 'CANCEL_PAYMENT' ? 'text-red-400' :
                              'text-purple-400'
                            }`}>{decision.decision.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <button onClick={(e) => { e.stopPropagation(); toggleExplanation(p.transaction_id); }}
                              className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                            </button>
                          </td>
                        </motion.tr>
                        {isExpanded && (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02]">
                            <td colSpan={10} className="px-6 py-4">
                              <div className="space-y-3">
                                <p className="text-sm text-white/80">{p.nlExplanation || 'No explanation available.'}</p>
                                {p.cancelled && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-red-300">Transaction Blocked</p>
                                      <p className="text-xs text-red-300/70">{decision.reason}</p>
                                      <p className="text-xs text-red-300/70 mt-1">Action: {decision.action_taken}</p>
                                    </div>
                                  </div>
                                )}
                                {p.top_features && p.top_features.length > 0 && (
                                  <div>
                                    <p className="text-xs text-white/40 font-medium mb-2">Feature Importance:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {p.top_features.map((f, fi) => (
                                        <div key={fi} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                                          <span className="text-xs font-mono text-white/80">{f.feature}</span>
                                          <span className="text-[10px] text-blue-400">{f.importance}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ─── Transaction Details Modal ─── */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTx(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    selectedTx.cancelled ? 'bg-red-500' : selectedTx.prediction === 'Fraud' ? 'bg-red-400' : 'bg-emerald-500'
                  }`}>
                    {selectedTx.cancelled ? <Ban className="w-8 h-8 text-white" /> :
                     selectedTx.prediction === 'Fraud' ? <AlertTriangle className="w-8 h-8 text-white" /> :
                     <CheckCircle className="w-8 h-8 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Transaction #{selectedTx.transaction_id}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-lg font-bold ${
                        selectedTx.paymentStatus === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {selectedTx.paymentStatus === 'APPROVED' ? '✅ PAYMENT APPROVED' : '❌ PAYMENT DECLINED'}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTx(null)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Amount', value: formatCurrency(selectedTx.amount), color: 'text-white' },
                  { label: 'Fraud Probability', value: `${(selectedTx.fraud_probability * 100).toFixed(2)}%`, color: selectedTx.fraud_probability > 0.5 ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'Risk Score', value: `${selectedTx.risk_score.toFixed(1)} / 100`, color: getRiskColor(selectedTx.risk_score) },
                  { label: 'Confidence', value: `${selectedTx.confidence.toFixed(1)}%`, color: 'text-blue-400' },
                  { label: 'Risk Level', value: selectedTx.risk_level, color: selectedTx.risk_level === 'High' ? 'text-red-400' : selectedTx.risk_level === 'Medium' ? 'text-yellow-400' : 'text-emerald-400' },
                  { label: 'Prediction', value: selectedTx.prediction, color: selectedTx.prediction === 'Fraud' ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'Payment Status', value: selectedTx.paymentStatus || 'N/A', color: selectedTx.paymentStatus === 'APPROVED' ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Features', value: `${selectedTx.top_features?.length || 0} analyzed`, color: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* AI Explanation */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-purple-500/10 border border-purple-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-bold text-white mb-2">AI Explanation</h4>
                    <p className="text-sm text-white/80 leading-relaxed">{selectedTx.nlExplanation || 'Processing explanation...'}</p>
                    
                    {selectedTx.prediction === 'Fraud' && (
                      <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <h5 className="text-sm font-semibold text-red-400 mb-2">🚨 Why Was It Blocked?</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-red-300/80">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>Very high fraud probability ({(selectedTx.fraud_probability * 100).toFixed(0)}%) — exceeds security threshold</span>
                          </li>
                          {selectedTx.top_features?.slice(0, 4).map((f, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-sm text-red-300/80">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{f.feature} contributed {f.importance}% to the fraud prediction</span>
                            </li>
                          ))}
                          <li className="flex items-start gap-2 text-sm text-red-300/80">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>Amount ({formatCurrency(selectedTx.amount)}) is unusually {selectedTx.amount > 5000 ? 'high' : 'suspicious'} compared to normal patterns</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Bank Decision */}
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <h5 className="text-sm font-semibold text-blue-400 mb-2">🏦 Bank Decision Engine</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-white/40">Decision</p>
                          <p className={`text-sm font-bold mt-0.5 ${
                            getBankDecision(selectedTx).decision === 'APPROVE' ? 'text-emerald-400' :
                            getBankDecision(selectedTx).decision === 'MANUAL_REVIEW' ? 'text-yellow-400' :
                            getBankDecision(selectedTx).decision === 'CANCEL_PAYMENT' ? 'text-red-400' : 'text-purple-400'
                          }`}>{getBankDecision(selectedTx).decision.replace(/_/g, ' ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Risk Score</p>
                          <p className="text-sm font-bold text-white mt-0.5">{selectedTx.risk_score.toFixed(1)} / 100</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-white/40">Recommended Action</p>
                          <p className="text-sm text-white/80 mt-0.5">{getBankDecision(selectedTx).action_taken}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance */}
              {selectedTx.top_features && selectedTx.top_features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Top Contributing Features</h4>
                  <div className="space-y-2">
                    {selectedTx.top_features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-xs font-mono font-bold text-white w-16">{f.feature}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${f.importance}%` }}
                            className={`h-full rounded-full ${f.importance > 20 ? 'bg-red-500' : f.importance > 10 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/60 w-12 text-right">{f.importance}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction Full Details */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Transaction Data</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    { label: 'Time', value: selectedTx.time.toFixed(2) },
                    { label: 'Amount', value: formatCurrency(selectedTx.amount) },
                    { label: 'Fraud Prob', value: `${(selectedTx.fraud_probability * 100).toFixed(2)}%` },
                    { label: 'Risk Score', value: selectedTx.risk_score.toFixed(2) },
                    { label: 'Confidence', value: `${selectedTx.confidence.toFixed(2)}%` },
                    { label: 'Risk Level', value: selectedTx.risk_level },
                    { label: 'Prediction', value: selectedTx.prediction },
                    { label: 'Cancelled', value: selectedTx.cancelled ? 'Yes' : 'No' },
                  ].map((s, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40">{s.label}</p>
                      <p className="text-[10px] text-white/80 font-mono mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Executive Report ─── */}
      {sim.simState.status === 'completed' && sim.execReport && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard gradient>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">📊 Executive Report</h3>
                <p className="text-sm text-white/40">Simulation complete — {formatNumber(sim.execReport.totalTransactions)} transactions processed in {sim.execReport.simulationDuration}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { label: 'Total', value: formatNumber(sim.execReport.totalTransactions), color: 'text-blue-400' },
                { label: 'Approved ✅', value: formatNumber(sim.execReport.approved), color: 'text-emerald-400' },
                { label: 'Blocked 🚫', value: formatNumber(sim.execReport.blocked), color: 'text-red-400' },
                { label: 'Review', value: formatNumber(sim.execReport.manualReview), color: 'text-yellow-400' },
                { label: 'Fraud %', value: `${sim.execReport.fraudPercent.toFixed(2)}%`, color: 'text-red-400' },
                { label: 'Legit %', value: `${sim.execReport.legitimatePercent.toFixed(2)}%`, color: 'text-emerald-400' },
                { label: 'Avg Confidence', value: `${sim.execReport.averageConfidence.toFixed(1)}%`, color: 'text-cyan-400' },
                { label: 'Avg Risk', value: sim.execReport.averageRiskScore.toFixed(1), color: 'text-orange-400' },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Financial Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 text-center">
                <p className="text-xs text-emerald-400/60 mb-1">Total Amount Approved</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(sim.execReport.totalAmountApproved)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 text-center">
                <p className="text-xs text-red-400/60 mb-1">Total Amount Blocked</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(sim.execReport.totalAmountBlocked)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 text-center">
                <p className="text-xs text-purple-400/60 mb-1">💰 Prevented Losses</p>
                <p className="text-2xl font-bold text-purple-400">{formatCurrency(sim.execReport.preventedLosses)}</p>
              </div>
            </div>

            {/* Top Fraud Features */}
            {sim.execReport.topFraudFeatures.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Top Fraud Indicators</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {sim.execReport.topFraudFeatures.slice(0, 10).map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                      <p className="text-xs font-mono font-bold text-red-400">{f.feature}</p>
                      <p className="text-[10px] text-white/50 mt-1">{f.count} cases • {f.avgImportance.toFixed(1)}% avg</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-400 mb-3">🤖 AI Recommendations</h4>
              <div className="space-y-2">
                {sim.execReport.aiRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white/70">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <AdvancedButton variant="gradient" glow icon={<Download className="w-4 h-4" />} onClick={() => {
                const report = sim.execReport!;
                const text = `EXECUTIVE REPORT - Fraud Detection Simulation\n${'='.repeat(50)}\n\nTotal Transactions: ${report.totalTransactions}\nApproved: ${report.approved}\nBlocked: ${report.blocked}\nManual Review: ${report.manualReview}\nFraud Rate: ${report.fraudPercent.toFixed(2)}%\nLegitimate Rate: ${report.legitimatePercent.toFixed(2)}%\nAvg Confidence: ${report.averageConfidence.toFixed(1)}%\nAvg Risk Score: ${report.averageRiskScore.toFixed(1)}\nTotal Approved: ${formatCurrency(report.totalAmountApproved)}\nTotal Blocked: ${formatCurrency(report.totalAmountBlocked)}\nPrevented Losses: ${formatCurrency(report.preventedLosses)}\nDuration: ${report.simulationDuration}\n\nTop Fraud Features:\n${report.topFraudFeatures.slice(0, 10).map(f => `  ${f.feature}: ${f.count} cases, ${f.avgImportance.toFixed(1)}% avg importance`).join('\n')}\n\nAI Recommendations:\n${report.aiRecommendations.map(r => `  • ${r}`).join('\n')}`;
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fraud_detection_report.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Download Report (TXT)
              </AdvancedButton>
              <AdvancedButton variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => {
                const report = sim.execReport!;
                const csv = `Metric,Value\nTotal Transactions,${report.totalTransactions}\nApproved,${report.approved}\nBlocked,${report.blocked}\nManual Review,${report.manualReview}\nFraud Rate (%),${report.fraudPercent.toFixed(2)}\nLegitimate Rate (%),${report.legitimatePercent.toFixed(2)}\nAvg Confidence (%),${report.averageConfidence.toFixed(1)}\nAvg Risk Score,${report.averageRiskScore.toFixed(1)}\nTotal Amount Approved,${report.totalAmountApproved}\nTotal Amount Blocked,${report.totalAmountBlocked}\nPrevented Losses,${report.preventedLosses}\nDuration,${report.simulationDuration}\n`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fraud_detection_report.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Download CSV
              </AdvancedButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ─── Error State ─── */}
      {sim.backendError && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
          <p className="text-sm text-red-300/80 mb-4">{sim.backendError}</p>
          <button onClick={() => { setCsvPreview(null); setFile(null); }} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchPredict;