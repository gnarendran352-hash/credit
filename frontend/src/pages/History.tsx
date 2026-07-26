import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { PredictionRecord } from '../types';

const History: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'predictions'),
          orderBy('timestamp', 'desc'),
          limit(perPage)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PredictionRecord));
        setRecords(items);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'predictions', id));
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const filtered = records.filter(r =>
    r.amount?.toString().includes(search) ||
    r.riskLevel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Prediction History</h1>
        <p className="text-white/40 mt-1">View and manage past predictions</p>
      </motion.div>

      <GlassCard gradient>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by amount or risk level..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">No predictions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Risk Score</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Risk Level</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Prediction</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-xs text-white/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-white">${record.amount?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        record.riskScore > 70 ? 'text-red-400' : record.riskScore > 30 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {record.riskScore?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        record.riskLevel === 'High' ? 'bg-red-500/10 text-red-400' :
                        record.riskLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {record.riskLevel === 'High' ? <AlertTriangle className="w-3 h-3" /> :
                         record.riskLevel === 'Medium' ? <AlertTriangle className="w-3 h-3" /> :
                         <CheckCircle className="w-3 h-3" />}
                        {record.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${record.prediction === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {record.prediction === 1 ? 'Fraud' : 'Safe'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/40">
                      {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-sm text-white/40">{filtered.length} records</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white/60">Page {page}</span>
            <button className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default History;