import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Activity, CreditCard } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-white/40 mt-1">Your account information</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard gradient className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-sm text-white/40 mb-4">{user?.email}</p>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
              <Shield className="w-3 h-3" />
              Analyst
            </div>
          </div>
        </GlassCard>

        <GlassCard gradient className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/60">Email</span>
              </div>
              <span className="text-sm text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/60">Member Since</span>
              </div>
              <span className="text-sm text-white/80">July 2026</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/60">Predictions Made</span>
              </div>
              <span className="text-sm text-white">0</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/60">Last Login</span>
              </div>
              <span className="text-sm text-white/80">Just now</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;