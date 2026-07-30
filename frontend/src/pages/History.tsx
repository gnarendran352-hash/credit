import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Eye, TrendingUp, Shield, AlertTriangle, CheckCircle, Sparkles, Clock, Filter } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { firebaseService } from '../services/firebase';

interface HistoryItem {
  id: string | number;
  date: string;
  type: string;
  file: string;
  records: number;
  fraud: number;
  accuracy: number;
  status: string;
  time: string;
}

const History: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    // In production, subscribe to Firebase predictions here
    setPredictions([]);
  }, []);

  const historyItems: HistoryItem[] = predictions.length > 0 ? predictions.map((p: any, i: number) => ({
    id: p.id || i,
    date: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    type: 'Prediction',
    file: `Transaction #${p.transaction_id || i}`,
    records: 1,
    fraud: p.prediction === 'Fraud' ? 1 : 0,
    accuracy: p.confidence || 0,
    status: p.risk_level === 'High' ? 'flagged' : 'completed',
    time: '0.05s',
  })) : [];

  const filteredItems = historyItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterRisk !== 'all') {
      const itemRisk = predictions[item.id as number]?.risk_level;
      if (filterRisk !== 'all' && itemRisk !== filterRisk) return false;
    }
    if (searchQuery && !item.file.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'flagged': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'flagged': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">History</h1>
          <p className="text-white/40 mt-1">View and search prediction history</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-400 font-medium">{historyItems.length} Records</span>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction ID, date..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'flagged'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Risk Levels</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>
      </motion.div>

      {/* History List */}
      <GlassCard gradient>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredItems.map((item, i) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.file}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-white/40">{new Date(item.date).toLocaleString()}</span>
                          <span className="text-xs text-white/30">•</span>
                          <span className="text-xs text-white/40">{item.type}</span>
                          <span className="text-xs text-white/30">•</span>
                          <span className="text-xs text-white/40">{item.records} records</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="text-xs font-medium capitalize">{item.status}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedItemId !== null && selectedItemId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-white/40">Fraud Detected</p>
                              <p className="text-lg font-bold text-red-400">{item.fraud}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-white/40">Accuracy</p>
                              <p className="text-lg font-bold text-emerald-400">{item.accuracy}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-white/40">Processing Time</p>
                              <p className="text-lg font-bold text-blue-400">{item.time}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-white/40">Total Records</p>
                              <p className="text-lg font-bold text-white">{item.records.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
};

export default History;