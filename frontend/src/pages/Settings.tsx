import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Eye, Key, Save } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AdvancedButton from '../components/ui/AdvancedButton';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      items: [
        { label: 'Fraud Alerts', desc: 'Real-time notifications for high-risk transactions', enabled: true },
        { label: 'Batch Complete', desc: 'When CSV batch processing finishes', enabled: true },
        { label: 'Model Updates', desc: 'When model accuracy or performance changes', enabled: false },
        { label: 'Weekly Reports', desc: 'Weekly summary of fraud detection activity', enabled: true },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      gradient: 'from-purple-500/20 to-pink-500/10',
      items: [
        { label: 'Two-Factor Auth', desc: 'Additional security layer for your account', enabled: true },
        { label: 'Login Notifications', desc: 'Get notified on new device logins', enabled: true },
        { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: false },
      ],
    },
    {
      title: 'Display',
      icon: Eye,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      items: [
        { label: 'Dark Mode', desc: 'Toggle dark/light theme preference', enabled: theme === 'dark' },
        { label: 'Compact View', desc: 'Show more content with reduced spacing', enabled: false },
        { label: 'Animations', desc: 'Enable smooth transitions and effects', enabled: true },
      ],
    },
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Settings</h1>
          <p className="text-white/40 mt-1">Customize your experience</p>
        </div>
        <AdvancedButton
          variant="gradient"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </AdvancedButton>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <GlassCard gradient>
              <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-2xl pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-xs text-white/40">Manage your {section.title.toLowerCase()} preferences</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (item.label === 'Dark Mode') toggleTheme();
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          item.enabled ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/10'
                        }`}
                      >
                        <motion.div
                          animate={{ x: item.enabled ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard gradient>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              <p className="text-xs text-white/40">Irreversible account actions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-white/40 mt-0.5">Permanently delete your account and all data</p>
              </div>
              <AdvancedButton variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                Delete
              </AdvancedButton>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div>
                <p className="text-sm font-medium text-white">Export All Data</p>
                <p className="text-xs text-white/40 mt-0.5">Download all your predictions and reports</p>
              </div>
              <AdvancedButton variant="secondary" size="sm">
                Export
              </AdvancedButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Settings;