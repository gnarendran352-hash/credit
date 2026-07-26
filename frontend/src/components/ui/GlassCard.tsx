import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  glow = false,
  gradient = false,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6
        backdrop-blur-xl bg-white/5
        border border-white/10
        shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        ${hover ? 'cursor-pointer transition-all duration-300' : ''}
        ${glow ? 'hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.3)]' : ''}
        ${gradient ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02]' : ''}
        ${className}
      `}
    >
      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      {/* Shine effect */}
      <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default GlassCard;