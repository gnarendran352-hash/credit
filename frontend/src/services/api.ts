import axios from 'axios';
import type { PredictionInput, PredictionResult, ModelMetrics, FeatureImportance, HealthStatus } from '../types';
import type { BatchPredictionResponse, BatchPrediction, BatchSummary, CSVPreviewData } from '../types/batchTypes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
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
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );

  const rawData = response.data;

  // Map backend response to frontend format
  const predictions: BatchPrediction[] = (rawData.results || []).map((r: any, index: number) => ({
    transaction_id: typeof r.transaction_id === 'string' ? parseInt(r.transaction_id.replace('TXN-', ''), 10) || index + 1 : r.transaction_id || index + 1,
    prediction: r.prediction === 1 ? 'Fraud' : 'Legitimate',
    probability: r.fraud_probability ?? r.probability ?? 0,
    risk_score: r.risk_score ?? 0,
    risk_level: (r.risk_level || 'Low') as 'Low' | 'Medium' | 'High',
    confidence: r.confidence ?? Math.min(95, Math.max(65, 100 - Math.abs((r.risk_score ?? 0) - 50) * 0.5)),
    amount: r.amount,
    time: r.time,
  }));

  const highestRisk = predictions.reduce((max, p) => Math.max(max, p.risk_score), 0);

  const summary: BatchSummary = {
    total_transactions: rawData.total_transactions || predictions.length,
    fraud_count: rawData.fraud_count || predictions.filter(p => p.prediction === 'Fraud').length,
    legitimate_count: rawData.legitimate_count || predictions.filter(p => p.prediction === 'Legitimate').length,
    average_probability: rawData.average_risk
      ? rawData.average_risk / 100
      : predictions.reduce((sum, p) => sum + p.probability, 0) / (predictions.length || 1),
    processing_time: rawData.processing_time_ms
      ? `${(rawData.processing_time_ms / 1000).toFixed(1)} sec`
      : rawData.summary?.processing_time || '0.0 sec',
    highest_risk_score: highestRisk,
  };

  return { summary, predictions };
};

/**
 * Parse CSV file and extract preview data.
 */
export const parseCSVPreview = async (file: File): Promise<CSVPreviewData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const rows = lines.slice(1, 11).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          return values;
        });

        const totalRows = lines.length - 1;
        const requiredCols = ['Time', 'Amount', ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`)];
        const validationErrors: string[] = [];
        const missingCols = requiredCols.filter(col => !headers.includes(col));
        if (missingCols.length > 0) {
          validationErrors.push(`Missing required columns: ${missingCols.join(', ')}`);
        }

        // Detect column types and missing values
        const columns = headers.map((name, idx) => {
          const colValues = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            return vals[idx];
          });
          const nonEmpty = colValues.filter(v => v !== '' && v !== undefined && v !== null);
          const numericCount = nonEmpty.filter(v => !isNaN(Number(v))).length;
          const type = nonEmpty.length > 0 && numericCount === nonEmpty.length ? 'number' : 'string';
          const missing = colValues.filter(v => v === '' || v === undefined || v === null).length;
          return { name, type, missing };
        });

        // Count missing values
        const missingValues = lines.slice(1).reduce((count, line) => {
          const vals = line.split(',').map(v => v.trim());
          return count + vals.filter(v => v === '' || v === undefined || v === null).length;
        }, 0);

        // Count duplicates
        const allRows = lines.slice(1);
        const uniqueRows = new Set(allRows);
        const duplicateRows = allRows.length - uniqueRows.size;

        const hasClassColumn = headers.includes('Class');

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
