import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Clock, BarChart3 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const Reports: React.FC = () => {
  const reports = [
    { title: 'Daily Fraud Report', date: '2026-07-25', type: 'PDF', size: '2.4 MB', icon: Calendar },
    { title: 'Weekly Performance Summary', date: '2026-07-21', type: 'PDF', size: '4.8 MB', icon: Clock },
    { title: 'Monthly Threat Analysis', date: '2026-07-01', type: 'PDF', size: '12.1 MB', icon: BarChart3 },
    { title: 'Model Evaluation Report', date: '2026-06-30', type: 'PDF', size: '8.3 MB', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-white/40 mt-1">Generate and download analysis reports</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Daily', 'Weekly', 'Monthly', 'Custom'].map((period, i) => (
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard hover glow gradient>
              <h3 className="text-lg font-semibold text-white mb-2">{period} Report</h3>
              <p className="text-sm text-white/40 mb-4">Generate a {period.toLowerCase()} fraud analysis report</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Generate
              </motion.button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard gradient>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <report.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{report.title}</p>
                  <p className="text-xs text-white/40">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 px-2 py-1 rounded-md bg-white/5">{report.type}</span>
                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-blue-400 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Reports;