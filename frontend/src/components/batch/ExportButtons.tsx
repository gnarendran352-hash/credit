import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import type { BatchResultWithClass } from '../../types/batchTypes';
import type { BatchSummary } from '../../types/batchTypes';
import toast from 'react-hot-toast';

interface ExportButtonsProps {
  predictions: BatchResultWithClass[];
  summary: BatchSummary;
  fileName: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ predictions, summary, fileName }) => {
  const downloadCSV = () => {
    const headers = [
      'Transaction ID',
      'Prediction',
      'Fraud Probability',
      'Risk Score',
      'Risk Level',
      'Confidence',
      'Amount',
      ...(predictions[0]?.actual_label ? ['Actual Class', 'Is Correct'] : []),
    ];

    const rows = predictions.map(p => [
      p.transaction_id,
      p.prediction,
      (p.probability * 100).toFixed(4),
      p.risk_score.toFixed(2),
      p.risk_level,
      p.confidence.toFixed(2),
      p.amount ?? '',
      ...(p.actual_label ? [p.actual_label, p.is_correct ? 'Yes' : 'No'] : []),
    ]);

    const csvContent =
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_predictions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  const downloadHighRiskCSV = () => {
    const highRisk = predictions.filter(p => p.risk_level === 'High');
    if (highRisk.length === 0) {
      toast('No high-risk transactions found', { icon: 'ℹ️' });
      return;
    }

    const headers = ['Transaction ID', 'Prediction', 'Fraud Probability', 'Risk Score', 'Risk Level', 'Confidence', 'Amount'];
    const rows = highRisk.map(p => [
      p.transaction_id,
      p.prediction,
      (p.probability * 100).toFixed(4),
      p.risk_score.toFixed(2),
      p.risk_level,
      p.confidence.toFixed(2),
      p.amount ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_high_risk.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`High-risk CSV downloaded (${highRisk.length} transactions)`);
  };

  const downloadPDF = () => {
    const reportContent = `
Credit Card Fraud Detection - Batch Prediction Report
=====================================================
File: ${fileName}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Total Transactions: ${summary.total_transactions}
Fraudulent: ${summary.fraud_count}
Legitimate: ${summary.legitimate_count}
Average Fraud Probability: ${(summary.average_probability * 100).toFixed(2)}%
Highest Risk Score: ${summary.highest_risk_score?.toFixed(2) ?? 'N/A'}
Processing Time: ${summary.processing_time}

HIGH RISK TRANSACTIONS
----------------------
${predictions.filter(p => p.risk_level === 'High').map(p =>
  `  TXN-${p.transaction_id}: Risk ${p.risk_score.toFixed(1)} (${p.probability.toFixed(4)} probability)`
).join('\n') || '  None'}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PDF report downloaded');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadCSV}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Download CSV
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadHighRiskCSV}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 transition-all"
      >
        <Download className="w-4 h-4" />
        Export High Risk Only
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/80 rounded-xl hover:bg-white/10 transition-all"
      >
        <FileText className="w-4 h-4" />
        Download Report
      </motion.button>
    </div>
  );
};

export default ExportButtons;
