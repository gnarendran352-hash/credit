import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Brain, Zap, BarChart3, ArrowRight, Sparkles, CreditCard,
  Activity, TrendingUp, AlertTriangle, CheckCircle, X, Radio,
  DollarSign, Clock, Gauge, Ban, ShieldOff
} from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import AdvancedButton from '../components/ui/AdvancedButton';
import GlassCard from '../components/ui/GlassCard';
import RiskGauge from '../components/ui/RiskGauge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [txFeed, setTxFeed] = useState<any[]>([]);
  const [stats, setStats] = useState({ processed: 0, fraud: 0, legitimate: 0 });
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let simulationId: string | null = null;
    let eventSource: EventSource | null = null;
    let mounted = true;

    const startSimulation = async () => {
      try {
        // Start simulation on backend
        const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
        const data = await res.json();
        simulationId = data.simulation_id;

        if (!mounted) return;

        // Connect SSE stream
        eventSource = new EventSource(`${API_BASE}/simulation/${simulationId}/stream`);
        eventSource.onmessage = (event) => {
          if (!mounted) return;
          try {
            const tx = JSON.parse(event.data);
            if (tx.error) return;
            setCurrentTx(tx);
            setStats(prev => ({
              processed: prev.processed + 1,
              fraud: prev.fraud + (tx.prediction === 'Fraud' ? 1 : 0),
              legitimate: prev.legitimate + (tx.prediction === 'Legitimate' ? 1 : 0),
            }));
            setTxFeed(prev => [{
              id: `tx-${tx.transaction_id}-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: tx.prediction === 'Fraud' ? 'DECLINED' : 'APPROVED',
              amount: tx.amount,
              transactionId: tx.transaction_id,
              riskScore: tx.risk_score,
              prediction: tx.prediction,
            }, ...prev].slice(0, 100));
            setConnected(true);
          } catch (e) {}
        };

        eventSource.onerror = () => {
          if (mounted) {
            // Reconnect after 2s
            setTimeout(() => { eventSource?.close(); startSimulation(); }, 2000);
          }
        };
      } catch (e) {
        if (mounted) setTimeout(startSimulation, 2000);
      }
    };

    startSimulation();

    return () => {
      mounted = false;
      eventSource?.close();
      if (simulationId) {
        fetch(`${API_BASE}/simulation/${simulationId}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' }),
        }).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [txFeed.length]);

  return (
    <div className="min-h-screen bg-[#050510] overflow-y-auto relative">
      <AnimatedBackground />

      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FraudShield</span>
        </div>
        <div className="flex items-center gap-4">
          {connected && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20"
          >
            Full Dashboard →
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4"
          >
            <Radio className={`w-4 h-4 ${connected ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{connected ? 'LIVE — Streaming creditcard_2023.csv' : 'Connecting to simulation...'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-4"
          >
            Real-Time Fraud Detection{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
              in Action
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-8"
          >
            Streaming creditcard_2023.csv through the ML model — watching each transaction live with AI-powered fraud detection
          </motion.p>
        </motion.div>
      </section>

      {/* Live Stats + Feed */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Live Feed */}
          <div className="lg:col-span-2">
            <GlassCard className="p-0 overflow-hidden" gradient>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-semibold text-white text-sm">Live Transaction Feed</h2>
                </div>
                <span className="text-xs text-white/40">{stats.processed} processed</span>
              </div>
              <div ref={feedRef} className="h-[500px] overflow-y-auto p-3 space-y-1.5">
                {txFeed.length === 0 && (
                  <div className="flex items-center justify-center h-full text-white/30 text-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                      Streaming transactions...
                    </div>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {txFeed.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`p-2.5 rounded-xl border cursor-default transition-all ${
                        entry.type === 'DECLINED'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            entry.type === 'DECLINED' ? 'bg-red-500' : 'bg-emerald-500'
                          }`}>
                            {entry.type === 'DECLINED' ? (
                              <X className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">
                              #{entry.transactionId}
                            </p>
                            <p className="text-[10px] text-white/40">{entry.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-white">{formatCurrency(entry.amount)}</p>
                          <p className={`text-[10px] ${
                            entry.type === 'DECLINED' ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {entry.type === 'DECLINED' ? '🚨 BLOCKED' : '✅ APPROVED'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>

          {/* Right: Stats Panel */}
          <div className="space-y-4">
            {/* Current Transaction */}
            <GlassCard gradient>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-400" /> Current Transaction
              </h3>
              {currentTx ? (
                <div className="space-y-2">
                  <div className={`p-3 rounded-xl border ${
                    currentTx.prediction === 'Fraud' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">#{currentTx.transaction_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        currentTx.prediction === 'Fraud' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {currentTx.prediction === 'Fraud' ? 'FRAUD' : 'SAFE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Amount</span>
                      <span className="text-white font-semibold">{formatCurrency(currentTx.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-white/60">Risk Score</span>
                      <span className={`font-bold ${
                        currentTx.risk_score > 70 ? 'text-red-400' : currentTx.risk_score > 30 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {currentTx.risk_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-white/60">Confidence</span>
                      <span className="text-blue-400 font-bold">{currentTx.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-white/60">Decision</span>
                      <span className={`text-xs font-bold ${
                        currentTx.decision?.decision === 'APPROVE' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {currentTx.decision?.decision?.replace(/_/g, ' ') || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  {currentTx.explanation?.summary && (
                    <p className="text-[10px] text-white/40 italic line-clamp-2">
                      {currentTx.explanation.summary}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-white/30 text-xs">
                  Waiting for transactions...
                </div>
              )}
            </GlassCard>

            {/* Live Stats */}
            <GlassCard gradient>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Live Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <p className="text-[10px] text-white/40">Processed</p>
                  </div>
                  <p className="text-lg font-bold text-white">{stats.processed.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <p className="text-[10px] text-white/40">Fraud</p>
                  </div>
                  <p className="text-lg font-bold text-red-400">{stats.fraud.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <p className="text-[10px] text-white/40">Safe</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-400">{stats.legitimate.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Gauge className="w-3 h-3 text-purple-400" />
                    <p className="text-[10px] text-white/40">Fraud Rate</p>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {stats.processed > 0 ? ((stats.fraud / stats.processed) * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Risk Gauge */}
            {currentTx && (
              <GlassCard gradient>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" /> Risk Level
                </h3>
                <RiskGauge
                  value={currentTx.risk_score}
                  size={140}
                  label={`TX #${currentTx.transaction_id}`}
                />
              </GlassCard>
            )}

            {/* CTA */}
            <GlassCard gradient glow>
              <div className="text-center">
                <p className="text-sm text-white/60 mb-3">View full analysis with charts, history & reports</p>
                <AdvancedButton
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Open Full Dashboard
                </AdvancedButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <CreditCard className="w-4 h-4" />
            <span>FraudShield AI • Simulating creditcard_2023.csv</span>
          </div>
          <div className="flex items-center gap-4 text-white/30 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {stats.processed} transactions streamed
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;