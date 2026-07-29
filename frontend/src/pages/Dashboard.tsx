import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, CheckCircle, AlertTriangle, TrendingUp, Brain, Activity, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import RiskGauge from '../components/ui/RiskGauge';
import { getHealthStatus, getModelMetrics } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statCards = [
  { title: 'Total Transactions', value: '284,807', icon: CreditCard, change: '+12.5%', color: 'from-blue-500 to-cyan-500', subtext: 'All time' },
  { title: 'Fraud Detected', value: '492', icon: AlertTriangle, change: '-2.1%', color: 'from-red-500 to-orange-500', subtext: 'Flagged transactions' },
  { title: 'Legitimate', value: '284,315', icon: CheckCircle, change: '+12.7%', color: 'from-emerald-500 to-teal-500', subtext: 'Safe transactions' },
  { title: 'Fraud Rate', value: '0.17%', icon: Shield, change: '-0.02%', color: 'from-purple-500 to-pink-500', subtext: 'Of total volume' },
];

const pieData = [
  { name: 'Legitimate', value: 284315, color: '#10b981' },
  { name: 'Fraud', value: 492, color: '#ef4444' },
];

const dailyData = [
  { day: 'Mon', fraud: 65, legitimate: 40500 },
  { day: 'Tue', fraud: 72, legitimate: 41200 },
  { day: 'Wed', fraud: 58, legitimate: 39800 },
  { day: 'Thu', fraud: 84, legitimate: 42100 },
  { day: 'Fri', fraud: 91, legitimate: 43500 },
  { day: 'Sat', fraud: 45, legitimate: 28700 },
  { day: 'Sun', fraud: 52, legitimate: 25600 },
];

const fraudTrendData = [
  { time: '10:28', fraud: 1, legitimate: 120, risk: 12 },
  { time: '10:29', fraud: 0, legitimate: 145, risk: 18 },
  { time: '10:30', fraud: 2, legitimate: 132, risk: 34 },
  { time: '10:31', fraud: 1, legitimate: 128, risk: 22 },
  { time: '10:32', fraud: 3, legitimate: 156, risk: 45 },
  { time: '10:33', fraud: 0, legitimate: 140, risk: 15 },
  { time: '10:34', fraud: 1, legitimate: 138, risk: 28 },
];
const riskData = [
  { range: '0-10', count: 120000 },
  { range: '11-30', count: 98000 },
  { range: '31-50', count: 45000 },
  { range: '51-70', count: 15000 },
  { range: '71-90', count: 4500 },
  { range: '91-100', count: 2307 },
];

const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-white/40 mt-1">Real-time fraud detection overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">System Online</span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard hover glow gradient>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/40">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${card.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-white/30">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg shadow-${card.color.split(' ')[0].replace('from-', '')}/30`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Mini sparkline bar */}
              <div className="flex gap-0.5 mt-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: Math.random() * 24 + 4 }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                    className={`w-1.5 rounded-full bg-gradient-to-t ${card.color} opacity-50`}
                    style={{ height: `${Math.random() * 24 + 4}px` }}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Fraud vs Legitimate</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Distribution</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-white/40">Legitimate (99.83%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-white/40">Fraud (0.17%)</span>
            </div>
          </div>
        </GlassCard>

        {/* Daily Predictions */}
        <GlassCard gradient className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Fraud Trend</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-white/40">Legitimate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-white/40">Fraud</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fraudTrendData}>
                <defs>
                  <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="legitimate" stroke="#10b981" fill="url(#legitGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="fraud" stroke="#ef4444" fill="url(#fraudGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Distribution</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Score Ranges</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1500}>
                  {riskData.map((_entry, index) => {
                    const colors = ['#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk Gauge */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Score</h3>
            <span className="text-xs text-white/30 px-2 py-1 rounded-lg bg-white/5">Current</span>
          </div>
          <div className="flex items-center justify-center">
            <RiskGauge value={45.5} size={200} label="Average Risk" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-white/40">Low</div>
              <div className="text-sm font-semibold text-emerald-400">0-30</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-white/40">Medium</div>
              <div className="text-sm font-semibold text-yellow-400">31-70</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-white/40">High</div>
              <div className="text-sm font-semibold text-red-400">71-100</div>
            </div>
          </div>
        </GlassCard>

        {/* System Status */}
        <GlassCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">System Status</h3>
            <div className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/60">Backend</span>
              </div>
              <span className="text-sm font-medium text-white/80">{health?.status || 'Checking...'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/60">Model</span>
              </div>
              <span className={`text-sm font-medium ${health?.model_loaded ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {health?.model_loaded ? 'Active' : 'Demo Mode'}
              </span>
            </div>
            {metrics && (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white/60">Accuracy</span>
                  </div>
                  <span className="text-sm font-medium text-white/80">{((metrics?.accuracy ?? 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white/60">ROC-AUC</span>
                  </div>
                  <span className="text-sm font-medium text-white/80">{(metrics?.roc_auc ?? 0).toFixed(4)}</span>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;