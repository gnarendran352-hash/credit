import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Clock, BarChart3, TrendingUp, Shield, AlertTriangle, CheckCircle, Sparkles, Eye, Printer, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import GlassCard from '../components/ui/GlassCard';
import AdvancedButton from '../components/ui/AdvancedButton';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const reports = [
    { title: 'Daily Fraud Report', date: '2026-07-25', type: 'PDF', size: '2.4 MB', icon: Calendar, status: 'ready', color: 'from-blue-500 to-cyan-500', period: 'daily' },
    { title: 'Weekly Performance Summary', date: '2026-07-21', type: 'PDF', size: '4.8 MB', icon: Clock, status: 'ready', color: 'from-purple-500 to-pink-500', period: 'weekly' },
    { title: 'Monthly Threat Analysis', date: '2026-07-01', type: 'PDF', size: '12.1 MB', icon: BarChart3, status: 'ready', color: 'from-emerald-500 to-teal-500', period: 'monthly' },
    { title: 'Model Evaluation Report', date: '2026-06-30', type: 'PDF', size: '8.3 MB', icon: FileText, status: 'ready', color: 'from-orange-500 to-red-500', period: 'evaluation' },
  ];

  const reportTypes = [
    { period: 'Daily', icon: Calendar, desc: '24-hour fraud detection summary', stats: '12 alerts', gradient: 'from-blue-500/20 to-cyan-500/10', key: 'daily' },
    { period: 'Weekly', icon: Clock, desc: '7-day performance overview', stats: '84 alerts', gradient: 'from-purple-500/20 to-pink-500/10', key: 'weekly' },
    { period: 'Monthly', icon: BarChart3, desc: '30-day comprehensive analysis', stats: '356 alerts', gradient: 'from-emerald-500/20 to-teal-500/10', key: 'monthly' },
    { period: 'Custom', icon: TrendingUp, desc: 'Custom date range report', stats: 'Flexible', gradient: 'from-orange-500/20 to-red-500/10', key: 'custom' },
  ];

  const reportData = {
    daily: {
      title: 'Daily Fraud Report',
      date: '2026-07-25',
      summary: '24-hour fraud detection summary',
      stats: {
        totalTransactions: '284,807',
        fraudDetected: '492',
        accuracyRate: '99.91%',
        riskScore: '45.5',
        alerts: '12',
      },
      details: [
        { label: 'High Risk Transactions', value: '42', color: 'text-red-400' },
        { label: 'Medium Risk Transactions', value: '156', color: 'text-yellow-400' },
        { label: 'Low Risk Transactions', value: '284,609', color: 'text-emerald-400' },
        { label: 'Blocked Transactions', value: '42', color: 'text-red-400' },
      ],
    },
    weekly: {
      title: 'Weekly Performance Summary',
      date: '2026-07-21',
      summary: '7-day performance overview',
      stats: {
        totalTransactions: '1,987,420',
        fraudDetected: '3,456',
        accuracyRate: '99.82%',
        riskScore: '42.3',
        alerts: '84',
      },
      details: [
        { label: 'High Risk Transactions', value: '284', color: 'text-red-400' },
        { label: 'Medium Risk Transactions', value: '1,089', color: 'text-yellow-400' },
        { label: 'Low Risk Transactions', value: '1,985,947', color: 'text-emerald-400' },
        { label: 'Blocked Transactions', value: '284', color: 'text-red-400' },
      ],
    },
    monthly: {
      title: 'Monthly Threat Analysis',
      date: '2026-07-01',
      summary: '30-day comprehensive analysis',
      stats: {
        totalTransactions: '8,942,560',
        fraudDetected: '15,234',
        accuracyRate: '99.83%',
        riskScore: '38.7',
        alerts: '356',
      },
      details: [
        { label: 'High Risk Transactions', value: '1,234', color: 'text-red-400' },
        { label: 'Medium Risk Transactions', value: '4,567', color: 'text-yellow-400' },
        { label: 'Low Risk Transactions', value: '8,921,659', color: 'text-emerald-400' },
        { label: 'Blocked Transactions', value: '1,234', color: 'text-red-400' },
      ],
    },
    evaluation: {
      title: 'Model Evaluation Report',
      date: '2026-06-30',
      summary: 'Model performance and accuracy metrics',
      stats: {
        totalTransactions: '284,807',
        fraudDetected: '492',
        accuracyRate: '99.91%',
        riskScore: '45.5',
        alerts: 'N/A',
      },
      details: [
        { label: 'Precision', value: '94.23%', color: 'text-blue-400' },
        { label: 'Recall', value: '85.17%', color: 'text-purple-400' },
        { label: 'F1 Score', value: '89.45%', color: 'text-cyan-400' },
        { label: 'ROC-AUC', value: '0.9762', color: 'text-emerald-400' },
      ],
    },
  };

  const generatePDF = (period: string) => {
    const data = reportData[period as keyof typeof reportData] || reportData.daily;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 15, 30);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title, 20, 22);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.summary} - Generated: ${new Date().toLocaleString()}`, 20, 33);

    // Summary box
    doc.setDrawColor(100, 100, 150);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, 50, pageWidth - 40, 45, 3, 3, 'S');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('REPORT SUMMARY', 25, 60);
    doc.setTextColor(180, 180, 200);
    doc.setFontSize(9);
    const statEntries = Object.entries(data.stats);
    statEntries.forEach(([, value], i) => {
      const label = Object.keys(data.stats)[i];
      doc.text(`${label}: ${value}`, 25, 72 + i * 6);
    });

    // Details section
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED METRICS', 20, 110);

    let yPos = 120;
    data.details.forEach((detail) => {
      doc.setDrawColor(60, 60, 80);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, yPos, pageWidth - 40, 12, 2, 2, 'S');
      doc.setTextColor(180, 180, 200);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(detail.label, 25, yPos + 8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.value, pageWidth - 25, yPos + 8, { align: 'right' });
      yPos += 16;
    });

    // Footer
    doc.setDrawColor(100, 100, 150);
    doc.setLineWidth(0.5);
    doc.line(20, 270, pageWidth - 20, 270);
    doc.setTextColor(120, 120, 140);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CreditGuard AI - Fraud Detection System', 20, 278);
    doc.text('Page 1 - Confidential', pageWidth - 20, 278, { align: 'right' });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${data.date}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = (period: string) => {
    setGenerating(period);
    setTimeout(() => {
      generatePDF(period);
      setGenerating(null);
    }, 500);
  };

  const handleGenerate = (period: string) => {
    handleDownload(period);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Reports</h1>
          <p className="text-white/40 mt-1">Generate and download analysis reports</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">{reports.length} Reports Available</span>
        </div>
      </motion.div>

      {/* Report Generation Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((item, i) => (
          <motion.div
            key={item.period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <GlassCard hover glow gradient>
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl pointer-events-none`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.period} Report</h3>
                <p className="text-sm text-white/50 mb-3">{item.desc}</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">{item.stats}</span>
                </div>
                <AdvancedButton
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  icon={generating === item.key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  onClick={() => handleGenerate(item.key)}
                  disabled={generating === item.key}
                >
                  {generating === item.key ? 'Generating...' : 'Generate & Download PDF'}
                </AdvancedButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <GlassCard gradient>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
              <p className="text-xs text-white/40">Previously generated reports</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              onClick={() => setSelectedReport(selectedReport === report.title ? null : report.title)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{report.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40">{report.date}</span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/40">{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  {report.type}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedReport(report.title); }}
                  className="p-2.5 rounded-lg bg-white/5 text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleDownload(report.period); }}
                  className="p-2.5 rounded-lg bg-white/5 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Report Preview Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedReport}</h3>
                    <p className="text-xs text-white/40">Report Preview</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">×</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Report Summary</h4>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Verified</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Transactions', value: '284,807', icon: BarChart3 },
                      { label: 'Fraud Detected', value: '492', icon: AlertTriangle },
                      { label: 'Accuracy Rate', value: '99.91%', icon: CheckCircle },
                      { label: 'Risk Score', value: '45.5', icon: TrendingUp },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <stat.icon className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-white/40">{stat.label}</p>
                          <p className="text-sm font-semibold text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <AdvancedButton
                    variant="gradient"
                    size="md"
                    className="flex-1"
                    icon={generating === selectedReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    onClick={() => {
                      const report = reports.find(r => r.title === selectedReport);
                      if (report) handleDownload(report.period);
                    }}
                  >
                    {generating ? 'Generating...' : 'Download Report'}
                  </AdvancedButton>
                  <AdvancedButton variant="secondary" size="md" icon={<Printer className="w-4 h-4" />}>
                    Print
                  </AdvancedButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
