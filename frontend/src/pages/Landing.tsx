import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Brain, Zap, BarChart3, ArrowRight, Sparkles, CreditCard,
  Activity, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import AdvancedButton from '../components/ui/AdvancedButton';
import GlassCard from '../components/ui/GlassCard';

const Landing: React.FC = () => {
  const navigate = useNavigate();

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
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">AI-Powered Fraud Detection</span>
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
            Enterprise-grade ML fraud detection with 99.91% accuracy. Upload your CSV and get instant predictions.
          </motion.p>
        </motion.div>
      </section>

      {/* Upload Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-2">
            <GlassCard gradient glow>
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30"
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-3">Upload Transaction CSV</h2>
                <p className="text-white/50 mb-8 text-center max-w-xl text-lg">
                  Upload a credit card transaction CSV to start <span className="text-emerald-400 font-semibold">real-time fraud monitoring</span>.
                  Transactions will be analyzed instantly with AI.
                </p>
                <AdvancedButton
                  variant="gradient"
                  size="lg"
                  glow
                  icon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Upload & Start Detection
                </AdvancedButton>
                <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/30">
                  <span>📊 Supports up to 1,000,000 transactions</span>
                  <span>🔢 30 features (V1-V28, Time, Amount)</span>
                  <span>⚡ Real-time predictions via ML model</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            <GlassCard gradient>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-400" /> Model Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Accuracy</span>
                  <span className="text-sm font-bold text-emerald-400">99.91%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">ROC-AUC</span>
                  <span className="text-sm font-bold text-blue-400">0.9999</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Precision</span>
                  <span className="text-sm font-bold text-purple-400">98.5%</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard gradient>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-400" /> Features
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Real-time batch predictions
                </li>
                <li className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Explainable AI insights
                </li>
                <li className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Fraud alerts & notifications
                </li>
                <li className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Transaction cancellation
                </li>
              </ul>
            </GlassCard>

            {/* CTA */}
            <GlassCard gradient glow>
              <div className="text-center">
                <p className="text-sm text-white/60 mb-3">Ready to start detecting fraud?</p>
                <AdvancedButton
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
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
            <span>FraudShield AI • Enterprise-grade fraud detection</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
