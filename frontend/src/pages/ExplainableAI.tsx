import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Info, Lightbulb, TrendingUp } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { getFeatureImportance } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ExplainableAI: React.FC = () => {
  const [features, setFeatures] = useState<any>(null);

  useEffect(() => {
    getFeatureImportance().then(setFeatures).catch(() => {});
  }, []);

  const topFeatures = features?.features?.slice(0, 15) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Explainable AI</h1>
        </div>
        <p className="text-white/40 mt-1">Understand how the model makes predictions</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">Top 15 Feature Contributions</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeatures} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="importance" radius={[0, 8, 8, 0]} animationDuration={1500}>
                  {topFeatures.map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${220 - i * 8}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Explanation */}
        <GlassCard gradient>
          <h3 className="text-lg font-semibold text-white mb-4">How Predictions Work</h3>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Model Type</span>
              </div>
              <p className="text-sm text-white/60">Random Forest Classifier with 100 decision trees trained on 284,807 labeled transactions.</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Key Insight</span>
              </div>
              <p className="text-sm text-white/60">
                Features V14, V17, and V12 are the strongest indicators of fraud. These represent principal components derived from the original transaction data.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Interpretation</span>
              </div>
              <p className="text-sm text-white/60">
                When V14 and V17 values deviate significantly from normal ranges, the model assigns higher fraud probability. The model explains each prediction by highlighting which features contributed most to the decision.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Example Explanation</span>
              </div>
              <p className="text-sm text-white/60 italic">
                "The model identified unusual behaviour because V14 and V17 strongly match historical fraudulent transaction patterns."
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ExplainableAI;