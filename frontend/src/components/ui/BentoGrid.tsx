import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  span?: 'full' | 'half' | 'third' | 'quarter';
  glow?: boolean;
  gradient?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  delay = 0,
  span = 'full',
  glow = false,
  gradient = 'from-blue-500/10 to-purple-500/10',
}) => {
  const spanClasses = {
    full: 'md:col-span-2 lg:col-span-3',
    half: 'md:col-span-2',
    third: 'lg:col-span-1',
    quarter: 'lg:col-span-1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        relative group overflow-hidden rounded-3xl p-6
        backdrop-blur-xl bg-white/5
        border border-white/10
        shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        bg-gradient-to-br ${gradient}
        hover:border-white/20 transition-all duration-300
        ${spanClasses[span]}
        ${glow ? 'hover:shadow-[0_8px_40px_0_rgba(59,130,246,0.4)]' : ''}
        ${className}
      `}
    >
      {/* Enhanced reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
      
      {/* Top shine line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated glow border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl" />
      </div>
      
      {children}
    </motion.div>
  );
};