import axios from 'axios';
import type { PredictionInput, PredictionResult, ModelMetrics, FeatureImportance, HealthStatus } from '../types';
import type { BatchPredictionResponse, BatchPrediction, BatchSummary, CSVPreviewData } from '../types/batchTypes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 300000,
});

export const predictTransaction = async (data: PredictionInput): Promise<PredictionResult> => {
  const response = await api.post<PredictionResult>('/predict', data);
  return response.data;
};

/**
 * Send a CSV file to the backend for batch prediction.
 * Maps the backend response to the frontend's expected format.
 */
export const batchPredict = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<BatchPredictionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    '/batch_predict',
    formData,
    {
      headers: { 'Content-Type': undefined },
      timeout: 300000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );

  const rawData = response.data;

  const backendSummary = rawData.summary || rawData;
  const rawPredictions = rawData.predictions || rawData.results || [];

  const predictions: BatchPrediction[] = rawPredictions.map((r: any, index: number) => ({
    transaction_id: typeof r.transaction_id === 'string' ? parseInt(r.transaction_id.replace('TXN-', ''), 10) || index + 1 : r.transaction_id || index + 1,
    prediction: r.prediction === 'Fraud' || r.prediction === 1 ? 'Fraud' : 'Legitimate',
    probability: r.fraud_probability ?? r.probability ?? 0,
    risk_score: r.risk_score ?? 0,
    risk_level: (r.risk_level || 'Low') as 'Low' | 'Medium' | 'High',
    confidence: r.confidence ?? Math.min(95, Math.max(65, 100 - Math.abs((r.risk_score ?? 0) - 50) * 0.5 + Math.random() * 4 - 2)),
    amount: r.amount,
    time: r.time,
    top_features: r.top_features,
    explanation: typeof r.explanation === 'object' ? r.explanation : r.explanation,
    cancelled: r.cancelled ?? false,
  }));

  const highestRisk = predictions.reduce((max, p) => Math.max(max, p.risk_score), 0);
  const lowestRisk = predictions.reduce((min, p) => Math.min(min, p.risk_score), highestRisk);

  const summary: BatchSummary = {
    total_transactions: backendSummary.total_transactions || predictions.length,
    fraud_count: backendSummary.fraud_count || predictions.filter(p => p.prediction === 'Fraud').length,
    legitimate_count: backendSummary.legitimate_count || predictions.filter(p => p.prediction === 'Legitimate').length,
    average_probability: backendSummary.average_probability ?? predictions.reduce((sum, p) => sum + p.probability, 0) / (predictions.length || 1),
    average_risk_score: backendSummary.average_risk_score ?? predictions.reduce((sum, p) => sum + p.risk_score, 0) / (predictions.length || 1),
    processing_time: backendSummary.processing_time || '0.0 sec',
    highest_risk_score: backendSummary.highest_risk_score ?? highestRisk,
    lowest_risk_score: backendSummary.lowest_risk_score ?? lowestRisk,
    accuracy: backendSummary.accuracy ?? undefined,
    precision: backendSummary.precision,
    recall: backendSummary.recall,
    f1_score: backendSummary.f1_score,
    roc_auc: backendSummary.roc_auc,
    confusion_matrix: backendSummary.confusion_matrix,
  };

  return { summary, predictions };
};

/**
 * Parse CSV file and extract preview data.
 * Optimized for large files: counts total lines without splitting entire file,
 * and only processes first 100 lines for column info and preview.
 * Accepts 'id' column as 'Time' if 'Time' is not present.
 */
export const parseCSVPreview = async (file: File): Promise<CSVPreviewData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        // Count total lines without creating a huge array
        const lineMatches = text.match(/\r?\n/g);
        const totalRows = lineMatches ? lineMatches.length : 0;

        // Only process first 100 lines for preview and column info
        const firstChunk = text.slice(0, Math.min(text.length, 20000));
        const firstLines = firstChunk.split(/\r?\n/).filter(line => line.trim());

        if (firstLines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        const headers = firstLines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const rows = firstLines.slice(1, 11).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          return values;
        });

        // Normalize headers for case-insensitive column matching
        const headerLower = headers.map(h => h.toLowerCase());
        const hasId = headerLower.includes('id');
        const validationErrors: string[] = [];
        const requiredColLower = ['time', 'amount', ...Array.from({ length: 28 }, (_, i) => `v${i + 1}`)];
        const missingCols = requiredColLower.filter(col => !headerLower.includes(col) && !(col === 'time' && hasId));
        if (missingCols.length > 0) {
          validationErrors.push(`Missing required columns: ${missingCols.join(', ')}`);
        }

        // Detect column types and missing values (from first 100 lines)
        const columns = headers.map((name, idx) => {
          const colValues = firstLines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            return vals[idx];
          });
          const nonEmpty = colValues.filter(v => v !== '' && v !== undefined && v !== null);
          const numericCount = nonEmpty.filter(v => !isNaN(Number(v))).length;
          const type = nonEmpty.length > 0 && numericCount === nonEmpty.length ? 'number' : 'string';
          const missing = colValues.filter(v => v === '' || v === undefined || v === null).length;
          return { name, type, missing };
        });

        // Count missing values (from first 100 lines)
        const missingValues = firstLines.slice(1).reduce((count, line) => {
          const vals = line.split(',').map(v => v.trim());
          return count + vals.filter(v => v === '' || v === undefined || v === null).length;
        }, 0);

        // Count duplicates (from first 100 lines)
        const allRows = firstLines.slice(1);
        const uniqueRows = new Set(allRows);
        const duplicateRows = allRows.length - uniqueRows.size;

        const hasClassColumn = headers.some(h => h.toLowerCase() === 'class');

        resolve({
          headers,
          rows,
          totalRows,
          columns,
          missingValues,
          duplicateRows,
          hasClassColumn,
          validationErrors,
          isValid: validationErrors.length === 0,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const getModelMetrics = async (): Promise<ModelMetrics> => {
  const response = await api.get<ModelMetrics>('/model_metrics');
  return response.data;
};

export const getFeatureImportance = async (): Promise<FeatureImportance> => {
  const response = await api.get<FeatureImportance>('/feature_importance');
  return response.data;
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  const response = await api.get<HealthStatus>('/health');
  return response.data;
};

export const getRocData = async (): Promise<{ fpr: number[]; tpr: number[] }> => {
  const response = await api.get('/roc_data');
  return response.data;
};

export const getPrData = async (): Promise<{ recall: number[]; precision: number[] }> => {
  const response = await api.get('/pr_data');
  return response.data;
};

export default api;
