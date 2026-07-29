import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Moon, Sun, User, LogOut, Settings as SettingsIcon, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time?: string;
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications] = useState<Notification[]>([
    { id: 1, title: 'Fraud Alert', message: 'High risk transaction #8921 detected', type: 'alert', time: '2 min ago' },
    { id: 2, title: 'Model Update', message: 'Model accuracy improved to 99.91%', type: 'success', time: '1 hour ago' },
    { id: 3, title: 'Batch Complete', message: 'CSV processing completed for 2,500 transactions', type: 'info', time: '3 hours ago' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'success': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default: return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-500/10 border-red-500/20';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur-2xl bg-black/30 border-b border-white/10"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
          <motion.input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, IDs, users..."
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />

          {/* Search suggestions */}
          <AnimatePresence>
            {showSearch && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-xl backdrop-blur-2xl bg-black/80 border border-white/10 shadow-xl overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {['Transaction #8921 - High Risk', 'Transaction #4523 - Legitimate', 'Batch CSV - 2500 records'].map((item, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <Search className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          {/* Clock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/50 font-mono"
          >
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <Bell className="w-4 h-4" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold"
              >
                {notifications.length}
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl backdrop-blur-2xl bg-black/80 border border-white/10 shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-white/70" />
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Mark all read</button>
                  </div>
                  <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-xl ${getNotificationBg(notif.type)} flex items-start gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-white/60 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-white/40 mt-1">{notif.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-white/90 leading-tight">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-white/40">Online</p>
              </div>
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl backdrop-blur-2xl bg-black/80 border border-white/10 shadow-xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="p-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-white/40 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => { navigate('/dashboard/profile'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <User className="w-4 h-4" /> Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => { navigate('/dashboard/settings'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <SettingsIcon className="w-4 h-4" /> Settings
                    </motion.button>
                  </div>

                  <div className="border-t border-white/10 p-2">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => { logout(); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
