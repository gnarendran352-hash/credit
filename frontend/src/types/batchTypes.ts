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
}

export interface BatchSummary {
  total_transactions: number;
  fraud_count: number;
  legitimate_count: number;
  average_probability: number;
  processing_time: string;
  highest_risk_score?: number;
  accuracy?: number;
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
}

export interface BatchResultFull {
  summary: BatchSummary;
  predictions: BatchResultWithClass[];
  csvData: CSVPreviewData;
  fileName: string;
  uploadDate: string;
}
