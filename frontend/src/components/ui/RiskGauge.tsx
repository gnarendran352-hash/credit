import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  value: number;
  size?: number;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({
  value,
  size = 200,
  label = 'Risk Score',
  showValue = true,
  animated = true,
}) => {
  const radius = (size - 20) / 2;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getRiskColor = (val: number) => {
    if (val >= 80) return { from: '#ef4444', to: '#dc2626', bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400' };
    if (val >= 50) return { from: '#f59e0b', to: '#d97706', bg: 'from-yellow-500/20 to-orange-500/10', text: 'text-yellow-400' };
    return { from: '#10b981', to: '#059669', bg: 'from-emerald-500/20 to-green-500/10', text: 'text-emerald-400' };
  };

  const colors = getRiskColor(value);
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={center}
          cy={center}
        />
        {/* Animated progress circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={animated ? { strokeDashoffset } : { strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#gradient-${label.replace(/\s/g, '-')})`}
          fill="transparent"
          r={normalizedRadius}
          cx={center}
          cy={center}
          style={{ strokeDasharray, strokeDashoffset }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${label.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <div className={`text-4xl font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
              {value.toFixed(1)}
            </div>
          </motion.div>
        )}
        <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};

export default RiskGauge;