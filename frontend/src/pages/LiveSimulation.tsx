import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, RotateCcw, FastForward, Gauge,
  Activity, ShieldAlert, ShieldCheck, ShieldQuestion, Clock,
  TrendingUp, AlertTriangle, Zap, BarChart3, LineChart,
  PieChart, ArrowUpRight, ArrowDownRight, Flame
} from 'lucide-react';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import GlassCard from '../components/ui/GlassCard';
import RiskGauge from '../components/ui/RiskGauge';
import { toast } from 'react-hot-toast';

const LiveSimulation: React.FC = () => {
  const {
    simState,
    predictions,
    highRiskQueue,
    criticalFraudQueue,
    timeSeries,
    liveStats,
    liveFeed,
    liveAnalytics,
    csvAnalytics,
    postAnalytics,
    execReport,
    alertTriggered,
    isLoadingBackend,
    backendError,
    configInterval,
    loadCSV,
    start,
    pause,
    resume,
    stop,
    setSpeed,
    setBatchSize,
    setConfigInterval,
    clearAlert,
    processSingleTransaction,
  } = useSimulationEngine();

  const [speed, setSpeedLocal] = useState(1);
  const [showDetails, setShowDetails] = useState<any | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [liveFeed.length]);

  // SSE connection when running
  useEffect(() => {
    let simulationId: string | null = null;
    let eventSource: EventSource | null = null;

    const connectSSE = async () => {
      if (simState.status !== 'running') return;
      
      try {
        // Start simulation on backend
        const startRes = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
        const startData = await startRes.json();
        simulationId = startData.simulation_id;

        // Connect to SSE stream
        eventSource = new EventSource(`${API_BASE}/simulation/${simulationId}/stream`);
        
        eventSource.onmessage = (event) => {
          try {
            const tx = JSON.parse(event.data);
            if (tx.error) {
              console.error('Simulation error:', tx.error);
              return;
            }
            // The backend stream_transactions already yields full prediction objects
            // We reuse the frontend hook's processing via a custom handler
            handleIncomingTransaction(tx);
          } catch (e) {
            console.error('Failed to parse SSE data', e);
          }
        };

        eventSource.onerror = () => {
          console.error('SSE connection error');
          eventSource?.close();
        };
      } catch (e) {
        console.error('Failed to start simulation:', e);
        toast.error('Failed to connect to simulation engine');
      }
    };

    connectSSE();

    return () => {
      eventSource?.close();
      if (simulationId) {
        fetch(`${API_BASE}/simulation/${simulationId}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' }),
        }).catch(() => {});
      }
    };
  }, [simState.status]);

  // Poll stats when running
  useEffect(() => {
    if (simState.status !== 'running') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = window.setInterval(async () => {
      // Stats polling could be added here if needed
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [simState.status]);

  const handleIncomingTransaction = (tx: any) => {
    // Wire SSE predictions directly into the simulation engine state
    if (typeof processSingleTransaction === 'function') {
      processSingleTransaction(tx);
    }
  };

  const speeds = [100, 250, 500, 1000];
  const speedLabels: Record<number, string> = { 100: '1x', 250: '2x', 500: '5x', 1000: '10x' };

  const handleStart = async () => {
    if (!csvAnalytics && predictions.length === 0) {
      try {
        setSpeedLocal(100);
        setConfigInterval(100);
        await start();
        toast.success('Simulation started');
      } catch (e) {
        toast.error('Failed to start simulation');
      }
    } else {
      await start();
    }
  };

  const handleLoadCSV = async () => {
    // No file input needed: use built-in dataset
    await handleStart();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6 relative">
      {/* Alert Overlay */}
      <AnimatePresence>
        {alertTriggered && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <GlassCard className="p-4 border-red-500/50 bg-red-500/10 backdrop-blur-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-red-300 font-bold">Critical Fraud Detected</h3>
                <p className="text-red-200/80 text-sm">
                  Transaction #{alertTriggered.transaction_id} • {formatCurrency(alertTriggered.amount)} • Risk {alertTriggered.risk_score}%
                </p>
              </div>
              <button onClick={clearAlert} className="text-red-300 hover:text-white">&times;</button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Live Banking Simulation
          </h1>
          <p className="text-white/50 text-sm mt-1">Real-time fraud monitoring engine — streaming transactions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
            {speeds.map((ms) => (
              <button
                key={ms}
                onClick={() => {
                  setSpeedLocal(ms);
                  setConfigInterval(ms);
                  setSpeed(ms === 100 ? 1 : ms === 250 ? 2 : ms === 500 ? 5 : 10);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  configInterval === ms
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {speedLabels[ms]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleStart}
            disabled={simState.status === 'running'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Start
          </button>
          <button
            onClick={pause}
            disabled={simState.status !== 'running'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500/20 disabled:opacity-50"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
          <button
            onClick={resume}
            disabled={simState.status !== 'paused'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-50"
          >
            <Activity className="w-4 h-4" /> Resume
          </button>
          <button
            onClick={stop}
            disabled={simState.status === 'idle'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
          >
            <Square className="w-4 h-4" /> Stop
          </button>
          <button
            onClick={handleLoadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>

          <div className="ml-auto flex items-center gap-4 text-sm text-white/60">
            {simState.status === 'running' && (
              <span className="flex items-center gap-1 animate-pulse text-emerald-400">
                <Activity className="w-4 h-4" /> LIVE
              </span>
            )}
            {simState.status === 'paused' && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Clock className="w-4 h-4" /> PAUSED
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          { label: 'Processed', value: liveStats.processedCount, icon: BarChart3, color: 'blue' },
          { label: 'Remaining', value: liveStats.remainingCount, icon: Clock, color: 'slate' },
          { label: 'Fraud', value: liveStats.fraudCount, icon: ShieldAlert, color: 'red' },
          { label: 'Legitimate', value: liveStats.legitimateCount, icon: ShieldCheck, color: 'emerald' },
          { label: 'Fraud Rate', value: `${((liveStats.fraudCount / (liveStats.processedCount || 1)) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'orange' },
          { label: 'Speed', value: liveStats.currentSpeed, icon: Zap, color: 'yellow' },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Transaction Feed */}
        <GlassCard className="xl:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Live Transaction Feed
            </h2>
            <span className="text-xs text-white/40">Auto-scrolling</span>
          </div>
          <div ref={feedRef} className="h-[600px] overflow-y-auto p-4 space-y-2">
            {liveFeed.length === 0 && (
              <div className="flex items-center justify-center h-full text-white/30">
                <p>Start simulation to see live transactions</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {liveFeed.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => entry.prediction && setShowDetails(entry.prediction)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    entry.type === 'DECLINED'
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                      : entry.type === 'ALERT'
                      ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40'
                      : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        entry.type === 'DECLINED' ? 'bg-red-500/20' : entry.type === 'ALERT' ? 'bg-orange-500/20' : 'bg-emerald-500/20'
                      }`}>
                        {entry.type === 'DECLINED' ? (
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                        ) : entry.type === 'ALERT' ? (
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          #{entry.transactionId}
                        </p>
                        <p className="text-xs text-white/40">{entry.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(entry.amount)}</p>
                      <p className="text-xs text-white/40">Risk: {entry.riskScore.toFixed(0)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Right Panel - Details & Alerts */}
        <div className="space-y-6">
          {/* Fraud Alerts */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> High Risk Alerts
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {highRiskQueue.length === 0 && (
                <p className="text-sm text-white/30">No high-risk transactions yet</p>
              )}
              {highRiskQueue.slice(0, 10).map((tx) => (
                <div
                  key={tx.transaction_id}
                  onClick={() => setShowDetails(tx)}
                  className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 cursor-pointer hover:bg-red-500/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-red-300">#{tx.transaction_id}</span>
                    <span className="text-xs text-red-400">{tx.risk_score.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Risk Gauge */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-white mb-4">Average Risk</h3>
            <RiskGauge value={liveStats.averageRiskScore} />
          </GlassCard>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                <button onClick={() => setShowDetails(null)} className="text-white/50 hover:text-white">&times;</button>
              </div>
              <pre className="text-xs text-white/70 overflow-x-auto bg-white/5 p-4 rounded-xl">
                {JSON.stringify(showDetails, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSimulation;
