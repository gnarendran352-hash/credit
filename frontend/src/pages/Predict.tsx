import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Shield, AlertTriangle, CheckCircle, Zap, ChevronDown, ChevronUp, Activity, BarChart3, Lock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { predictTransaction } from '../services/api';
import type { PredictionInput, PredictionResult } from '../types';

const Predict: React.FC = () => {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { register, handleSubmit } = useForm<PredictionInput>();

  const onSubmit = async (data: PredictionInput) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await predictTransaction(data);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Predict Transaction</h1>
        <p className="text-white/40 mt-1">Analyze a single transaction for fraud detection</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <GlassCard gradient>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Time</label>
                <input
                  type="number"
                  step="any"
                  {...register('time', { required: true })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Amount</label>
                <input
                  type="number"
                  step="any"
                  {...register('amount', { required: true })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Hide V1-V28 Fields' : 'Show V1-V28 Fields'}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {Array.from({ length: 28 }, (_, i) => (
                      <div key={i}>
                        <label className="block text-xs text-white/40 mb-1">V{i + 1}</label>
                        <input
                          type="number"
                          step="any"
                          {...register(`v${i + 1}` as keyof PredictionInput, { required: true })}
                          placeholder="0.0"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Analyze Transaction
                </>
              )}
            </motion.button>
          </form>
        </GlassCard>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard gradient className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  {result.prediction === 1 ? (
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {result.prediction === 1 ? 'Fraud Detected' : 'Transaction Safe'}
                    </h3>
                    <p className={`text-sm ${result.prediction === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.risk_level} Risk • {result.confidence.toFixed(1)}% Confidence
                    </p>
                  </div>
                </div>

                {/* Gauge */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                        strokeDasharray={`${result.risk_score} ${100 - result.risk_score}`}
                        className={`${result.risk_level === 'Low' ? 'text-emerald-500' : result.risk_level === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${result.risk_level === 'Low' ? 'text-emerald-400' : result.risk_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                          {result.risk_score.toFixed(0)}
                        </div>
                        <div className="text-xs text-white/40">Risk Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white/60">Fraud Probability</span>
                    </div>
                    <span className="text-sm text-white">{(result.fraud_probability * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white/60">Prediction Time</span>
                    </div>
                    <span className="text-sm text-white">{result.prediction_time_ms.toFixed(1)}ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-white/60">Confidence</span>
                    </div>
                    <span className="text-sm text-white">{result.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white/60">Model</span>
                    </div>
                    <span className="text-sm text-white capitalize">{result.model_used}</span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className={`mt-4 p-4 rounded-xl border ${result.risk_level === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20' : result.risk_level === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`w-5 h-5 ${result.risk_level === 'Low' ? 'text-emerald-400' : result.risk_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`} />
                    <span className={`font-semibold ${result.risk_level === 'Low' ? 'text-emerald-400' : result.risk_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.recommended_action === 'approve' ? 'Approve Transaction' : result.recommended_action === 'review' ? 'Manual Review Required' : 'Block Transaction'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{result.explanation}</p>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <GlassCard gradient className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-blue-500/30 mx-auto mb-4" />
                  <p className="text-white/40">Submit a transaction to see the prediction result</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Predict;