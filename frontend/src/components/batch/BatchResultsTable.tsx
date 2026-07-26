import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import type { BatchResultWithClass } from '../../types/batchTypes';
import GlassCard from '../ui/GlassCard';

interface BatchResultsTableProps {
  predictions: BatchResultWithClass[];
  hasClassColumn?: boolean;
}

type SortKey = 'transaction_id' | 'risk_score' | 'probability' | 'amount' | 'confidence';
type SortOrder = 'asc' | 'desc';
type FilterKey = 'all' | 'High' | 'Medium' | 'Low' | 'Fraud' | 'Legitimate';

const BatchResultsTable: React.FC<BatchResultsTableProps> = ({ predictions, hasClassColumn }) => {
  const [sortKey, setSortKey] = useState<SortKey>('risk_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedAndFiltered = useMemo(() => {
    let result = [...predictions];

    // Apply filter
    if (filter !== 'all') {
      if (filter === 'Fraud' || filter === 'Legitimate') {
        result = result.filter(p => p.prediction === filter);
      } else {
        result = result.filter(p => p.risk_level === filter);
      }
    }

    // Apply search
    if (search) {
      result = result.filter(p =>
        p.transaction_id.toString().includes(search) ||
        p.risk_level.toLowerCase().includes(search.toLowerCase()) ||
        p.prediction.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortKey) {
        case 'transaction_id': aVal = a.transaction_id; bVal = b.transaction_id; break;
        case 'risk_score': aVal = a.risk_score; bVal = b.risk_score; break;
        case 'probability': aVal = a.probability; bVal = b.probability; break;
        case 'amount': aVal = a.amount ?? 0; bVal = b.amount ?? 0; break;
        case 'confidence': aVal = a.confidence; bVal = b.confidence; break;
        default: aVal = 0; bVal = 0;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [predictions, sortKey, sortOrder, filter, search]);

  const totalPages = Math.ceil(sortedAndFiltered.length / rowsPerPage);
  const paginated = sortedAndFiltered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const highRiskCount = predictions.filter(p => p.risk_level === 'High').length;

  return (
    <GlassCard gradient className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Prediction Results</h3>
        {highRiskCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              {highRiskCount} High Risk Transactions Detected
            </span>
          </motion.div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID, Risk Level, or Prediction..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'High', 'Medium', 'Low', 'Fraud', 'Legitimate'] as FilterKey[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'Fraud' || f === 'Legitimate' ? f : `${f} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">
                <button
                  onClick={() => handleSort('transaction_id')}
                  className="flex items-center gap-1 hover:text-white/60"
                >
                  Transaction ID
                  {sortKey === 'transaction_id' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">Amount</th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">
                Prediction
              </th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">
                <button
                  onClick={() => handleSort('probability')}
                  className="flex items-center gap-1 hover:text-white/60"
                >
                  Fraud Probability
                  {sortKey === 'probability' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">
                <button
                  onClick={() => handleSort('risk_score')}
                  className="flex items-center gap-1 hover:text-white/60"
                >
                  Risk Score
                  {sortKey === 'risk_score' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">Risk Level</th>
              <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">
                <button
                  onClick={() => handleSort('confidence')}
                  className="flex items-center gap-1 hover:text-white/60"
                >
                  Confidence
                  {sortKey === 'confidence' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              {hasClassColumn && (
                <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">Actual vs Predicted</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => (
              <motion.tr
                key={p.transaction_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`border-b border-white/5 last:border-0 ${
                  p.risk_level === 'High' ? 'bg-red-500/5' : p.risk_level === 'Medium' ? 'bg-yellow-500/5' : ''
                }`}
              >
                <td className="py-2.5 px-3 text-white/80 font-mono text-xs">TXN-{p.transaction_id}</td>
                <td className="py-2.5 px-3 text-white/60">{p.amount ? `$${p.amount.toFixed(2)}` : '-'}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    p.prediction === 'Fraud'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {p.prediction === 'Fraud' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {p.prediction}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-white/80">{(p.probability * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80">{p.risk_score.toFixed(1)}</span>
                    <div className="w-12 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.risk_score > 70 ? 'bg-red-400' : p.risk_score > 30 ? 'bg-yellow-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, p.risk_score)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${getRiskBadgeColor(p.risk_level)}`}>
                    {p.risk_level}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-white/60">{p.confidence.toFixed(1)}%</td>
                {hasClassColumn && (
                  <td className="py-2.5 px-3">
                    {p.actual_label && (
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        p.is_correct ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {p.is_correct ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {p.actual_label} {p.is_correct ? '✓' : '✗'}
                      </span>
                    )}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-sm text-white/40">
            {sortedAndFiltered.length} records (Page {page} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                    page === pageNum
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-white/50 hover:text-white/80'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default BatchResultsTable;
