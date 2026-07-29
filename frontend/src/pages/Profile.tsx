import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Activity, TrendingUp, Award, Clock, MapPin, Smartphone, Globe } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const activityStats = [
    { label: 'Predictions Made', value: '1,247', icon: Activity, color: 'text-blue-400', gradient: 'from-blue-500/20 to-cyan-500/10' },
    { label: 'Fraud Detected', value: '23', icon: Shield, color: 'text-red-400', gradient: 'from-red-500/20 to-orange-500/10' },
    { label: 'Accuracy Rate', value: '99.91%', icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/10' },
    { label: 'Reports Generated', value: '45', icon: Award, color: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/10' },
  ];

  const recentActivity = [
    { action: 'Batch Prediction', detail: '2,500 transactions processed', time: '2 hours ago', icon: Activity },
    { action: 'Report Generated', detail: 'Monthly Threat Analysis', time: '1 day ago', icon: Shield },
    { action: 'Model Updated', detail: 'Accuracy improved to 99.91%', time: '3 days ago', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Profile</h1>
          <p className="text-white/40 mt-1">Manage your account and view activity</p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard gradient>
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-[#050510] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user?.email?.split('@')[0] || 'User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-white/40" />
                  <p className="text-sm text-white/60">{user?.email || 'No email available'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined March 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Award className="w-3.5 h-3.5" />
                    <span>Premium User</span>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3">
                {[
                  { value: '284', label: 'Days' },
                  { value: '1.2k', label: 'Actions' },
                  { value: '99%', label: 'Uptime' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5 min-w-[80px]">
                    <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activityStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <GlassCard gradient>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-white/40">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassCard gradient>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-xs text-white/40">Your latest actions</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.action}</p>
                  <p className="text-xs text-white/40">{item.detail}</p>
                </div>
                <span className="text-xs text-white/30">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Account Details */}
        <GlassCard gradient>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Account Details</h3>
              <p className="text-xs text-white/40">Security & preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: user?.email || 'N/A', color: 'text-blue-400' },
              { icon: Shield, label: 'Two-Factor Auth', value: 'Enabled', color: 'text-emerald-400' },
              { icon: Smartphone, label: 'Device', value: 'Chrome on Windows', color: 'text-purple-400' },
              { icon: Globe, label: 'Last Login IP', value: '192.168.x.x', color: 'text-cyan-400' },
              { icon: MapPin, label: 'Location', value: 'India', color: 'text-yellow-400' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-white/60">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white/80">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;