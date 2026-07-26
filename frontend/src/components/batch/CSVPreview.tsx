import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { CSVPreviewData } from '../../types/batchTypes';
import GlassCard from '../ui/GlassCard';

interface CSVPreviewProps {
  data: CSVPreviewData;
}

const CSVPreview: React.FC<CSVPreviewProps> = ({ data }) => {
  return (
    <GlassCard gradient className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">CSV Preview</h3>

      {/* Validation Status */}
      {!data.isValid && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400 mb-1">Validation Errors</p>
              <ul className="list-none space-y-1">
                {data.validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-300">• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Total Records</p>
          <p className="text-xl font-bold text-white">{data.totalRows.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Columns</p>
          <p className="text-xl font-bold text-white">{data.headers.length}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Missing Values</p>
          <p className="text-xl font-bold text-orange-400">{data.missingValues}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Duplicate Rows</p>
          <p className="text-xl font-bold text-yellow-400">{data.duplicateRows}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Class Column</p>
          <p className="text-xl font-bold text-white">
            {data.hasClassColumn ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Column Info Table */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white/60 mb-2">Column Information</h4>
        <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-xs text-white/40 font-medium">Column</th>
                <th className="text-left py-2 px-3 text-xs text-white/40 font-medium">Type</th>
                <th className="text-left py-2 px-3 text-xs text-white/40 font-medium">Missing</th>
                <th className="text-left py-2 px-3 text-xs text-white/40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.columns.map((col, i) => (
                <motion.tr
                  key={col.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-2 px-3 text-white/80">{col.name}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      col.type === 'number' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {col.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white/60">{col.missing}</td>
                  <td className="py-2 px-3">
                    {col.missing > 0 ? (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <AlertTriangle className="w-3 h-3" />
                        Has missing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Preview - First 10 rows */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-2">First 10 Rows</h4>
        <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {data.headers.map((h, i) => (
                  <th key={i} className="text-left py-1.5 px-2 text-xs text-white/30 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-1 px-2 text-white/60 truncate max-w-[100px]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
};

export default CSVPreview;
