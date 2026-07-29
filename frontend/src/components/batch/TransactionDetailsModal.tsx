import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, TrendingUp, Shield, Info } from 'lucide-react';
import type { BatchResultWithClass } from '../../types/batchTypes';
import GlassCard from '../ui/GlassCard';

interface TransactionDetailsModalProps {
  transaction: BatchResultWithClass | null;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <AnimatePresence>
      {transaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a1f] border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a1f]/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
                  <p className="text-sm text-white/40">TXN-{transaction.transaction_id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Prediction Status */}
              <GlassCard gradient className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Prediction Result</h3>
                  <span className={`px-4 py-2 rounded-xl border ${getRiskColor(transaction.risk_level)} font-semibold`}>
                    {transaction.risk_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Prediction</p>
                    <div className="flex items-center gap-2">
                      {transaction.prediction === 'Fraud' ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                      <span className="text-xl font-bold text-white">{transaction.prediction}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Confidence</p>
                    <p className="text-xl font-bold text-white">{transaction.confidence.toFixed(1)}%</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Fraud Probability</p>
                    <p className="text-xl font-bold text-purple-400">{(transaction.probability * 100).toFixed(2)}%</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Risk Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-white">{transaction.risk_score.toFixed(1)}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            transaction.risk_score > 70 ? 'bg-red-400' : transaction.risk_score > 30 ? 'bg-yellow-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, transaction.risk_score)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {transaction.amount !== undefined && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Transaction Amount</p>
                    <p className="text-2xl font-bold text-white">${transaction.amount.toFixed(2)}</p>
                  </div>
                )}
              </GlassCard>

              {/* Top Important Features */}
              {transaction.top_features && transaction.top_features.length > 0 && (
                <GlassCard gradient className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Top Important Features</h3>
                  </div>

                  <div className="space-y-3">
                    {transaction.top_features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-white/40 w-6">{index + 1}.</span>
                        <span className="text-sm font-medium text-white flex-1">{feature.feature}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${feature.importance}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 w-12 text-right">{feature.importance.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* AI Explanation */}
              {transaction.explanation && (
                <GlassCard gradient className="p-6 border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">AI Explanation</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{transaction.explanation}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Actual vs Predicted (if Class column exists) */}
              {transaction.actual_label && (
                <GlassCard gradient className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Actual vs Predicted</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Actual Class</p>
                      <p className="text-lg font-bold text-white">{transaction.actual_label}</p>
                    </div>
                    <div className="text-2xl text-white/20">→</div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Predicted Class</p>
                      <p className="text-lg font-bold text-white">{transaction.prediction}</p>
                    </div>
                    <div>
                      {transaction.is_correct ? (
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailsModal;