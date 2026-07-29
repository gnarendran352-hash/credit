// Batch Prediction Types

export interface BatchPrediction {
  transaction_id: number;
  prediction: 'Fraud' | 'Legitimate';
  probability: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  amount?: number;
  time?: number;
  top_features?: Array<{ feature: string; importance: number }>;
  explanation?: string | Record<string, any>;
  cancelled?: boolean;
}

export interface BatchSummary {
  total_transactions: number;
  fraud_count: number;
  legitimate_count: number;
  average_probability: number;
  average_risk_score: number;
  processing_time: string;
  highest_risk_score?: number;
  lowest_risk_score?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  roc_auc?: number;
  confusion_matrix?: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
}

export interface BatchPredictionResponse {
  summary: BatchSummary;
  predictions: BatchPrediction[];
}

export interface CSVColumnInfo {
  name: string;
  type: string;
  missing: number;
}

export interface CSVPreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  columns: CSVColumnInfo[];
  missingValues: number;
  duplicateRows: number;
  hasClassColumn: boolean;
  validationErrors: string[];
  isValid: boolean;
}

export interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error: string | null;
}

export interface BatchResultWithClass extends BatchPrediction {
  actual_class?: number;
  actual_label?: 'Fraud' | 'Legitimate';
  is_correct?: boolean;
  top_features?: Array<{ feature: string; importance: number }>;
  explanation?: string;
}

export interface BatchResultFull {
  summary: BatchSummary;
  predictions: BatchResultWithClass[];
  csvData: CSVPreviewData;
  fileName: string;
  uploadDate: string;
}
