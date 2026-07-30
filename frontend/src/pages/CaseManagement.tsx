import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Search, Plus, MessageSquare, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { firebaseService } from '../services/firebase';
import type { StoredCase } from '../services/firebase';

const CaseManagement: React.FC = () => {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<StoredCase | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToCases((c) => {
      setCases(c);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const filtered = cases.filter(c => {
    const matchesSearch = c.id?.includes(searchTerm) || c.transactionId?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    open: { color: 'text-blue-300', bg: 'bg-blue-500/20', icon: AlertCircle },
    investigating: { color: 'text-yellow-300', bg: 'bg-yellow-500/20', icon: Clock },
    resolved: { color: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: CheckCircle },
    false_positive: { color: 'text-purple-300', bg: 'bg-purple-500/20', icon: CheckCircle },
    closed: { color: 'text-white/60', bg: 'bg-white/10', icon: CheckCircle },
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCase?.id) return;
    await firebaseService.addCaseNote(selectedCase.id, newNote, 'current-user');
    setNewNote('');
  };

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    investigating: cases.filter(c => c.status === 'investigating').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Case Management</h1>
          <p className="text-white/50 text-sm mt-1">Fraud investigation tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard gradient>
          <p className="text-xs text-white/50 uppercase tracking-wider">Total Cases</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </GlassCard>
        <GlassCard gradient>
          <p className="text-xs text-white/50 uppercase tracking-wider">Open</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{stats.open}</p>
        </GlassCard>
        <GlassCard gradient>
          <p className="text-xs text-white/50 uppercase tracking-wider">Investigating</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.investigating}</p>
        </GlassCard>
        <GlassCard gradient>
          <p className="text-xs text-white/50 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.resolved}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No cases found</p>
              </div>
            </GlassCard>
          ) : (
            filtered.map((c, i) => {
              const config = statusConfig[c.status] || statusConfig.open;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-2xl border backdrop-blur-xl cursor-pointer transition-all ${selectedCase?.id === c.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">Case #{c.id?.slice(-6)}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mt-1">
                        Transaction: #{c.transactionId}
                        {c.assignedTo && ` • Assigned to: ${c.assignedTo}`}
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'No updates'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Case Details */}
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <GlassCard>
              <h3 className="font-semibold text-white mb-4">Case Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Case ID</p>
                  <p className="text-sm text-white font-mono mt-1">#{selectedCase.id?.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Transaction ID</p>
                  <p className="text-sm text-white font-mono mt-1">#{selectedCase.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-lg text-xs font-medium ${(statusConfig[selectedCase.status] || statusConfig.open).bg} ${(statusConfig[selectedCase.status] || statusConfig.open).color}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Assigned To</p>
                  <p className="text-sm text-white mt-1 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {selectedCase.assignedTo || 'Unassigned'}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Notes</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedCase.notes?.length === 0 ? (
                      <p className="text-xs text-white/30">No notes yet</p>
                    ) : (
                      selectedCase.notes?.map((note: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/80">{note.text}</p>
                          <p className="text-[10px] text-white/40 mt-1">
                            {note.userId} • {note.timestamp ? new Date(note.timestamp).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CaseManagement;