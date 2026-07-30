import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, AlertCircle, Shield, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { firebaseService } from '../services/firebase';
import type { StoredNotification } from '../services/firebase';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToNotifications((notifs) => {
      setNotifications(notifs);
    }, 100);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'fraud_alert': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'prediction_success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'upload_complete': return <Info className="w-5 h-5 text-blue-400" />;
      case 'backend_offline': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-white/60" />;
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Notifications</h1>
          <p className="text-white/50 text-sm mt-1">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'unread' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Unread</button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No notifications yet</p>
            </motion.div>
          )}
          {filtered.map((notif, i) => (
            <motion.div
              key={notif.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${notif.read ? 'bg-white/5 border-white/10' : 'bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5'}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{notif.title}</h3>
                  <p className="text-sm text-white/60 mt-1">{notif.message}</p>
                  <p className="text-xs text-white/40 mt-2">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : 'Just now'}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 animate-pulse" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;