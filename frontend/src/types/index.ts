export interface PredictionInput {
  time: number;
  amount: number;
  v1: number; v2: number; v3: number; v4: number;
  v5: number; v6: number; v7: number; v8: number;
  v9: number; v10: number; v11: number; v12: number;
  v13: number; v14: number; v15: number; v16: number;
  v17: number; v18: number; v19: number; v20: number;
  v21: number; v22: number; v23: number; v24: number;
  v25: number; v26: number; v27: number; v28: number;
}

export interface PredictionResult {
  prediction: number;
  fraud_probability: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  top_features: { feature: string; importance: number }[];
  prediction_time_ms: number;
  model_used: string;
  explanation: string | Record<string, any>;
  recommended_action: 'approve' | 'review' | 'block';
}

export interface BatchResult {
  total_transactions: number;
  fraud_count: number;
  legitimate_count: number;
  average_risk: number;
  results: {
    transaction_id: string;
    prediction: number;
    fraud_probability: number;
    risk_score: number;
    risk_level: string;
    amount: number;
  }[];
  processing_time_ms: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  model_type: string;
  training_samples: number;
  feature_count: number;
  timestamp: string;
}

export interface FeatureImportance {
  features: { name: string; importance: number }[];
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  predictionCount?: number;
}

export interface PredictionRecord {
  id: string;
  userId: string;
  input: PredictionInput;
  result: PredictionResult;
  timestamp: string;
  amount: number;
  riskScore: number;
  riskLevel: string;
  prediction: number;
}

export interface Notification {
  id: string;
  type: 'fraud_alert' | 'prediction_success' | 'upload_complete' | 'backend_offline' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface Settings {
  theme: ThemeMode;
  predictionThreshold: number;
  notifications: boolean;
}