import { useState, useCallback } from 'react';
import { batchPredict, parseCSVPreview } from '../services/api';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type {
  BatchPredictionResponse,
  BatchResultWithClass,
  CSVPreviewData,
  BatchResultFull,
} from '../types/batchTypes';
import toast from 'react-hot-toast';

export interface BatchPredictionState {
  file: File | null;
  csvPreview: CSVPreviewData | null;
  predictions: BatchResultWithClass[];
  summary: BatchPredictionResponse['summary'] | null;
  loading: boolean;
  progress: number;
  error: string | null;
  uploadDate: string | null;
}

export const useBatchPrediction = (userId?: string) => {
  const [state, setState] = useState<BatchPredictionState>({
    file: null,
    csvPreview: null,
    predictions: [],
    summary: null,
    loading: false,
    progress: 0,
    error: null,
    uploadDate: null,
  });

  const setFile = useCallback(async (file: File) => {
    try {
      const preview = await parseCSVPreview(file);
      setState(s => ({ ...s, file, csvPreview: preview, error: null }));
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || 'Failed to parse CSV' }));
      toast.error(err.message || 'Failed to parse CSV');
    }
  }, []);

  const clearFile = useCallback(() => {
    setState({
      file: null,
      csvPreview: null,
      predictions: [],
      summary: null,
      loading: false,
      progress: 0,
      error: null,
      uploadDate: null,
    });
  }, []);

  const predict = useCallback(async () => {
    const file = state.file;
    if (!file) {
      toast.error('Please upload a CSV file first');
      return;
    }

    if (!state.csvPreview?.isValid) {
      const confirmed = window.confirm(
        'The CSV file has validation errors. Do you want to continue anyway?'
      );
      if (!confirmed) return;
    }

    setState(s => ({ ...s, loading: true, progress: 0, error: null }));
    toast.loading('Uploading and processing...', { id: 'batch-predict' });

    try {
      const response = await batchPredict(file, (progress) => {
        setState(s => ({ ...s, progress }));
      });

      const hasClass = state.csvPreview?.hasClassColumn ?? false;

      // Parse CSV to get actual Class values if present
      let classValues: (number | undefined)[] = [];
      if (hasClass) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const classIdx = headers.indexOf('Class');
        if (classIdx >= 0) {
          classValues = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim());
            return parseInt(vals[classIdx], 10);
          });
        }
      }

      const predictions: BatchResultWithClass[] = response.predictions.map((p, idx) => {
        const result: BatchResultWithClass = { 
          ...p,
          explanation: typeof p.explanation === 'string' ? p.explanation : undefined,
        };
        if (hasClass && classValues[idx] !== undefined) {
          const actualClass = classValues[idx]!;
          result.actual_class = actualClass;
          result.actual_label = actualClass === 1 ? 'Fraud' : 'Legitimate';
          result.is_correct =
            (result.prediction === 'Fraud' && actualClass === 1) ||
            (result.prediction === 'Legitimate' && actualClass === 0);
        }
        return result;
      });

      let accuracy: number | undefined;
      if (hasClass) {
        const correct = predictions.filter(p => p.is_correct).length;
        accuracy = (correct / predictions.length) * 100;
      }

      const uploadDate = new Date().toISOString();

      setState(s => ({
        ...s,
        predictions,
        summary: { ...response.summary, accuracy },
        uploadDate,
        progress: 100,
      }));

      toast.success(
        `Prediction complete! ${response.summary.fraud_count} fraud transactions detected.`,
        { id: 'batch-predict' }
      );

      if (userId) {
        await saveToFirestore(userId, file.name, response, predictions, uploadDate, accuracy);
      }

      const highRiskCount = predictions.filter(p => p.risk_level === 'High').length;
      if (highRiskCount > 0) {
        toast.error(`${highRiskCount} High Risk Transactions Detected`, { duration: 8000 });
      } else {
        toast.success('No fraud detected! All transactions are legitimate.', {
          icon: '🎉',
          duration: 5000,
        });
      }
    } catch (err: any) {
      const errorMsg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : err.response?.status === 413
          ? 'File too large. Maximum size is 10MB.'
          : err.response?.data?.detail
          ? err.response.data.detail
          : err.message || 'Failed to process batch prediction';

      setState(s => ({ ...s, error: errorMsg, loading: false, progress: 0 }));
      toast.error(errorMsg, { id: 'batch-predict' });
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [state.file, state.csvPreview, userId]);

  const saveToFirestore = async (
    userId: string,
    fileName: string,
    response: BatchPredictionResponse,
    predictions: BatchResultWithClass[],
    uploadDate: string,
    accuracy?: number,
  ) => {
    try {
      await addDoc(collection(db, 'batch_predictions'), {
        userId,
        uploadDate,
        fileName,
        totalRecords: response.summary.total_transactions,
        fraudCount: response.summary.fraud_count,
        legitimateCount: response.summary.legitimate_count,
        averageRisk: response.summary.average_probability,
        processingTime: response.summary.processing_time,
        accuracy,
        predictionSummary: {
          fraudCount: response.summary.fraud_count,
          legitimateCount: response.summary.legitimate_count,
          averageProbability: response.summary.average_probability,
          highestRiskScore: response.summary.highest_risk_score,
        },
        predictions: predictions.slice(0, 100).map(p => ({
          transaction_id: p.transaction_id,
          prediction: p.prediction,
          probability: p.probability,
          risk_score: p.risk_score,
          risk_level: p.risk_level,
          confidence: p.confidence,
        })),
        createdAt: serverTimestamp(),
      });
      toast.success('Results saved to Firestore');
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      toast('Results not saved to Firestore', { icon: '⚠️' });
    }
  };

  const getResultFull = (): BatchResultFull | null => {
    if (!state.summary || !state.csvPreview) return null;
    return {
      summary: state.summary,
      predictions: state.predictions,
      csvData: state.csvPreview,
      fileName: state.file?.name || 'unknown.csv',
      uploadDate: state.uploadDate || '',
    };
  };

  return {
    state,
    setFile,
    clearFile,
    predict,
    getResultFull,
  };
};

export default useBatchPrediction;
