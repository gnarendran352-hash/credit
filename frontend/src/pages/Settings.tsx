import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Shield, Activity, Database } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/40 mt-1">Configure your application preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                <span className="text-sm text-white/60">Theme</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-all"
              >
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/60">Backend API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/60">Firebase</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/60">Model</span>
              </div>
              <span className="text-sm text-white/80">Random Forest</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Settings;