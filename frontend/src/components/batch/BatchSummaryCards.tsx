import React, { useEffect, useRef, useState } from 'react';
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

const AnimatedCounter: React.FC<{ value: string | number; duration?: number }> = ({ value, duration = 2 }) => {
  const [display, setDisplay] = useState<string | number>(typeof value === 'string' ? value : value);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      setDisplay(String(value));
      return;
    }

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const current = progress * numericValue;
      const formatted = Number.isInteger(numericValue)
        ? String(Math.floor(current))
        : current.toFixed(2);
      setDisplay(formatted);
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      } else {
        setDisplay(Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2));
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration]);

  return <>{display}</>;
};

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
      raw: summary.total_transactions,
    },
    {
      title: 'Fraudulent',
      value: summary.fraud_count.toLocaleString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      valueColor: 'text-red-400',
      raw: summary.fraud_count,
    },
    {
      title: 'Legitimate',
      value: summary.legitimate_count.toLocaleString(),
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      valueColor: 'text-emerald-400',
      raw: summary.legitimate_count,
    },
    {
      title: 'Avg Fraud Probability',
      value: `${(summary.average_probability * 100).toFixed(2)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      valueColor: 'text-purple-400',
      raw: `${(summary.average_probability * 100).toFixed(2)}%`,
    },
    {
      title: 'Highest Risk Score',
      value: summary.highest_risk_score ? `${summary.highest_risk_score.toFixed(1)}` : 'N/A',
      icon: Target,
      color: 'from-red-500 to-rose-500',
      valueColor: 'text-red-400',
      raw: summary.highest_risk_score ?? 0,
    },
    {
      title: 'Lowest Risk Score',
      value: summary.lowest_risk_score ? `${summary.lowest_risk_score.toFixed(1)}` : 'N/A',
      icon: Shield,
      color: 'from-emerald-500 to-green-500',
      valueColor: 'text-emerald-400',
      raw: summary.lowest_risk_score ?? 0,
    },
    {
      title: 'Average Risk Score',
      value: `${summary.average_risk_score.toFixed(1)}`,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
      valueColor: 'text-orange-400',
      raw: summary.average_risk_score,
    },
    {
      title: 'Processing Time',
      value: summary.processing_time,
      icon: Timer,
      color: 'from-indigo-500 to-blue-500',
      valueColor: 'text-indigo-400',
      raw: summary.processing_time,
    },
  ];

  if (hasClassColumn && accuracy !== undefined) {
    cards.splice(5, 0, {
      title: 'Prediction Accuracy',
      value: `${accuracy.toFixed(2)}%`,
      icon: Shield,
      color: 'from-emerald-500 to-green-500',
      valueColor: 'text-emerald-400',
      raw: `${accuracy.toFixed(2)}%`,
    });
  }

  const gridCols = hasClassColumn ? 'lg:grid-cols-8' : 'lg:grid-cols-6';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4 mb-6`}>
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
            <p className={`text-2xl font-bold ${card.valueColor}`}>
              <AnimatedCounter value={card.raw} />
            </p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

export default BatchSummaryCards;