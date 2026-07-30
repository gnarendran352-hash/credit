import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ban, ShieldAlert, Search, Filter, Download } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { firebaseService } from '../services/firebase';
import type { StoredPrediction } from '../services/firebase';

const BlockedTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToBlockedTransactions((txs) => {
      setTransactions(txs);
    }, 200);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.transaction_id?.toString().includes(searchTerm) ||
                         tx.amount?.toString().includes(searchTerm);
    const matchesRisk = filterRisk === 'all' || tx.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const totalBlocked = transactions.length;
  const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const avgRisk = transactions.length > 0
    ? transactions.reduce((sum, tx) => sum + (tx.risk_score || 0), 0) / transactions.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Blocked Transactions</h1>
          <p className="text-white/50 text-sm mt-1">Fraud prevention monitoring center</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Ban className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Blocked</p>
              <p className="text-2xl font-bold text-white">{totalBlocked.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Loss Prevented</p>
              <p className="text-2xl font-bold text-white">${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Filter className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Average Risk</p>
              <p className="text-2xl font-bold text-white">{avgRisk.toFixed(1)}%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search transaction ID or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
          <button className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </GlassCard>

      {/* Transactions Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Transaction ID</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Risk Level</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Prediction</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-white/50 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Ban className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No blocked transactions found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx, i) => (
                  <motion.tr
                    key={tx.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white font-mono">#{tx.transaction_id}</td>
                    <td className="px-4 py-3 text-sm text-white">${tx.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${tx.risk_score > 70 ? 'text-red-400' : tx.risk_score > 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {tx.risk_score?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${tx.risk_level === 'High' ? 'bg-red-500/20 text-red-300' : tx.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {tx.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-300 font-medium">{tx.prediction}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                        {tx.status || 'BLOCKED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default BlockedTransactions;