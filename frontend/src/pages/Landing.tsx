import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Zap, Cloud, BarChart3, ArrowRight, Sparkles, CreditCard, Database, Activity } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    className={`absolute backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050510] overflow-hidden relative">
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
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Fraud Detection</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                AI Powered{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
                  Credit Card
                </span>{' '}
                Fraud Detection
              </h1>
              <p className="text-lg text-white/50 mb-8 max-w-lg">
                Enterprise-grade machine learning platform that detects and prevents credit card fraud in real-time with 99.91% accuracy.
              </p>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  View Dashboard
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { value: '284k+', label: 'Transactions' },
                { value: '99.91%', label: 'Accuracy' },
                { value: '<50ms', label: 'RT Detection' },
                { value: '0.976', label: 'ROC-AUC' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Floating cards illustration */}
          <div className="relative h-[500px] hidden lg:block">
            <FloatingCard delay={0.2} className="top-10 left-0 w-64">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">Real-time Monitor</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Processing: 1,247 TX/s</span>
                  <span>75%</span>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.4} className="top-20 right-0 w-56">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Risk Score</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">87.3</div>
              <div className="text-xs text-white/40">High Risk • Manual Review</div>
            </FloatingCard>

            <FloatingCard delay={0.6} className="bottom-10 left-10 w-60">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">AI Prediction</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm">Fraud Detected</span>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.8} className="bottom-20 right-10 w-52">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-white">99.91%</div>
            </FloatingCard>

            {/* Neural network lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
              <line x1="50" y1="80" x2="200" y2="100" stroke="#3b82f6" strokeWidth="1" />
              <line x1="200" y1="100" x2="250" y2="250" stroke="#8b5cf6" strokeWidth="1" />
              <line x1="50" y1="80" x2="100" y2="300" stroke="#3b82f6" strokeWidth="1" />
              <line x1="100" y1="300" x2="250" y2="250" stroke="#10b981" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade Features</h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Built for financial institutions that demand the highest level of fraud protection
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'Machine Learning', desc: 'Random Forest model with 99.91% accuracy trained on 284k+ transactions', color: 'from-blue-500 to-cyan-500' },
            { icon: Shield, title: 'Real-Time Detection', desc: 'Predict fraudulent transactions in under 50ms with explainable AI', color: 'from-purple-500 to-pink-500' },
            { icon: Zap, title: 'Risk Scoring', desc: 'Multi-level risk scoring with automated recommended actions', color: 'from-emerald-500 to-teal-500' },
            { icon: Brain, title: 'Explainable AI', desc: 'Understand why each transaction was flagged with feature importance analysis', color: 'from-orange-500 to-red-500' },
            { icon: Cloud, title: 'FastAPI Backend', desc: 'High-performance async Python backend with automatic model serving', color: 'from-blue-500 to-violet-500' },
            { icon: Database, title: 'Firebase Cloud', desc: 'Secure cloud storage with real-time sync and authentication', color: 'from-yellow-500 to-orange-500' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <CreditCard className="w-4 h-4" />
            <span>FraudShield AI • 2026</span>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;