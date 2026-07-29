export interface SimulationState {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  currentIndex: number;
  totalTransactions: number;
  speed: number; // 1x, 2x, 5x, 10x
  batchSize: number;
  startedAt: number | null;
  pausedAt: number | null;
  elapsedMs: number;
}

export interface FeatureAnalysis {
  feature: string;
  description: string;
  value: number;
  expected_range: string;
  deviation: string;
  z_score: number;
  severity: 'critical' | 'high' | 'moderate' | 'normal';
  importance_pct: number;
  anomaly_detail: string;
  icon: string;
}

export interface RiskBreakdown {
  risk_score: number;
  risk_level: string;
  critical_features: number;
  high_features: number;
  moderate_features: number;
}

export interface EnhancedExplanation {
  summary: string;
  feature_analysis: FeatureAnalysis[];
  fraud_indicators: string[];
  anomaly_features: string[];
  recommended_action: 'BLOCK_TRANSACTION' | 'REVIEW_REQUIRED' | 'APPROVE';
  action_reason: string;
  risk_breakdown: RiskBreakdown;
}

export interface LivePrediction {
  transaction_id: number;
  amount: number;
  time: number;
  prediction: 'Fraud' | 'Legitimate';
  fraud_probability: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  top_features?: Array<{ feature: string; importance: number }>;
  explanation?: string | EnhancedExplanation;
  cancelled?: boolean;
  processedAt: number;
  /** Payment status for real-time display */
  paymentStatus?: 'APPROVED' | 'DECLINED' | 'PENDING';
  /** Natural language explanation for UI */
  nlExplanation?: string;
}

export interface LiveStats {
  processedCount: number;
  remainingCount: number;
  fraudCount: number;
  legitimateCount: number;
  cancelledCount: number;
  averageRiskScore: number;
  averageProbability: number;
  currentSpeed: string;
  estimatedTimeRemaining: string;
  transactionsPerMinute: number;
  highRiskCount: number;
  averageConfidence: number;
  totalAmountApproved: number;
  totalAmountBlocked: number;
}

export interface TimeSeriesPoint {
  time: string;
  fraud: number;
  legitimate: number;
  riskScore: number;
  confidence: number;
  cancelled: number;
}

export interface HighRiskTransaction {
  transaction_id: number;
  amount: number;
  fraud_probability: number;
  risk_score: number;
  risk_level: 'High';
  prediction_time: string;
  prediction: 'Fraud';
  explanation?: string | EnhancedExplanation;
}

export interface CSVAnalytics {
  totalRows: number;
  totalColumns: number;
  missingValues: number;
  duplicateRows: number;
  dataQualityScore: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
  medianAmount: number;
  stdAmount: number;
  columnNames: string[];
}

export interface PostPredictionAnalytics {
  fraudPercent: number;
  legitimatePercent: number;
  averageConfidence: number;
  averageProbability: number;
  averageRisk: number;
  highestRisk: number;
  lowestRisk: number;
  mostCommonRiskLevel: string;
  top10HighRisk: HighRiskTransaction[];
  totalAmountApproved: number;
  totalAmountBlocked: number;
  preventedLosses: number;
}

export interface SimulationConfig {
  baseIntervalMs: number; // 100-300ms
  batchSize: number; // 1 or 5 or 10
  maxTransactions: number;
  csvData: number[][] | null;
  csvHeaders: string[];
}

export interface LiveFeedEntry {
  id: string;
  timestamp: string;
  type: 'APPROVED' | 'DECLINED' | 'REVIEW' | 'ALERT';
  amount: number;
  transactionId: number;
  riskScore: number;
  message: string;
  prediction: LivePrediction;
}

export interface BankDecision {
  transaction_id: number;
  risk_score: number;
  risk_level: string;
  decision: 'APPROVE' | 'MANUAL_REVIEW' | 'CANCEL_PAYMENT' | 'FREEZE_ACCOUNT';
  reason: string;
  action_taken: string;
}

export interface TopFraudFeature {
  feature: string;
  count: number;
  avgImportance: number;
}

export interface LiveAnalytics {
  currentFraudRate: number;
  averageTransactionAmount: number;
  highestRiskScore: number;
  topFraudFeatures: TopFraudFeature[];
  mostCommonFraudPattern: string;
  transactionsPerMinute: number;
  predictionSpeed: number;
  estimatedRemaining: string;
}

export interface ExecReport {
  totalTransactions: number;
  approved: number;
  blocked: number;
  manualReview: number;
  fraudPercent: number;
  legitimatePercent: number;
  averageConfidence: number;
  averageRiskScore: number;
  topFraudFeatures: TopFraudFeature[];
  topHighRiskTransactions: HighRiskTransaction[];
  preventedLosses: number;
  totalAmountApproved: number;
  totalAmountBlocked: number;
  simulationDuration: string;
  aiRecommendations: string[];
}