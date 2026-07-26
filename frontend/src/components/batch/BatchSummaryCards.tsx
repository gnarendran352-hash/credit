import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Timer,
  Target,
} from 'lucide-react';
import type { BatchSummary } from '../../types/batchTypes';
import GlassCard from '../ui/GlassCard';

interface BatchSummaryCardsProps {
  summary: BatchSummary;
  hasClassColumn?: boolean;
  accuracy?: number;
}

const BatchSummaryCards: React.FC<BatchSummaryCardsProps> = ({ summary, hasClassColumn, accuracy }) => {
  const cards = [
    {
      title: 'Total Transactions',
      value: summary.total_transactions.toLocaleString(),
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      valueColor: 'text-white',
    },
    {
      title: 'Fraudulent',
      value: summary.fraud_count.toLocaleString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      valueColor: 'text-red-400',
    },
    {
      title: 'Legitimate',
      value: summary.legitimate_count.toLocaleString(),
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      valueColor: 'text-emerald-400',
    },
    {
      title: 'Avg Fraud Probability',
      value: `${(summary.average_probability * 100).toFixed(2)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      valueColor: 'text-purple-400',
    },
    {
      title: 'Highest Risk Score',
      value: summary.highest_risk_score ? `${summary.highest_risk_score.toFixed(1)}` : 'N/A',
      icon: Target,
      color: 'from-red-500 to-rose-500',
      valueColor: 'text-red-400',
    },
    {
      title: 'Processing Time',
      value: summary.processing_time,
      icon: Timer,
      color: 'from-indigo-500 to-blue-500',
      valueColor: 'text-indigo-400',
    },
  ];

  if (hasClassColumn && accuracy !== undefined) {
    cards.splice(5, 0, {
      title: 'Prediction Accuracy',
      value: `${accuracy.toFixed(2)}%`,
      icon: Shield,
      color: 'from-emerald-500 to-green-500',
      valueColor: 'text-emerald-400',
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-{hasClassColumn ? 7 : 6} gap-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <GlassCard hover glow className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-white/40 font-medium">{card.title}</span>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

export default BatchSummaryCards;
